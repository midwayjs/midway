import {providerWrapper} from 'midway-core';
import {IApplicationContext} from 'midway-context';

export function adapterFactory(context: IApplicationContext) {
  return async (adapterName: string) => {
    if(adapterName === 'google') {
      return await context.getAsync('googleAdapter');
    }

    if(adapterName === 'baidu') {
      return await context.getAsync('baiduAdapter');
    }
  };
}

providerWrapper([
  {
    id: 'adapterFactory',
    provider: adapterFactory
  }
]);

