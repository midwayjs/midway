import { SignOptions } from 'jsonwebtoken';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    jwt?: SignOptions & {
      secret?: string;
    };
  }
}
