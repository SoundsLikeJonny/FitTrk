/**
 * customFetch — single network layer for all generated API hooks. Edit
 * only to change auth scheme. Never edit anything under src/api/generated/
 * — orval overwrites it on every codegen run.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Strip trailing slash — EXPO_PUBLIC_API_URL sometimes ships with one,
// and "host//api/foo" trips NestJS routing.
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const TOKEN_KEY = process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY ?? 'auth_token';

export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** Why the request never reached the API. */
export type BackendUnavailableReason = 'asleep' | 'network' | 'gateway';

/**
 * The request never reached the API. Thrown instead of ApiError when the answer is an HTML
 * page (the platform serves "Preview URL Unavailable" as HTTP 404 + HTML while the app
 * that owns this API is asleep; a framework 404 page means the host does not serve this
 * route) or when fetch itself failed. Screens should show `.message` as-is: it says what is
 * wrong instead of a misleading "not found".
 */
export class BackendUnavailableError extends ApiError {
  reason: BackendUnavailableReason;
  constructor(status: number, body: unknown, reason: BackendUnavailableReason) {
    const message =
      reason === 'asleep'
        ? 'The backend is asleep — the service that serves this API is not running right now. Please try again in a moment.'
        : reason === 'network'
          ? 'Could not reach the server. Check your connection and try again.'
          : status === 404
            // A framework 404 page: the route is not served, so retrying cannot help.
            ? 'This feature is not available on the server.'
            : 'The server did not answer this request. Please try again in a moment.';
    super(status, body, message);
    this.name = 'BackendUnavailableError';
    this.reason = reason;
  }
}

export function isBackendUnavailable(e: unknown): e is BackendUnavailableError {
  return e instanceof BackendUnavailableError;
}

/**
 * Use in catch blocks — under strict tsc, caught vars are `unknown`,
 * so direct `e.message`/`e.body` access fails TS18046.
 */
export function getErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  if (e instanceof ApiError) {
    // Backends disagree on the field name (`message` vs `error`); accept either.
    const body = e.body as { message?: unknown; error?: unknown } | undefined;
    const fromBody = [body?.message, body?.error].find((v) => typeof v === 'string' && v.trim() !== '');
    return (fromBody as string | undefined) ?? e.message ?? fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

// An HTML document where JSON was expected: something in front of the API answered, not the API.
function looksLikeHtml(contentType: string, raw: string): boolean {
  return contentType.toLowerCase().includes('text/html') || /^\s*<(!doctype|html)/i.test(raw);
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Ensure exactly one slash between BASE_URL and url.
  const fullUrl = url.startsWith('http')
    ? url
    : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetch(fullUrl, { ...options, headers });
  } catch (e) {
    // "Failed to fetch" / "Network request failed": nothing answered at all.
    throw new BackendUnavailableError(0, e instanceof Error ? e.message : String(e), 'network');
  }
  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    if (looksLikeHtml(response.headers.get('content-type') ?? '', raw)) {
      throw new BackendUnavailableError(
        response.status, raw.slice(0, 300), /Preview URL/i.test(raw) ? 'asleep' : 'gateway');
    }
    let body: unknown = raw;
    try { body = JSON.parse(raw); } catch { /* keep as text */ }
    throw new ApiError(response.status, body);
  }
  if (response.status === 204 || response.status === 304) {
    return null as T;
  }
  return response.json() as Promise<T>;
}

export type StreamHandlers = {
  /** One SSE event: the joined `data:` lines, plus the `event:` name when the server sends one. */
  onEvent: (data: string, event?: string) => void;
  onError?: (error: ApiError) => void;
  onDone?: () => void;
};

function emitSseBlock(block: string, onEvent: StreamHandlers['onEvent']): void {
  let event: string | undefined;
  const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    else if (line.startsWith('event:')) event = line.slice(6).trim();
  }
  if (data.length) onEvent(data.join('\n'), event);
}

/**
 * Read a text/event-stream endpoint. Use this for every endpoint API_REFERENCE.md marks
 * STREAMING, never `fetch()` + `response.body.getReader()`.
 *
 * React Native's JS engine (Hermes) has no ReadableStream, so `response.body` is always
 * null on a device. That code only appears to work in the web preview, which is a browser.
 * XMLHttpRequest is delivered incrementally on device, which is why this is built on it.
 * Two details are load-bearing:
 *  - `onreadystatechange` is assigned BEFORE `send()`. React Native decides at send time
 *    whether to deliver incrementally; a handler attached later gets one buffered response.
 *  - `responseType` is never set. Its default maps to native 'text', which is what the
 *    native layer requires to deliver chunks as they arrive.
 */
export function customFetchStream(
  url: string,
  options: RequestInit = {},
  handlers: StreamHandlers,
): { abort: () => void } {
  const fullUrl = url.startsWith('http')
    ? url
    : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  let xhr: XMLHttpRequest | null = null;
  let aborted = false;

  void (async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
    if (aborted) return;
    const request = new XMLHttpRequest();
    xhr = request;
    let seen = 0;
    let buffer = '';
    let finished = false;

    const drain = () => {
      const text = request.responseText ?? '';
      buffer += text.substring(seen);
      seen = text.length;
      // Events end at a blank line; the trailing partial event waits for more data.
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? '';
      for (const block of blocks) emitSseBlock(block, handlers.onEvent);
    };

    request.open((options.method as string) ?? 'GET', fullUrl, true);
    request.setRequestHeader('Accept', 'text/event-stream');
    const extra = (options.headers as Record<string, string> | undefined) ?? {};
    for (const [name, value] of Object.entries(extra)) request.setRequestHeader(name, value);
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);

    request.onreadystatechange = () => {
      // An abort clears responseText, so never read it afterwards: doing so would discard
      // everything already delivered.
      if (aborted || finished) return;
      const ok = request.status >= 200 && request.status < 300;
      if (request.readyState === 3 && ok) drain();
      if (request.readyState === 4) {
        finished = true;
        if (request.status === 0) {
          handlers.onError?.(new BackendUnavailableError(0, '', 'network'));
          return;
        }
        if (!ok) {
          handlers.onError?.(new ApiError(request.status, request.responseText));
          return;
        }
        drain();
        if (buffer.trim()) emitSseBlock(buffer, handlers.onEvent);
        buffer = '';
        handlers.onDone?.();
      }
    };
    request.send((options.body as string | undefined) ?? null);
  })();

  return {
    abort: () => {
      aborted = true;
      xhr?.abort();
    },
  };
}