import { createClient } from '@midwayjs/web-bridge';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
