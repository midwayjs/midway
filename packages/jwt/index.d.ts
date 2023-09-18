import { DecodeOptions, SignOptions, VerifyOptions } from 'jsonwebtoken';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    jwt?: (
      | SignOptions
      | {
          sign?: SignOptions;
          verify?: VerifyOptions;
          decode?: DecodeOptions;
        }
    ) & {
      secret?: string;
    };
  }
}
