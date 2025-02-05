import '@midwayjs/i18n';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    validation?: {
      validationOptions?: any;
      errorStatus?: number;
    };
  }
}
