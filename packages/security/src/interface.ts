export interface SecurityOptions {
  csrf: Partial<SecurityCSRFOptions>;
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

export interface SecurityEnableOptions {
  enable: boolean;
}

export type SecurityCSRFType = 'all' | 'any' | 'ctoken' | 'referer';