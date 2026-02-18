import { defineApi, useInject } from '@midwayjs/core/functional';

export const functionalApi = defineApi('/functional', api => ({
  hello: api
    .get('/hello')
    .meta({ routerName: 'functionalHello' })
    .handle(async () => {
      const greetingService = await useInject<{
        format: (source: 'decorator' | 'functional') => string;
      }>('greetingService');

      return {
        source: 'functional',
        message: greetingService.format('functional'),
      };
    }),
}));
