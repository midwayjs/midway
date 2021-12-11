import { SignOptions } from 'jsonwebtoken';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    jwt?: SignOptions & {
      secret?: string;
    };
  }
}
