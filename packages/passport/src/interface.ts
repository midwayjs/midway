import * as passport from 'passport';
import { IMiddleware } from '@midwayjs/core';

export interface IPassportStrategy {
  validate(...args): any;
  getStrategyOptions(): any;
  serializeUser?(user: any, done: (err: any, id?: any) => void): void;
  deserializeUser?(id: any, done: (err: any, user?: any) => void): void;
  transformAuthInfo?(info: any, done: (err: any, info: any) => void): void;
}

export abstract class AbstractStrategy implements IPassportStrategy {
  abstract validate(...args): any;
  abstract getStrategyOptions(): any;
}

export interface IPassportMiddleware extends IMiddleware<any, any>{
  authenticate?(options: passport.AuthenticateOptions, callback: Function);
}

export abstract class AbstractPassportMiddleware implements Pick<IPassportMiddleware, 'authenticate'> {
  abstract getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions;
  abstract authz(...args: any[]): Promise<Record<string, any>> ;
  authenticate?(options: passport.AuthenticateOptions, callback?: Function);
  resolve(): any {}
}
