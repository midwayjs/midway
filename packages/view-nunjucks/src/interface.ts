import _default from './config/config.default';

// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig extends Partial<typeof _default> {
  }
}
