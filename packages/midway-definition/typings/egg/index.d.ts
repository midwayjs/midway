/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/no-empty-interface */
import * as egg from 'egg';
import * as eggLogger from 'egg-logger';


export declare namespace Egg {
  export interface Context extends egg.Context {}
  export interface IContextLocals extends egg.IContextLocals {}
  export type EggEnvType = egg.EggEnvType;
  export interface EggPlugin extends egg.EggPlugin {}
  export interface EggAppConfig extends egg.EggAppConfig {}
  export interface IApplicationLocals extends egg.IApplicationLocals {}
  export interface EggApplication extends egg.EggApplication {}
  export interface EggAppInfo extends egg.EggAppInfo {}
  export interface EggHttpClient extends egg.EggHttpClient {}
  export interface EggContextHttpClient extends egg.EggContextHttpClient {}
  export interface Request extends egg.Request {}
  export interface Response extends egg.Response {}
  export interface Router extends egg.Router {}
  export interface EggLoggerOptions extends eggLogger.EggLoggerOptions {}
  export type EggLoggerLevel = eggLogger.LoggerLevel;
  export interface EggLogger extends eggLogger.EggLogger {}
  export interface EggLoggers extends eggLogger.EggLoggers {}
  export interface EggContextLogger extends eggLogger.EggContextLogger {}
}
