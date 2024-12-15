import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
  ISimulation,
  ScopeEnum,
} from '../interface';
import {
  Destroy,
  Init,
  listModule,
  Provide,
  Scope,
  MOCK_KEY,
} from '../decorator';
import { isClass } from '../util/types';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayMockService {
  /**
   * Save class prototype and object property mocks
   */
  protected mocks: Map<
    string,
    Array<{
      obj: any;
      key: string;
      descriptor: PropertyDescriptor;
      hasOwnProperty: boolean;
    }>
  > = new Map();
  /**
   * Save context mocks
   */
  protected contextMocks: Map<
    string,
    Array<{
      app: IMidwayApplication;
      key: string | ((ctx: IMidwayContext) => void);
      value: any;
    }>
  > = new Map();
  protected cache: Map<string, Map<any, Set<string>>> = new Map();
  protected simulatorList: Array<ISimulation> = [];
  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  async init() {
    if (MidwayMockService.prepareMocks.length > 0) {
      for (const item of MidwayMockService.prepareMocks) {
        this.mockProperty(item.obj, item.key, item.value, item.group);
      }
      MidwayMockService.prepareMocks = [];
    }
  }

  /**
   * Prepare mocks before the service is initialized
   */
  static prepareMocks = [];

  static mockClassProperty(
    clzz: new (...args) => any,
    propertyName: string,
    value: any,
    group = 'default'
  ) {
    this.mockProperty(clzz.prototype, propertyName, value, group);
  }

  static mockProperty(
    obj: new (...args) => any,
    key: string,
    value: any,
    group = 'default'
  ) {
    this.prepareMocks.push({
      obj,
      key,
      value,
      group,
    });
  }

  public mockClassProperty(
    clzz: new (...args) => any,
    propertyName: string,
    value: any,
    group = 'default'
  ) {
    return this.mockProperty(clzz.prototype, propertyName, value, group);
  }

  public mockProperty(obj: any, key: string, value: any, group = 'default') {
    // eslint-disable-next-line no-prototype-builtins
    const hasOwnProperty = obj.hasOwnProperty(key);
    const mockItem = {
      obj,
      key,
      descriptor: Object.getOwnPropertyDescriptor(obj, key),
      // Make sure the key exists on object not the prototype
      hasOwnProperty,
    };

    if (!this.mocks.has(group)) {
      this.mocks.set(group, []);
    }
    this.mocks.get(group).push(mockItem);

    if (hasOwnProperty) {
      delete obj[key];
    }

    // Set a flag that checks if it is mocked
    let groupCache = this.cache.get(group);
    if (!groupCache) {
      groupCache = new Map();
      this.cache.set(group, groupCache);
    }

    let flag = groupCache.get(obj);
    if (!flag) {
      flag = new Set();
      groupCache.set(obj, flag);
    }
    flag.add(key);

    const descriptor = this.overridePropertyDescriptor(value);
    Object.defineProperty(obj, key, descriptor);
  }

  public mockContext(
    app: IMidwayApplication,
    key: string | ((ctx: IMidwayContext) => void),
    value?: PropertyDescriptor | any,
    group = 'default'
  ) {
    if (!this.contextMocks.has(group)) {
      this.contextMocks.set(group, []);
    }
    this.contextMocks.get(group).push({
      app,
      key,
      value,
    });
  }

  public restore(group = 'default') {
    this.restoreGroup(group);
  }

  @Destroy()
  public restoreAll() {
    const groups = new Set([
      ...this.mocks.keys(),
      ...this.contextMocks.keys(),
      ...this.cache.keys(),
    ]);

    for (const group of groups) {
      this.restoreGroup(group);
    }

    this.simulatorList = [];
  }

  private restoreGroup(group: string) {
    const groupMocks = this.mocks.get(group) || [];
    for (let i = groupMocks.length - 1; i >= 0; i--) {
      const m = groupMocks[i];
      if (!m.hasOwnProperty) {
        delete m.obj[m.key];
      } else {
        Object.defineProperty(m.obj, m.key, m.descriptor);
      }
    }
    this.mocks.delete(group);
    this.contextMocks.delete(group);
    this.cache.delete(group);
    this.simulatorList = this.simulatorList.filter(
      sim => sim['group'] !== group
    );
  }

  public isMocked(obj, key, group = 'default') {
    if (isClass(obj)) {
      obj = obj.prototype;
    }
    const groupCache = this.cache.get(group);
    const flag = groupCache ? groupCache.get(obj) : undefined;
    return flag ? flag.has(key) : false;
  }

  applyContextMocks(app: IMidwayApplication, ctx: IMidwayContext) {
    for (const [, groupMocks] of this.contextMocks) {
      for (const mockItem of groupMocks) {
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
    return Array.from(this.contextMocks.values()).reduce(
      (sum, group) => sum + group.length,
      0
    );
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

  public async initSimulation(group = 'default') {
    const simulationModule: Array<new (...args) => ISimulation> =
      listModule(MOCK_KEY);

    for (const module of simulationModule) {
      const instance = await this.applicationContext.getAsync(module);
      if (await instance.enableCondition()) {
        instance['group'] = group;
        this.simulatorList.push(instance);
      }
    }
  }

  public async runSimulatorSetup() {
    for (const simulator of this.simulatorList) {
      await simulator.setup?.();
    }
  }

  public async runSimulatorTearDown() {
    // reverse loop and not change origin simulatorList
    for (let i = this.simulatorList.length - 1; i >= 0; i--) {
      const simulator = this.simulatorList[i];
      await simulator.tearDown?.();
    }
  }

  public async runSimulatorAppSetup(app: IMidwayApplication) {
    for (const simulator of this.simulatorList) {
      await simulator.appSetup?.(app);
    }
  }

  public async runSimulatorAppTearDown(app: IMidwayApplication) {
    // reverse loop and not change origin simulatorList
    for (let i = this.simulatorList.length - 1; i >= 0; i--) {
      const simulator = this.simulatorList[i];
      await simulator.appTearDown?.(app);
    }
  }

  public async runSimulatorContextSetup(
    ctx: IMidwayContext,
    app: IMidwayApplication
  ) {
    for (const simulator of this.simulatorList) {
      await simulator.contextSetup?.(ctx, app);
    }
  }

  public async runSimulatorContextTearDown(
    ctx: IMidwayContext,
    app: IMidwayApplication
  ) {
    // reverse loop and not change origin simulatorList
    for (let i = this.simulatorList.length - 1; i >= 0; i--) {
      const simulator = this.simulatorList[i];
      await simulator?.contextTearDown?.(ctx, app);
    }
  }
}
