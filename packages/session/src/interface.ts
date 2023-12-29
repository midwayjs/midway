import { CookieSetOptions } from '@midwayjs/cookies';

export interface ISession {
  /**
   * JSON representation of the session.
   */
  toJSON(): object;

  /**
   * Return how many values there are in the session object.
   * Used to see if it"s "populated".
   */
  readonly length: number;

  /**
   * populated flag, which is just a boolean alias of .length.
   */
  readonly populated: boolean;

  /**
   * get/set session maxAge
   */
  maxAge: SessionOptions["maxAge"];

  /**
   * commit this session's headers if autoCommit is set to false.
   */
  manuallyCommit(): Promise<void>;

  /**
   * regenerate this session
   */
  regenerate(callback?: () => void): void;

  /**
   * save this session no matter whether it is populated
   */
  save(callback?: () => void): void;

  /**
   * allow to put any value on session object
   */
  [_: string]: any;
}

interface ExternalKeys {
  /**
   * get session object by key
   */
  get(ctx: any): string;

  /**
   * set session object for key, with a maxAge (in ms)
   */
  set(ctx: any, value: any): void;
}

export interface SessionOptions extends Omit<CookieSetOptions, 'maxAge'> {
  enable: boolean;
  /**
   * cookie key (default is koa:sess)
   */
  key: string;

  /**
   * maxAge in ms (default is 1 days)
   * "session" will result in a cookie that expires when session/browser is closed
   * Warning: If a session cookie is stolen, this cookie will never expire
   */
  maxAge?: number | "session" | undefined;

  /**
   * custom encode method
   */
  encode: (str: string) => Record<any, any>;

  /**
   * custom decode method
   */
  decode: (obj: Record<any, any>) => string;

  /**
   * The way of generating external session id is controlled by the options.genid, which defaults to Date.now() + "-" + uid.sync(24).
   */
  genid: () => string;

  /**
   * Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false
   */
  rolling?: boolean | undefined;

  /**
   * Renew session when session is nearly expired, so we can always keep user logged in. (default is false)
   */
  renew?: boolean | undefined;

  /**
   * External key is used the cookie by default,
   * but you can use options.externalKey to customize your own external key methods.
   */
  externalKey?: ExternalKeys | undefined;

  /**
   * If your session store requires data or utilities from context, opts.ContextStore is alse supported.
   * ContextStore must be a class which claims three instance methods demonstrated above.
   * new ContextStore(ctx) will be executed on every request.
   */
  ContextStore?: { new(ctx: any): SessionStore } | undefined;

  /**
   * If you want to add prefix for all external session id, you can use options.prefix, it will not work if options.genid present.
   */
  prefix?: string | undefined;

  /**
   * Hook: valid session value before use it
   */
  valid?(ctx: any, session: Partial<ISession>): void;

  /**
   * Hook: before save session
   */
  beforeSave?(ctx: any, session: ISession): void;

  /**
   * (boolean) automatically commit headers (default true).
   */
  autoCommit?: boolean;
}

export abstract class SessionStore {
  abstract get(key: string);
  abstract set(key: string, value: string, maxAge: number);
  abstract destroy(key);
}
