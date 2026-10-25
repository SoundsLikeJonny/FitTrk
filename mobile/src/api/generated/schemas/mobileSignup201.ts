// @ts-nocheck
import type { MobileSignup201User } from './mobileSignup201User';

export type MobileSignup201 = {
  token: string;
  /**
     * The signed-in user from NextAuth's session.
     * @nullable
     */
  user?: MobileSignup201User;
};
