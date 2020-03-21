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
  _mockFn(
    service: string,
    methodName: string,
    /** {Object|Function|Error} - mock you data */
    fnOrData: any,
  ): void

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

