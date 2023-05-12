import { IgnoreMatcher } from '@midwayjs/core';

export interface SecurityOptions {
  csrf: Partial<SecurityCSRFOptions & IgnoreMatcher<any>>;
  csp: Partial<SecurityCSPOptions & IgnoreMatcher<any>>;
  xframe: Partial<SecurityXFrameOptions & IgnoreMatcher<any>>;
  hsts: Partial<SecurityHSTSOptions & IgnoreMatcher<any>>;
  noopen: Partial<SecurityEnableOptions & IgnoreMatcher<any>>;
  nosniff: Partial<SecurityEnableOptions & IgnoreMatcher<any>>;
  xssProtection: Partial<SecurityXSSProtectionOptions & IgnoreMatcher<any>>;
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
}



export type SecurityCSRFType = 'all' | 'any' | 'ctoken' | 'referer';
