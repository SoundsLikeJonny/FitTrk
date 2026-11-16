# AGENTS.md

## Project

FitTrk / FitTracker: a workout + nutrition tracker. The web app is Next.js 16.4.1 (App Router,
React 19.2.8, TypeScript 5.6.3 strict) with Prisma 7 on PostgreSQL, NextAuth v5 beta, Tailwind 3.4
and shadcn/ui. `mobile/` is an Expo 54 / React Native 0.81 app that has **no backend of its own** —
it calls the web app's `/api/*` routes with a bearer token. Node `>=20.19.0`.

## Commands

Run from the repo root unless noted.

```bash
npm install --no-audit --no-fund --legacy-peer-deps   # root install (CI + Vercel use this)
npm run dev            # next dev
npm run build          # next build
npm start              # next start
npm run lint           # eslint . — currently exits 1 on pre-existing errors (see Gotchas)
npx eslint app/api/foods/route.ts   # lint one file instead of the whole repo
npx eslint -c eslint.ssr.config.mjs .   # SSR/hydration-safety lint (also run by the platform after builds)
npx tsc --noEmit 2>&1 | grep -v '^mobile/'   # web type check — the build ignores TS errors (see Gotchas)
cd mobile && npx tsc --noEmit                 # mobile type check (clean)
npx prisma generate
npx prisma db push     # this repo has no prisma/migrations; schema is pushed, not migrated
npx prisma db seed     # prisma.config.ts -> tsx scripts/safe-seed.ts -> scripts/seed.ts
node scripts/auth-smoke.mjs [email] [password]   # against a running dev server
```

Mobile (`mobile/`):

```bash
yarn install           # Yarn 4 via Corepack; mobile/yarn.lock is committed
yarn start             # expo start
yarn android           # expo start --android
yarn ios               # expo start --ios
yarn web               # expo start --web
npx expo prebuild --platform android --no-install --clean   # generates gitignored mobile/android
```

API client codegen (only when `openapi.json` changes):

```bash
mkdir -p mobile/.api && cp openapi.json mobile/.api/openapi.json
cd mobile && npx orval     # writes src/api/generated/** from orval.config.ts
```

There is no test script or test runner configured in either package.

## Layout

- `app/(app)/` — authenticated tab pages (`today`, `stats`, `workouts`, `history`, `settings`, `foods`); `layout.tsx` guards with `auth()` and renders `BottomNav` + `ActiveWorkoutBanner`.
- `app/session/[id]/`, `app/scan/`, `app/login/`, `app/signup/` — full-screen flows outside the tab shell.
- `app/api/` — route handlers; `app/api/mobile-auth/**` is platform-managed.
- `auth.ts` — NextAuth config (Google + credentials, JWT sessions); `proxy.ts` — Next 16 request proxy that bridges mobile bearer tokens.
- `lib/` — `db.ts` (Prisma + pg adapter), `nutrition.ts` (macro/target math), `s3.ts`/`aws-config.ts`, `mobile-auth.ts`/`mobile-bridge.ts` (system-managed), `utils.ts` (`cn`, `localDateStr`, `formatDuration`).
- `components/ui/` — shadcn primitives; `components/layouts/` — `Container`, `Section`, `PageHeader`, `AppShell`, `AuthLayout`; `components/client-only.tsx` + `safe-format.tsx` — SSR-safe primitives.
- `prisma/schema.prisma` — data model; `scripts/` — seed + auth smoke test.
- `mobile/app/` — expo-router screens; `mobile/src/api/generated/` — generated client (never edit); `mobile/src/api/customFetch.ts` — auth header + SSE transport.
- `.github/workflows/` — active CI; `ci/github-workflows/` — staged duplicate (see Gotchas).

## Conventions

