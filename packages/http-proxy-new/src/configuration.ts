import {
  Configuration,
} from '@midwayjs/core';

@Configuration({
  namespace: 'http-proxy-middleware',
})
export class HttpProxyConfiguration {
  async onReady() {}
}
