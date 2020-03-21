import { MidwayMockApplication } from '../../interface';


export const mockClassFunction: MidwayMockApplication['mockClassFunction'] = function(
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
}

