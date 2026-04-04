import '@midwayjs/view';
import _default from './dist/config/config.default';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig extends Partial<typeof _default> {}
}
