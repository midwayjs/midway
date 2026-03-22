import { AuthenticateOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    passport?: Omit<AuthenticateOptions, 'assignProperty'> & {
      assignProperty?: boolean | string;
      sessionUserProperty?: string;
    };
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface State {
    user?: any;
  }
  interface Context {
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): Promise<void>;
  }
}

declare module '@midwayjs/web/dist/interface' {
  interface State {
    user?: any;
  }
  interface Context {
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): Promise<void>;
  }
}

declare module '@midwayjs/faas/dist/interface' {
  interface State {
    user?: any;
  }
  interface Context {
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): Promise<void>;
  }
}

declare module '@midwayjs/express/dist/interface' {
  interface Context {
    user?: any;
    // These declarations are merged into express's Request type
    login(user: any, done: (err: any) => void): void;
    login(user: any, options: any, done: (err: any) => void): void;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
  }
}
