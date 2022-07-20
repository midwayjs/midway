import { IMiddleware } from '@midwayjs/core';

export interface AuthenticateOptions {
  authInfo?: boolean | undefined;
  assignProperty?: string | undefined;
  // failureFlash?: string | boolean | undefined;
  failureMessage?: boolean | string | undefined;
  failureRedirect?: string | undefined;
  // failWithError?: boolean | undefined;
  session?: boolean | undefined;
  scope?: string | string[] | undefined;
  // successFlash?: string | boolean | undefined;
  successMessage?: boolean | string | undefined;
  successRedirect?: string | undefined;
  successReturnToOrRedirect?: string | undefined;
  state?: string | undefined;
  pauseStream?: boolean | undefined;
  userProperty?: string | undefined;
  passReqToCallback?: boolean | undefined;
  prompt?: string | undefined;
}

export interface IPassportStrategy {
  validate(...args): any;
  getStrategyOptions(): any;
  serializeUser?(user: any, done: (err: any, id?: any) => void): void;
  deserializeUser?(id: any, done: (err: any, user?: any) => void): void;
  transformAuthInfo?(info: any, done: (err: any, info: any) => void): void;
}

export interface IPassportMiddleware extends IMiddleware<any, any>{
  authenticate?(options: AuthenticateOptions, callback: Function);
}

export abstract class AbstractPassportMiddleware implements Pick<IPassportMiddleware, 'authenticate'> {
  abstract getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions;
  authenticate?(options: AuthenticateOptions, callback?: Function);
  resolve(): any {}
}

export interface StrategyCreatedStatic {
  /**
   * Authenticate `user`, with optional `info`.
   *
   * Strategies should call this function to successfully authenticate a
   * user.  `user` should be an object supplied by the application after it
   * has been given an opportunity to verify credentials.  `info` is an
   * optional argument containing additional user information.  This is
   * useful for third-party authentication strategies to pass profile
   * details.
   */
  success(user: any, info?: Record<string, any>): void;
  /**
   * Fail authentication, with optional `challenge` and `status`, defaulting
   * to 401.
   *
   * Strategies should call this function to fail an authentication attempt.
   */
  fail(challenge?: string | number, status?: number): void;
  /**
   * Redirect to `url` with optional `status`, defaulting to 302.
   *
   * Strategies should call this function to redirect the user (via their
   * user agent) to a third-party website for authentication.
   */
  redirect(url: string, status?: number): void;
  /**
   * Pass without making a success or fail decision.
   *
   * Under most circumstances, Strategies should not need to call this
   * function.  It exists primarily to allow previous authentication state
   * to be restored, for example from an HTTP session.
   */
  pass(): void;
  /**
   * Internal error while performing authentication.
   *
   * Strategies should call this function when an internal error occurs
   * during the process of performing authentication; for example, if the
   * user directory is not available.
   */
  error(err: any): void;
}
