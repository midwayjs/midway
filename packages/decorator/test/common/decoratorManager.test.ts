import {
  attachPropertyMetadata,
  clearAllModule,
  DecoratorManager,
  getClassMetadata,
  getMethodDataFromClass,
  getMethodMetadata,
  getObjectDefinition,
  getParamNames,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  listMethodDataFromClass,
  listModule,
  listPreloadModule,
  listPropertyDataFromClass,
  PRELOAD_MODULE_KEY,
  resetModule,
  savePropertyDataToClass,
  generateProvideId,
  getPropertyType,
  savePropertyMetadata,
  saveIdentifierMapping,
} from '../../src';
import * as assert from 'assert';
import { ManagerTest as module } from '../fixtures/decorator/customClass';
import mm = require('mm');

describe('/test/common/decoratorManager.test.ts', () => {
  it('should save data on class and get it', () => {
    assert(getClassMetadata('custom', module) === 'test');
    assert(getClassMetadata('custom_method', module) === 'testSomething');
  });

  it('should save data to class and list it', () => {
    const dataRes = listMethodDataFromClass('custom', module);
    assert(dataRes.length === 1);

    const { method, data } = getMethodDataFromClass(
      'custom',
      module,
      'testSomething'
    );
    assert(dataRes[0].method === method);
    assert(dataRes[0].data === data);
  });

  it('should get method meta data from method', () => {
    const m = new module();
    // 挂载到方法上的元信息必须有实例
    assert(getMethodMetadata('custom', m, 'testSomething') === 'methodData');
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
    let args = getParamNames((a, b, c) => {});
    assert(args.length === 3);

    args = getParamNames(() => {});
    assert(args.length === 0);

    args = getParamNames((a) => {});
    assert(args.length === 1);

    args = getParamNames((a,b) => {});
    assert(args.length === 2);

    args = getParamNames((a, b=1) => {});
    assert(args.length === 2);

    args = getParamNames((a = 1, b =2, c) => {});
    assert(args.length === 3);
  });

  it('should get attach data from method', () => {
    const m = new module();
    assert(getMethodMetadata('custom_attach', m, 'index').length === 3);
    assert(
      getMethodDataFromClass('custom_attach_to_class', module, 'index')
        .length === 3
    );
  });

  it('should get attach data from class', () => {
    assert(getClassMetadata('custom_class_attach', module).length === 4);
  });

  it('should get id from class', () => {
    assert(module.name === 'ManagerTest');
    assert(getProviderId(module) === 'managerTest');

    assert(getProviderId(class Test {}) === 'test');
  });

  it('should get property data', () => {
    const m = new module();
    assert(
      getPropertyMetadata('custom_property', m, 'testProperty') === 'property_a'
    );
    assert(
      getPropertyDataFromClass('custom_property_class', module, 'testProperty')
        .length === 3
    );
  });

  it('should get object definition metadata', () => {
    assert(getObjectDefinition(module).scope === 'Singleton');
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


  it('should generateProvideId be ok', () => {
    saveIdentifierMapping('@ok:test1', '123');
    const id = generateProvideId('@ok:test1', 'ok');
    assert.deepEqual('ok:test1', id, 'provide id is not ok:test1');
    const id2 = generateProvideId('ok:test1', 'ok');
    assert.deepEqual('ok:test1', id2, 'provide id is not ok:test1');
    clearAllModule();
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

});
