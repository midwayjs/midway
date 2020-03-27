import { MidwayMockApplication, MockClassFunctionHandler } from '../../interface';

interface MidwayMockApplicationInner extends MidwayMockApplication {
  _mockFn(
    service: string,
    methodName: string,
    /** {Object|Function|Error} - mock you data */
    fnOrData: any,
  ): void;
}

export const mockClassFunction: MockClassFunctionHandler = function(
  this: MidwayMockApplicationInner,
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
    this._mockFn(clazz.prototype, methodName, fnOrData);
  }
};
