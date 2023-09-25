import { InitializeContext } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/faas/dist/interface' {
  interface FaaSContext {
    originContext: InitializeContext;
  }
}
