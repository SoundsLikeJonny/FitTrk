// @ts-nocheck

/**
 * The signed-in user from NextAuth's session.
 * @nullable
 */
export type MobileSignup201User = {
  id?: string;
  /** @nullable */
  name?: string | null;
  /** @nullable */
  email?: string | null;
  /** @nullable */
  image?: string | null;
  [key: string]: unknown;
 } | null;
