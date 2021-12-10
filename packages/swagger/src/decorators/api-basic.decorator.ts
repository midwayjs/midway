import { ApiSecurity } from './api-security.decorator';

export function ApiBasicAuth(name = 'basic') {
  return ApiSecurity(name);
}
