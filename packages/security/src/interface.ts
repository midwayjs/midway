import { IgnoreMatcher } from '@midwayjs/core';

export interface SecurityOptions {
  /**
   * whether defend csrf attack
   * default enable and use cookie
   */
  csrf: Partial<SecurityCSRFOptions>;
  /**
   * content security policy config
   * default not enable
   */
  csp: Partial<SecurityCSPOptions>;
  /**
   * whether enable X-Frame-Options response header
   * default enable and value equals SAMEORIGIN
   */
  xframe: Partial<SecurityXFrameOptions>;
  /**
   * whether enable Strict-Transport-Security response header
   * default not enable and maxAge equals one year
   */
  hsts: Partial<SecurityHSTSOptions>;
  /**
   * whether enable IE automaticlly download open
   * default not enable
   */
  noopen: Partial<SecurityEnableOptions>;
  /**
   * whether enable IE8 automaticlly dedect mime
   * default not enable
   */
  nosniff: Partial<SecurityEnableOptions>;
  /**
   * whether enable IE8 XSS Filter, default is open
   * default enable
   */
  xssProtection: Partial<SecurityXSSProtectionOptions>;
}

export interface SecurityCSRFOptions extends SecurityEnableOptions {
  type: SecurityCSRFType;
  /**
   * If set to true, the secret will be stored in the session instead of the cookie.
   */
  useSession: boolean;
  /**
   * The key name stored in the cookie by the token of csrf
   */
  cookieName: string | string[];
  /**
   * The key name of the CSRF token stored in the session.
   */
  sessionName: string;
  /**
   * The name of the csrf token in the header
   */
  headerName: string;
  /**
   * The name of the csrf token in the body.
   */
  bodyName: string;
  /**
   * The name of the csrf token in the query.
   */
  queryName: string;
  refererWhiteList: string[];
  cookieDomain: (context: any) => string;
}

export interface SecurityXFrameOptions extends SecurityEnableOptions {
  value: string;
}

export interface SecurityHSTSOptions extends SecurityEnableOptions {
  maxAge: number;
  includeSubdomains: boolean;
}

export interface SecurityXSSProtectionOptions extends SecurityEnableOptions {
  value: string;
}

export interface SecurityCSPOptions extends SecurityEnableOptions {
  policy: {
    [otherPolicy: string]: string | string[] | boolean;
  };
  reportOnly: boolean;
  supportIE: boolean;
}
export interface SecurityEnableOptions {
  enable: boolean;
  match?: IgnoreMatcher<any> | IgnoreMatcher<any> [];
  ignore?: IgnoreMatcher<any> | IgnoreMatcher<any> [];
}

export type SecurityCSRFType = 'all' | 'any' | 'ctoken' | 'referer';
