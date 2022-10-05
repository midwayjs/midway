import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '../interface';
import { Destroy, Init, Provide, Scope, ScopeEnum } from '../decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayMockService {
  protected mocks = [];
  protected contextMocks: Array<{
    app: IMidwayApplication;
    key: string | ((ctx: IMidwayContext) => void);
    value: any;
  }> = [];
  protected cache = new Map();
  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  async init() {
    if (MidwayMockService.prepareMocks.length > 0) {
      for (const item of MidwayMockService.prepareMocks) {
        this.mockProperty(item.obj, item.key, item.value);
      }
      MidwayMockService.prepareMocks = [];
    }
  }

  static prepareMocks = [];

  static mockClassProperty(
    clzz: new (...args) => any,
    propertyName: string,
    value: any
  ) {
    this.mockProperty(clzz.prototype, propertyName, value);
  }

  static mockProperty(obj: new (...args) => any, key: string, value: any) {
    this.prepareMocks.push({
      obj,
      key,
      value,
    });
  }

  mockClassProperty(
    clzz: new (...args) => any,
    propertyName: string,
    value: any
  ) {
    return this.mockProperty(clzz.prototype, propertyName, value);
  }

  mockProperty(obj: any, key: string, value) {
    // eslint-disable-next-line no-prototype-builtins
    const hasOwnProperty = obj.hasOwnProperty(key);
    this.mocks.push({
      obj,
      key,
      descriptor: Object.getOwnPropertyDescriptor(obj, key),
      // Make sure the key exists on object not the prototype
      hasOwnProperty,
    });

    // Delete the origin key, redefine it below
    if (hasOwnProperty) {
      delete obj[key];
    }

    // Set a flag that checks if it is mocked
    let flag = this.cache.get(obj);
    if (!flag) {
      flag = new Set();
      this.cache.set(obj, flag);
    }
    flag.add(key);

    const descriptor = this.overridePropertyDescriptor(value);
    Object.defineProperty(obj, key, descriptor);
  }

  mockContext(
    app: IMidwayApplication,
    key: string | ((ctx: IMidwayContext) => void),
    value?: PropertyDescriptor | any
  ) {
    this.contextMocks.push({
      app,
      key,
      value,
    });
  }

  @Destroy()
  restore() {
    for (let i = this.mocks.length - 1; i >= 0; i--) {
      const m = this.mocks[i];
      if (!m.hasOwnProperty) {
        // Delete the mock key, use key on the prototype
        delete m.obj[m.key];
      } else {
        // Redefine the origin key instead of the mock key
        Object.defineProperty(m.obj, m.key, m.descriptor);
      }
    }
    this.mocks = [];
    this.contextMocks = [];
    this.cache.clear();
    MidwayMockService.prepareMocks = [];
  }

  isMocked(obj, key) {
    const flag = this.cache.get(obj);
    return flag ? flag.has(key) : false;
  }

  applyContextMocks(app: IMidwayApplication, ctx: IMidwayContext) {
    if (this.contextMocks.length > 0) {
      for (const mockItem of this.contextMocks) {
        if (mockItem.app === app) {
          const descriptor = this.overridePropertyDescriptor(mockItem.value);
          if (typeof mockItem.key === 'string') {
            Object.defineProperty(ctx, mockItem.key, descriptor);
          } else {
            mockItem.key(ctx);
          }
        }
      }
    }
  }

  getContextMocksSize() {
    return this.contextMocks.length;
  }

  private overridePropertyDescriptor(value) {
    const descriptor = {
      configurable: true,
      enumerable: true,
    } as PropertyDescriptor;

    if (value && (value.get || value.set)) {
      // Default to undefined
      descriptor.get = value.get;
      descriptor.set = value.set;
    } else {
      // Without getter/setter mode
      descriptor.value = value;
      descriptor.writable = true;
    }

    return descriptor;
  }
}
