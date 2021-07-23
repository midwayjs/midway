import { TracerManager } from './lib/tracer';
import { TracerConfig } from './lib/types';

declare module 'egg' {
  interface EggAppConfig {
    coreMiddleware: string[];
    tracer: TracerConfig;
  }
}
declare module '@midwayjs/core' {
  interface Context {
    tracerManager: TracerManager;
  }
}

export { AutoConfiguration as Configuration } from './configuration';
export { TracerMiddleware } from './middleware/tracer.middleware';
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware';
export { Logger } from './lib/logger';
export type { TracerManager };
export * from './lib/types';
