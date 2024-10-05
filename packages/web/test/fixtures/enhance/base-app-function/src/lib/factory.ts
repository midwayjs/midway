import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export function adapterFactory(context: IMidwayContainer) {
  return async (adapterName: string) => {
    if (adapterName === 'google') {
      return context.getAsync('googleAdapter');
    }

    if (adapterName === 'baidu') {
      return context.getAsync('baiduAdapter');
    }
  };
}

export function contextHandler(context) {
  return async () => {
    const ctx = await context.getAsync('ctx');
    return !!ctx.logger;
  };
}

providerWrapper([
  {
    id: 'adapterFactory',
    provider: adapterFactory,
  },
  {
    id: 'contextHandler',
    provider: contextHandler
  }
]);
