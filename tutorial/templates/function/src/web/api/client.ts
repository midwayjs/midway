import { createClient } from '@midwayjs/web-bridge';
import { homeApi } from '../../server/api/home.api';

export const api = createClient({
  home: homeApi,
});
