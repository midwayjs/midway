import type { SecurityOptions } from '../interface';
export const security: Partial<SecurityOptions> = {
  csrf: {
    enable: true,
    type: 'ctoken',
    useSession: false,
    cookieName: 'csrfToken',
    sessionName: 'csrfToken',
    headerName: 'x-csrf-token',
    bodyName: '_csrf',
    queryName: '_csrf',
    refererWhiteList: [],
  },
  xframe: {
    enable: true,
    value: 'SAMEORIGIN',
  },
  csp: {
    enable: false,
  },
  hsts: {
    enable: false,
    maxAge: 365 * 24 * 3600,
    includeSubdomains: false,
  },
  noopen: {
    enable: false,
  },
  nosniff: {
    enable: false,
  },
  xssProtection: {
    enable: true,
    value: '1; mode=block',
  },
};
