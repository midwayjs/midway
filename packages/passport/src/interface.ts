import * as passport from 'passport';

export interface IPassportStrategy {
  validate(...args): any;
  getStrategyConfig(): any;
  serializeUser?(user: any, done: (err: any, id?: any) => void): void;
  deserializeUser?(id: any, done: (err: any, user?: any) => void): void;
  transformAuthInfo?(info: any, done: (err: any, info: any) => void): void;
}

export abstract class AbstractStrategy implements IPassportStrategy {
  abstract validate(...args): any;
  abstract getStrategyConfig(): any;
}

export interface IPassportMiddleware {
  authenticate?(options: passport.AuthenticateOptions, callback: Function);
}

export abstract class AbstractPassportMiddleware implements IPassportMiddleware {
  abstract getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions;
  authenticate?(options: passport.AuthenticateOptions, callback?: Function);
}
