import { ApiSecurity } from './api-security.decorator';

export function ApiBearerAuth(name = 'bearer') {
  return ApiSecurity(name);
}
