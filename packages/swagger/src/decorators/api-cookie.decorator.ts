import { ApiSecurity } from './api-security.decorator';

export function ApiCookieAuth(name = 'cookie') {
  return ApiSecurity(name);
}
