import { providerWrapper, IApplicationContext } from '@midwayjs/core';

export function Test(context: IApplicationContext, args?: any) {
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
