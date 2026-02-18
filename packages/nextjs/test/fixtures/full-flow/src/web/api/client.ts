import { ApiBridgeTransportAdapter } from '@midwayjs/web-bridge';
import { createClient } from '@midwayjs/nextjs';
import {
  accountApi,
  orderApi,
  profileApi,
  systemApi,
  userApi,
} from '../../server/api';

export function createFixtureApiClient(adapter: ApiBridgeTransportAdapter) {
  return createApiClient(adapter);
}

export function createApiClient(adapter: ApiBridgeTransportAdapter) {
  return createClient(
    {
      user: userApi,
      order: orderApi,
      system: systemApi,
      account: accountApi,
      profile: profileApi,
    },
    {
      basePath: '/api',
      adapter,
    }
  );
}
