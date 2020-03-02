import { MockApplication } from 'egg-mock';
import { ApplicationContext } from 'injection';


interface Application extends MockApplication {
  applicationContext: ApplicationContext
  _mockFn(
    service: string,
    methodName: string,
    fn: () => any): void
}

export function mockClassFunction(
  this: Application,
  className: string,
  methodName: string,
  fn: () => any,
): void {

  const { applicationContext } = this;

  const def = applicationContext.registry.getDefinition(className);
  if (! def) {
    throw new TypeError(`def undefined with className: "${className}", methodName: "${methodName}"`);
  }
  else {
    const clazz = def.path;
    if (clazz && typeof clazz === 'function') {
      this._mockFn(clazz.prototype, methodName, fn);
    }
  }
}

