import {
  clearAllModule,
  getClassMetadata,
  getMethodDataFromClass,
  getMethodMetadata,
  getParamNames,
  getPropertyMetadata,
  getPropertyDataFromClass,
  getProviderId,
  listMethodDataFromClass,
  listModule,
  listPreloadModule, getObjectDefinition
} from '../src';
import * as assert from 'assert';
import { ManagerTest as module } from './fixtures/decorator/customClass';

describe('/test/unit/base/decoratorManager.test.ts', () => {

  it('should save data on class and get it', () => {
    assert(getClassMetadata('custom', module) === 'test');
    assert(getClassMetadata('custom_method', module) === 'testSomething');
  });

  it('should save data to class and list it', () => {
    const dataRes = listMethodDataFromClass('custom', module);
    assert(dataRes.length === 1);

    const { method, data } = getMethodDataFromClass('custom', module, 'testSomething');
    assert(dataRes[ 0 ].method === method);
    assert(dataRes[ 0 ].data === data);
  });

  it('should get method meta data from method', () => {
    const m = new module();
    // 挂载到方法上的元信息必须有实例
    assert(getMethodMetadata('custom', m, 'testSomething') === 'methodData');
  });

  it('should list preload module', () => {
    const modules = listPreloadModule();
    assert(modules.length === 1);
  });

  it('should list module', () => {
    const modules = listModule('custom');
    assert(modules.length === 1);
  });

  it('should clear all module', () => {
    clearAllModule();
    let modules = listPreloadModule();
    assert(modules.length === 0);

    modules = listModule('custom');
    assert(modules.length === 0);
  });

  it('should get function args', () => {
    const args = getParamNames((a, b, c) => {
    });
    assert(args.length === 3);
  });

  it('should get attach data from method', () => {
    const m = new module();
    assert(getMethodMetadata('custom_attach', m, 'index').length === 3);
    assert(getMethodDataFromClass('custom_attach_to_class', module, 'index').length === 3);
  });

  it('should get attach data from class', () => {
    assert(getClassMetadata('custom_class_attach', module).length === 4);
  });

  it('should get id from class', () => {
    assert(module.name === 'ManagerTest');
    assert(getProviderId(module) === 'managerTest');
  });

  it('should get property data', () => {
    const m = new module();
    assert(getPropertyMetadata('custom_property', m, 'testProperty') === 'property_a');
    assert(getPropertyDataFromClass('custom_property_class', module, 'testProperty').length === 3);
  });

  it('should get object definition metadata', () => {
    assert(getObjectDefinition(module).scope === 'Singleton');
  });
});
