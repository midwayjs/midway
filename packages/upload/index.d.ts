import { UploadFileInfo, UploadOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    upload?: Partial<UploadOptions>;
  }
}
declare module '@midwayjs/koa' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/web' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/faas' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/express' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}
