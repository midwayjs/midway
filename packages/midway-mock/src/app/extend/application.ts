import { MockApplication } from 'egg-mock';
import { ApplicationContext, IApplicationContext } from 'injection';


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
  mockClassFunction: typeof mockClassFunction
}

export function mockClassFunction(
  this: MidwayMockApplication,
  className: string,
  methodName: string,
  fnOrData: any,
): void {

  const { applicationContext } = this;

  const def = applicationContext.registry.getDefinition(className);
  if (! def) {
    throw new TypeError(`def undefined with className: "${className}", methodName: "${methodName}"`);
  } else {
    const clazz = def.path;
    if (clazz && typeof clazz === 'function') {
      this._mockFn(clazz.prototype, methodName, fnOrData);
    }
  }
}
