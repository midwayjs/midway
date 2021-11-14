import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export function Test(context: IMidwayContainer, args?: any) {
  // ignore
  return AppModel;
}

providerWrapper([
  {
    id: 'AppModel',
    provider: Test
  }
]);

export class AppModel {}
