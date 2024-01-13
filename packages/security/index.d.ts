import { SecurityOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    security?: Partial<SecurityOptions>;
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    security: {
      escape: (content: string) => string;
      html: (htmlCode: string) => string;
      js: (jsCode: string) => string;
      json: (obj: any) => string;
    };
  }
}

declare module '@midwayjs/web/dist/interface' {
  interface Context {
    security: {
      escape: (content: string) => string;
      html: (htmlCode: string) => string;
      js: (jsCode: string) => string;
      json: (obj: any) => string;
    };
  }
}

declare module '@midwayjs/faas/dist/interface' {
  interface Context {
    security: {
      escape: (content: string) => string;
      html: (htmlCode: string) => string;
      js: (jsCode: string) => string;
      json: (obj: any) => string;
    };
  }
}

declare module '@midwayjs/express/dist/interface' {
  interface Context {
    security: {
      escape: (content: string) => string;
      html: (htmlCode: string) => string;
      js: (jsCode: string) => string;
      json: (obj: any) => string;
    };
  }
}
