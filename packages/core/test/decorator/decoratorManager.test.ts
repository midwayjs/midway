import {
  attachPropertyMetadata,
  clearAllModule,
  DecoratorManager,
  getClassMetadata,
  getObjectDefinition,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  listModule,
  listPreloadModule,
  listPropertyDataFromClass,
  PRELOAD_MODULE_KEY,
  resetModule,
  savePropertyDataToClass,
  getPropertyType,
  savePropertyMetadata,
  getProviderName,
  Utils, saveModule, Init
} from '../../src';
import { ManagerTest } from './fixtures/decorator/customClass';
import { Get, getMethodParamTypes } from '../../src';

describe('/test/decoratorManager.test.ts', () => {
  it('should save data on class and get it', () => {
    expect(getClassMetadata('custom', ManagerTest)).toBe('test');
    expect(getClassMetadata('custom_method', ManagerTest)).toBe('testSomething');
  });

  it('should save data to class and list it', () => {
    const dataRes = listPropertyDataFromClass('custom', ManagerTest);
    expect(dataRes.length).toBe(1);

    const { method, data } = getPropertyDataFromClass(
      'custom',
      ManagerTest,
      'testSomething'
    );
    expect(dataRes[0].method).toBe(method);
    expect(dataRes[0].data).toBe(data);
  });

  it('should get method meta data from method', () => {
    const m = new ManagerTest();
    expect(getPropertyMetadata('custom', m, 'testSomething')).toBe('methodData');
  });

  it('should list preload module', () => {
    let modules = listPreloadModule();
    expect(modules.length).toBe(1);

    resetModule(PRELOAD_MODULE_KEY);
    modules = listPreloadModule();
    expect(modules.length).toBe(0);
  });

  it('should list module', () => {
    const modules = listModule('custom');
    expect(modules.length).toBe(1);

    const nothings = listModule('c_custom_notfound');
    expect(nothings.length).toBe(0);
  });

  it('should clear all module', () => {
    saveModule('a', 'b');
    expect(listModule('a').length).toBe(1);
    clearAllModule();
    expect(listModule('a').length).toBe(0);
  });

  it('should get function args', () => {
    let args = Utils.getParamNames((a, b, c) => {});
    expect(args.length).toBe(3);

    args = Utils.getParamNames(() => {});
    expect(args.length).toBe(0);

    args = Utils.getParamNames((a) => {});
    expect(args.length).toBe(1);

    args = Utils.getParamNames((a, b) => {});
    expect(args.length).toBe(2);

    args = Utils.getParamNames((a, b = 1) => {});
    expect(args.length).toBe(2);

    args = Utils.getParamNames((a = 1, b = 2, c) => {});
    expect(args.length).toBe(3);
  });

  it('should get attach data from method', () => {
    const m = new ManagerTest();
    expect(getPropertyMetadata('custom_attach', m, 'index').length).toBe(3);
    expect(
      getPropertyDataFromClass('custom_attach_to_class', ManagerTest, 'index').length
    ).toBe(3);
  });

  it('should get attach data from class', () => {
    expect(getClassMetadata('custom_class_attach', ManagerTest).length).toBe(4);
  });

  it('should get name from class', () => {
    expect(ManagerTest.name).toBe('ManagerTest');
    expect(getProviderName(ManagerTest)).toBe('managerTest');
    expect(getProviderName(class Test {})).toBeUndefined();
  });

  it('should get id from class', () => {
    expect(getProviderId(ManagerTest)).toBe('123');
  });

  it('should get property data', () => {
    const m = new ManagerTest();
    expect(getPropertyMetadata('custom_property', m, 'testProperty')).toBe('property_a');
    expect(
      getPropertyDataFromClass('custom_property_class', ManagerTest, 'testProperty').length
    ).toBe(3);
  });

  it('should get object definition metadata', () => {
    class ManagerTest {
      @Init()
      async init() {}
    }
    const objDefinition = getObjectDefinition(ManagerTest);
    expect(objDefinition).toStrictEqual({ 'initMethod': 'init' });
  });

  it('savePropertyDataToClass should be ok', () => {
    class TestOne {}
    savePropertyDataToClass('hello1', { a: 1 }, TestOne, 'hello');

    const data = listPropertyDataFromClass('hello1', TestOne);
    expect(data).toStrictEqual([
      {
        a: 1,
      },
    ]);
  });

  it('attachPropertyMetadata should be ok', () => {
    class TestTwo {}
    attachPropertyMetadata('ttt', { a: 1, b: 22 }, TestTwo, 'hhh');

    const meta = getPropertyMetadata('ttt', TestTwo, 'hhh');
    expect(meta).toStrictEqual([{ a: 1, b: 22 }]);
  });

  it('should test getPropertyType', function () {
    function ApiProperty(): PropertyDecorator {
      return (target, propertyName) => {
        const data = getPropertyType(target, propertyName);
        savePropertyMetadata('propertyType', data, target, propertyName);
      };
    }

    class AnotherCatDTO {
      @ApiProperty()
      name: string;
    }

    class CreateCatDto {
      @ApiProperty()
      name: string;
      @ApiProperty()
      age: number;
      @ApiProperty()
      isMale: boolean;
      @ApiProperty()
      uniqueKey: symbol;
      @ApiProperty()
      emptyValue: undefined;
      @ApiProperty()
      extraKey: object;
      @ApiProperty()
      check: () => boolean;
      @ApiProperty()
      nullValue: null = null;
      @ApiProperty()
      breed: [string];
      @ApiProperty()
      mapObj: Map<string, any>;
      @ApiProperty()
      alias: AnotherCatDTO;
    }

    const catDTO = new CreateCatDto();
    const getType = (propertyName) => {
      return getPropertyMetadata('propertyType', catDTO, propertyName).name;
    };
    expect(getType('name')).toBe('string');
    expect(getType('age')).toBe('number');
    expect(getType('isMale')).toBe('boolean');
    expect(getType('uniqueKey')).toBe('symbol');
    expect(getType('emptyValue')).toBe('undefined');
    expect(getType('extraKey')).toBe('object');
    expect(getType('check')).toBe('function');
    expect(getType('nullValue')).toBe('undefined');
    expect(getType('breed')).toBe('Array');
    expect(getType('mapObj')).toBe('Map');
    expect(getType('alias')).toBe('AnotherCatDTO');
  });

  it('should test save module with container', function () {
    class Container {
      store = new Map();
      saveModule(key: string, module: any) {
        this.store.set(key, module);
      }

      listModule(key) {
        return Array.from(this.store.get(key));
      }

      transformModule(map) {
        for (const key of map.keys()) {
          this.store.set(key, map.get(key));
        }
      }
    }

    const container = new Container();
    DecoratorManager.saveModule('abc', '123');
    DecoratorManager.bindContainer(container);

    expect(container.listModule('abc')[0]).toBe('123');
  });

  it('should test getMethodParamTypes', function () {
    const obj = { ccc: 'd' };
    class D {}
    class A {
      @Get()
      async invoke(
        a: number,
        b: string,
        c: boolean,
        d: D,
        e: [],
        f: Map<string, any>,
        g: Set<any>
      ) {}

      @Get()
      async invoke2(a: Record<any, any>, b: unknown, c: any, d: typeof obj) {}
    }
    const paramTypes = getMethodParamTypes(A, 'invoke');
    expect(paramTypes.length).toBe(7);

    const paramTypes2 = getMethodParamTypes(A, 'invoke2');
    expect(paramTypes2.length).toBe(4);
  });
});
