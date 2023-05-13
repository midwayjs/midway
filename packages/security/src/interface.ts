import { IgnoreMatcher } from '@midwayjs/core';

export interface SecurityOptions {
  csrf: Partial<SecurityCSRFOptions>;
  csp: Partial<SecurityCSPOptions>;
  xframe: Partial<SecurityXFrameOptions>;
  hsts: Partial<SecurityHSTSOptions>;
  noopen: Partial<SecurityEnableOptions>;
  nosniff: Partial<SecurityEnableOptions>;
  xssProtection: Partial<SecurityXSSProtectionOptions>;
}

export interface SecurityCSRFOptions extends SecurityEnableOptions {
  type: SecurityCSRFType;
  useSession: boolean;
  cookieName: string | string[];
  sessionName: string;
  headerName: string;
  bodyName: string;
  queryName: string;
  refererWhiteList: string[];
  cookieDomain: (context: any) => string;
  matching: (context: any) => boolean;
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
