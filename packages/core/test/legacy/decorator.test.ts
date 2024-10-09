import {
  saveClassMetadata,
  attachClassMetadata,
  getClassExtendedMetadata,
  getClassMetadata,
  savePropertyDataToClass,
  attachPropertyDataToClass,
  getPropertyDataFromClass,
  listPropertyDataFromClass,
  savePropertyMetadata,
  attachPropertyMetadata,
  getPropertyMetadata,
  savePreloadModule,
  listPreloadModule,
  saveModule,
  bindContainer,
  clearBindContainer,
  listModule,
  resetModule,
  clearAllModule,
  saveProviderId,
  getProviderId,
  getProviderName,
  getProviderUUId,
  isProvide,
  createCustomPropertyDecorator,
  createCustomMethodDecorator,
  createCustomParamDecorator,
  getPropertyType,
  getMethodParamTypes,
  savePropertyInject,
  getPropertyInject,
  saveObjectDefinition,
  getObjectDefinition,
} from '../../src/legacy/decorator';

describe('legacy/decorator.ts', () => {
  class TestClass {
    testProperty: string;
    testMethod() {}
  }

  it('should save and get class metadata', () => {
    const testData = { key: 'value' };
    saveClassMetadata('testKey', testData, TestClass);
    const result = getClassMetadata('testKey', TestClass);
    expect(result).toEqual(testData);
  });

  it('should attach and get class metadata', () => {
    const testData = { key: 'value' };
    attachClassMetadata('testKey', testData, TestClass);
    const result = getClassExtendedMetadata('testKey', TestClass);
    expect(result).toHaveProperty('TestClass', testData);
  });

  it('should save and get property data to class', () => {
    const testData = { key: 'value' };
    savePropertyDataToClass('testKey', testData, TestClass, 'testProperty');
    const result = getPropertyDataFromClass('testKey', TestClass, 'testProperty');
    expect(result).toEqual(testData);
  });

  it('should attach and list property data from class', () => {
    const testData = { key: 'value' };
    attachPropertyDataToClass('testKey', testData, TestClass, 'testProperty');
    const result = listPropertyDataFromClass('testKey', TestClass);
    expect(result).toContainEqual([testData]);
  });

  it('should save and get property metadata', () => {
    const testData = { key: 'value' };
    savePropertyMetadata('testKey', testData, TestClass.prototype, 'testProperty');
    const result = getPropertyMetadata('testKey', TestClass.prototype, 'testProperty');
    expect(result).toEqual(testData);
  });

  it('should save and list preload module', () => {
    savePreloadModule(TestClass);
    const result = listPreloadModule();
    expect(result).toContain(TestClass);
  });

  it('should save and list module', () => {
    saveModule('testKey', TestClass);
    const result = listModule('testKey');
    expect(result).toContain(TestClass);
  });

  it('should bind and clear container', () => {
    const mockContainer = { get: jest.fn() };
    bindContainer(mockContainer);
    clearBindContainer();
    // 这里可以添加一些断言来确保容器被正确绑定和清除
  });

  it('should reset and clear all modules', () => {
    saveModule('testKey', TestClass);
    resetModule('testKey');
    expect(listModule('testKey')).toEqual([]);
    
    saveModule('anotherKey', TestClass);
    clearAllModule();
    expect(listModule('anotherKey')).toEqual([]);
  });

  it('should save and get provider id', () => {
    saveProviderId('testId', TestClass);
    const result = getProviderId(TestClass);
    expect(result).toBe('testId');
  });

  it('should get provider name and uuid', () => {
    const name = getProviderName(TestClass);
    const uuid = getProviderUUId(TestClass);
    expect(name).toBe('TestClass');
    expect(uuid).toBeDefined();
  });

  it('should check if class is provided', () => {
    saveProviderId('testId', TestClass);
    const result = isProvide(TestClass);
    expect(result).toBe(true);
  });

  it('should create custom decorators', () => {
    const propertyDecorator = createCustomPropertyDecorator('testKey', {});
    const methodDecorator = createCustomMethodDecorator('testKey', {});
    const paramDecorator = createCustomParamDecorator('testKey', {});

    expect(typeof propertyDecorator).toBe('function');
    expect(typeof methodDecorator).toBe('function');
    expect(typeof paramDecorator).toBe('function');
  });

  it('should get property type and method param types', () => {
    class TypeTestClass {
      testProperty: string;
      testMethod(param1: number, param2: boolean) {}
    }

    const propertyType = getPropertyType(TypeTestClass.prototype, 'testProperty');
    const methodParamTypes = getMethodParamTypes(TypeTestClass.prototype, 'testMethod');

    expect(propertyType).toBe(String);
    expect(methodParamTypes).toEqual([Number, Boolean]);
  });

  it('should save and get property inject', () => {
    savePropertyInject({
      identifier: 'testId',
      target: TestClass,
      targetKey: 'testProperty'
    });

    const result = getPropertyInject(TestClass);
    expect(result).toHaveProperty('testProperty');
  });

  it('should save and get object definition', () => {
    const testDefinition = { scope: 'Singleton' };
    saveObjectDefinition(TestClass, testDefinition);
    const result = getObjectDefinition(TestClass);
    expect(result).toEqual(expect.objectContaining(testDefinition));
  });

  // 新增的测试用例
  it('should list module with filter', () => {
    class TestClass1 {}
    class TestClass2 {}
    saveModule('testKey', TestClass1);
    saveModule('testKey', TestClass2);
    const result = listModule('testKey', (module) => module === TestClass1);
    expect(result).toContain(TestClass1);
    expect(result).not.toContain(TestClass2);
  });

  it('should handle multiple attachClassMetadata calls', () => {
    const testData1 = { key: 'value1' };
    const testData2 = { key: 'value2' };
    attachClassMetadata('testKey', testData1, TestClass);
    attachClassMetadata('testKey', testData2, TestClass);
    const result = getClassExtendedMetadata('testKey', TestClass);
    expect(result).toHaveProperty('TestClass', [testData1, testData2]);
  });

  it('should handle createCustomMethodDecorator with options', () => {
    const methodDecorator = createCustomMethodDecorator('testKey', {}, { impl: false });
    expect(typeof methodDecorator).toBe('function');
  });

  it('should handle createCustomParamDecorator with options', () => {
    const paramDecorator = createCustomParamDecorator('testKey', {}, { impl: false });
    expect(typeof paramDecorator).toBe('function');
  });

  it('should handle getPropertyInject with useCache option', () => {
    savePropertyInject({
      identifier: 'testId',
      target: TestClass,
      targetKey: 'testProperty'
    });

    const result1 = getPropertyInject(TestClass, true);
    const result2 = getPropertyInject(TestClass, false);
    expect(result1).toHaveProperty('testProperty');
    expect(result2).toHaveProperty('testProperty');
  });
});