- Import via the `@/*` alias (`@/lib/db`, `@/components/ui/button`). Server components by default; add `'use client'` only for hooks/browser APIs.
- Route handlers begin with `export const dynamic = 'force-dynamic'` **before** the imports, then `const session = await auth()` and a `401` when `!session?.user?.id`. Every Prisma query is scoped to `session.user.id`.
- Next 16 dynamic params are async: `{ params }: { params: Promise<{ id: string }> }` and `const { id } = await params`.
- Web pages fetch with plain `fetch('/api/...')` inside `useEffect`/handlers — no react-query/SWR on web. Mobile uses the generated react-query hooks through `customFetch`.
- Style with design tokens (`bg-card`, `text-muted-foreground`, `border-border`); never hardcode colors. Fonts: `font-sans` (DM Sans), `font-display` (Plus Jakarta Sans), `font-mono` (JetBrains Mono). See `STYLE_GUIDE.md`.
- Never read `window`/`localStorage` at module scope or seed state with `Date.now()`/`Math.random()`; use `ClientOnly`, `useMounted`, `SafeDate`, `SafeNumber`.
- Dates for daily logs use `localDateStr()` (client-local), not UTC ISO slices.
- Commit messages use conventional prefixes: `feat:`, `fix:`, `ci:`, `chore:`.
- Do not edit system-managed files: `lib/mobile-auth.ts`, `lib/mobile-bridge.ts`, `app/api/mobile-auth/**`, `instrumentation-client.js`, `mobile/src/api/generated/**`, `mobile/orval.config.ts`.

## Gotchas

- `npm run lint` is not a clean gate: `eslint .` also scans `public/abacus-viz/*.js` (minified vendor bundles) and `mobile/src/api/generated/**`, and currently reports ~201 errors / ~4.5k warnings, including `tailwind.config.ts` (`no-require-imports`). Lint the files you touched, or diff against that baseline.
- `next.config.js` sets `typescript.ignoreBuildErrors: true`, so `npm run build` passes with type errors. Run the `tsc` commands above before claiming a change compiles. Root `tsconfig.json` includes `**/*.ts`, so it also pulls in `mobile/` and reports ~68 spurious `TS2307` errors there (mobile's `@/*` alias resolves against `mobile/`); filter them out or check `mobile/` separately. `app/api/scan-label/route.ts` has a pre-existing `FormData.get` type error.
- Next 16 uses `proxy.ts`, not `middleware.ts`. It must keep skipping `/api/auth/*` or mobile Google sign-in breaks.
- Prisma 7 keeps no URL in `schema.prisma`: the CLI reads `DIRECT_URL || DATABASE_URL` from `prisma.config.ts`, the app passes `DATABASE_URL` to `PrismaPg` in `lib/db.ts`. `vercel.json` runs `prisma db push --accept-data-loss` on every deploy.
- Root `yarn.lock` is gitignored and `.yarnrc.yml` points at a host-specific `globalFolder`, so root installs use npm. `mobile/` uses committed Yarn 4.
- Two workflow copies exist: `.github/workflows/*` (active, Node 20 actions) and `ci/github-workflows/*` (staged, Node 24 action versions). Edit both or they drift. The `sed` that strips a Prisma `output` path in `web-ci.yml` is now a no-op.
- `auth.ts` reads `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, while `GITHUB_SETUP.md` and CI set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. Set the names the code reads.
- `next.config.js` hardcodes `allowedDevOrigins` preview hosts. A new preview host must be added or the page renders without hydrating (no console error).
- `mobile/.api/openapi.json` is not committed; `npx orval` fails until root `openapi.json` is copied there.
- The APK workflow defaults `EXPO_PUBLIC_API_URL` to `https://fittracker.abacusai.app`; `GITHUB_SETUP.md` says `https://fit-trk.vercel.app`. The workflow is authoritative.
- `scripts/safe-seed.ts` aborts if `scripts/seed.ts` contains `prisma.*.delete(` or `deleteMany(` — production and dev may share a database.
- `/api/scan-label` streams SSE from `routellm.abacus.ai` using `ABACUSAI_API_KEY`. React Native's Hermes has no `ReadableStream`; use `customFetchStream` (XHR-based), never `response.body.getReader()`.
- `DailyLog` and `WeightLog` are unique per `(userId, date)`; upsert instead of create when writing a day.
