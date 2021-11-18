import { FileConfigOption } from '@midwayjs/core';
import * as DefaultConfig from './dist/config/config.default';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line
  interface MidwayConfig extends Pick<FileConfigOption<typeof DefaultConfig>, 'task'> {}
}
