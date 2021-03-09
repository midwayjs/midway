import {
  IMidwayApplication,
  IConfigurationOptions
} from '@midwayjs/core';
export interface IServerlessApp extends IMidwayApplication {
  use: any;
  getServerlessInstance<T>(cls: any): Promise<T>;
} 

export interface IServerlessAppOptions extends IConfigurationOptions {
  port?: string | number;
  initContext?: any;
  layers?: string[];
}