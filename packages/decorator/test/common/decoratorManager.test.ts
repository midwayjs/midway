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
  Utils,
} from '../../src';
import * as assert from 'assert';
import { ManagerTest } from '../fixtures/decorator/customClass';
import mm = require('mm');

describe('/test/common/decoratorManager.test.ts', () => {
  it('should save data on class and get it', () => {
    assert(getClassMetadata('custom', ManagerTest) === 'test');
    assert(getClassMetadata('custom_method', ManagerTest) === 'testSomething');
  });

  it('should save data to class and list it', () => {
    const dataRes = listPropertyDataFromClass('custom', ManagerTest);
    assert(dataRes.length === 1);

    const { method, data } = getPropertyDataFromClass(
      'custom',
      ManagerTest,
      'testSomething'
    );
    assert(dataRes[0].method === method);
    assert(dataRes[0].data === data);
  });

  it('should get method meta data from method', () => {
    const m = new ManagerTest();
    // 挂载到方法上的元信息必须有实例
    assert(getPropertyMetadata('custom', m, 'testSomething') === 'methodData');
  });

  it('should list preload module', () => {
    let modules = listPreloadModule();
    assert(modules.length === 1);

    resetModule(PRELOAD_MODULE_KEY);
    modules = listPreloadModule();
    assert(modules.length === 0);
  });

  it('should list module', () => {
    const modules = listModule('custom');
    assert(modules.length === 1);

    const nothings = listModule('c_custom_notfound');
    assert(nothings.length === 0);
  });

  it('should clear all module', () => {
    let s = 'empty!';
    mm(DecoratorManager.prototype, 'clear', () => {
      s = 'clear';
    });
    clearAllModule();
    expect(s).toEqual('clear');
    mm.restore();
  });

  it('should get function args', () => {
    let args = Utils.getParamNames((a, b, c) => {});
    assert(args.length === 3);

    args = Utils.getParamNames(() => {});
    assert(args.length === 0);

    args = Utils.getParamNames((a) => {});
    assert(args.length === 1);

    args = Utils.getParamNames((a,b) => {});
    assert(args.length === 2);

    args = Utils.getParamNames((a, b=1) => {});
    assert(args.length === 2);

    args = Utils.getParamNames((a = 1, b =2, c) => {});
    assert(args.length === 3);
  });

  it('should get attach data from method', () => {
    const m = new ManagerTest();
    assert(getPropertyMetadata('custom_attach', m, 'index').length === 3);
    assert(
      getPropertyDataFromClass('custom_attach_to_class', ManagerTest, 'index')
        .length === 3
    );
  });

  it('should get attach data from class', () => {
    assert(getClassMetadata('custom_class_attach', ManagerTest).length === 4);
  });

  it('should get name from class', () => {
    expect(ManagerTest.name).toEqual('ManagerTest');
    expect(getProviderName(ManagerTest)).toEqual('managerTest');
    expect(getProviderName(class Test {})).toBeUndefined();
  });

  it('should get id from class', () => {
    expect(getProviderId(ManagerTest)).toEqual('123');
  });

  it('should get property data', () => {
    const m = new ManagerTest();
    assert(
      getPropertyMetadata('custom_property', m, 'testProperty') === 'property_a'
    );
    assert(
      getPropertyDataFromClass('custom_property_class', ManagerTest, 'testProperty')
        .length === 3
    );
  });

  it('should get object definition metadata', () => {
    const objDefinition = getObjectDefinition(ManagerTest);
    expect(objDefinition.scope).toEqual('Singleton');
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
      }
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
    const getType = propertyName =>  {
      return getPropertyMetadata('propertyType', catDTO, propertyName).name;
    }
    expect(getType('name')).toEqual('string');
    expect(getType('age')).toEqual('number');
    expect(getType('isMale')).toEqual('boolean');
    expect(getType('uniqueKey')).toEqual('symbol');
    expect(getType('emptyValue')).toEqual('undefined');
    expect(getType('extraKey')).toEqual('object');
    expect(getType('check')).toEqual('function');
    // null is undefined
    expect(getType('nullValue')).toEqual('undefined');
    expect(getType('breed')).toEqual('Array');
    expect(getType('mapObj')).toEqual('Map');
    expect(getType('alias')).toEqual('AnotherCatDTO');
  });

  it('should test save module with container', function () {
    class Container {
      store = new Map();
      saveModule(key: string, module: any) {
        this.store.set(key, module);
      }

      listModule(key) {
        return this.store.get(key);
      }

      transformModule(map) {
        for (const key of map.keys()) {
          this.store.set(key, map.get(key));
        }
      }
    }

    const container = new Container();
    const manager = new DecoratorManager();
    manager.set('abc', '123');
    manager.bindContainer(container);

    expect(container.listModule('abc')).toEqual('123');
  });

});
