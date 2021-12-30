import { UploadFileInfo, UploadOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    upload: Partial<UploadOptions>;
  }
}
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/web/dist/interface' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/faas/dist/interface' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}

declare module '@midwayjs/express/dist/interface' {
  interface Context {
    files?: UploadFileInfo<any>[];
    fields?: { [fieldName: string]: any };
    cleanupRequestFiles?: () => Promise<Array<boolean>>;
  }
}
