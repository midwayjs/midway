import {providerWrapper} from '../../../../../src/decorators';
import {IApplicationContext} from 'injection';

export function adapterFactory(context: IApplicationContext) {
  return async (adapterName: string) => {
    if (adapterName === 'google') {
      return context.getAsync('googleAdapter');
    }

    if (adapterName === 'baidu') {
      return context.getAsync('baiduAdapter');
    }
  };
}

providerWrapper([
  {
    id: 'adapterFactory',
    provider: adapterFactory
  }
]);
