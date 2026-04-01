import { EventEmitterConfigOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    eventEmitter?: Partial<EventEmitterConfigOptions>;
  }
}
