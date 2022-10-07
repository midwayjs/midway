import { TypeORMAdapterConfig } from './dist/index';
import '@midwayjs/casbin';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    casbinTypeORM?: Partial<TypeORMAdapterConfig>;
  }
}
