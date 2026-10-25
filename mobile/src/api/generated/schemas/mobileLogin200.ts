// @ts-nocheck
import type { MobileLogin200User } from './mobileLogin200User';

export type MobileLogin200 = {
  token: string;
  /**
     * The signed-in user from NextAuth's session.
     * @nullable
     */
  user?: MobileLogin200User;
};
