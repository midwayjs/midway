import { ApiBridgeTransportAdapter } from '@midwayjs/api-bridge';
import { createClient } from '@midwayjs/react';
import { accountApi, orderApi, systemApi, userApi } from '../../server/api';

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
    },
    {
      basePath: '/api',
      adapter,
    }
  );
}
