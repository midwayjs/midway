import { MockOption, MockApplication  } from 'egg-mock';
import { ApplicationContext, IApplicationContext } from 'injection';


export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string
  framework?: string
  plugin?: any
  plugins?: any
  container?: any
  typescript?: boolean
  worker?: number
}

export interface MidwayMockApplication extends MockApplication {
  applicationContext: ApplicationContext
  pluginContext: IApplicationContext
  appDir: string
  baseDir: string
  enablePlugins: any
  getApplicationContext(): IApplicationContext
  getPluginContext(): IApplicationContext
  getPlugin(pluginName: string): any
  getLogger(name?: string): any
  getConfig(key?: string): any

  /**
   * Mock class function
   */
  mockClassFunction(
    this: MidwayMockApplication,
    className: string,
    methodName: string,
    fnOrData: any,
  ): any
}

