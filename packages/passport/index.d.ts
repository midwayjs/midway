import * as passport from 'passport';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    passport?: passport.AuthenticateOptions;
  }
}

declare module '@midwayjs/koa' {
  interface Context {
    state: {
      user?: any;
    };
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): void;
  }
}

declare module '@midwayjs/web' {
  interface Context {
    state: {
      user?: any;
    };
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): void;
  }
}

declare module '@midwayjs/faas' {
  interface Context {
    state: {
      user?: any;
    };
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): void;
  }
}

declare module '@midwayjs/express' {
  interface Context {
    user?: any;
    // These declarations are merged into express's Request type
    login(user: any, done: (err: any) => void): void;
    login(user: any, options: any, done: (err: any) => void): void;
    logout(): void;
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
  }
}
