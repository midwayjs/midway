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
  MidwayContainer
} from "../../src";

describe('legacy/decorator.ts', () => {
  it('should save and get class metadata', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    saveClassMetadata('testKey', testData, TestClass);
    const result = getClassMetadata('testKey', TestClass);
    expect(result).toEqual(testData);
  });

  it('should attach and get class metadata', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    attachClassMetadata('testKey', testData, TestClass);
    const result = getClassMetadata('testKey', TestClass);
    expect(result).toContain(testData);
  });

  it('should attach and get class extended metadata', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    attachClassMetadata('testKey', testData, TestClass);
    const result = getClassExtendedMetadata('testKey', TestClass);
    expect(result).toContain(testData);
  });

  it("should", () => {

  });

  it('should save and get property data to class', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    savePropertyDataToClass('testKey', testData, TestClass, 'testProperty');
    const result = getPropertyDataFromClass('testKey', TestClass, 'testProperty');
    expect(result).toEqual(testData);
  });

  it('should attach and list property data from class', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    attachPropertyDataToClass('testKey', testData, TestClass, 'testProperty');
    const result = listPropertyDataFromClass('testKey', TestClass);
    expect(result).toContainEqual([testData]);
  });

  it('should save and get property metadata', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData = { key: 'value' };
    savePropertyMetadata('testKey', testData, TestClass.prototype, 'testProperty');
    const result = getPropertyMetadata('testKey', TestClass.prototype, 'testProperty');
    expect(result).toEqual(testData);
  });

  it('should attach and get property metadata', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData1 = { key: 'value1' };
    const testData2 = { key: 'value2' };

    attachPropertyMetadata('testKey', testData1, TestClass.prototype, 'testProperty');
    attachPropertyMetadata('testKey', testData2, TestClass.prototype, 'testProperty');

    const result = getPropertyMetadata('testKey', TestClass.prototype, 'testProperty');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(testData1);
    expect(result).toContainEqual(testData2);
  });

  it('should save and list preload module', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    savePreloadModule(TestClass);
    const result = listPreloadModule();
    expect(result).toContain(TestClass);
  });

  it('should save and list module', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    saveModule('testKey', TestClass);
    const result = listModule('testKey');
    expect(result).toContain(TestClass);
  });

  it('should bind and clear container', () => {
    const mockContainer = new MidwayContainer();
    bindContainer(mockContainer);
    clearBindContainer();
    expect(global['MIDWAY_GLOBAL_DECORATOR_MANAGER'].container).toBeNull();
  });

  it('should reset and clear all modules', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    saveModule('testKey', TestClass);
    resetModule('testKey');
    expect(listModule('testKey')).toEqual([]);

    saveModule('anotherKey', TestClass);
    clearAllModule();
    expect(listModule('anotherKey')).toEqual([]);
  });

  it('should save and get provider id', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    saveProviderId('testId', TestClass);
    const result = getProviderId(TestClass);
    expect(result).toBe('testId');
  });

  it('should get provider name and uuid', () => {
    class TestClass1 {}
    class TestClass2 {}
    saveProviderId('testId', TestClass1);
    expect(getProviderName(TestClass1)).toBe('testClass1');
    expect(getProviderUUId(TestClass1)).toBeDefined();
    saveProviderId(undefined, TestClass2);
    expect(getProviderName(TestClass2)).toBe('testClass2');
    expect(getProviderUUId(TestClass2)).toBeDefined();
  });

  it('should check if class is provided', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
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
    function Test(): ParameterDecorator {
      return () => {};
    }
    class TypeTestClass {
      testProperty: string;
      testMethod(@Test() param1: number, @Test() param2: boolean) {}
    }

    const propertyType = getPropertyType(TypeTestClass, 'testProperty');
    const methodParamTypes = getMethodParamTypes(TypeTestClass, 'testMethod');

    expect(propertyType).toStrictEqual({"isBaseType": true, "name": "undefined", "originDesign": undefined});
    expect(methodParamTypes.toString()).toEqual('function Number() { [native code] },function Boolean() { [native code] }');
  });

  it('should save and get property inject', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    savePropertyInject({
      identifier: 'testId',
      target: TestClass,
      targetKey: 'testProperty'
    });

    const result = getPropertyInject(TestClass);
    expect(result).toHaveProperty('testProperty');
  });

  it('should save and get object definition', () => {
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
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
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
    const testData1 = { key: 'value1' };
    const testData2 = { key: 'value2' };
    attachClassMetadata('testKey', testData1, TestClass);
    attachClassMetadata('testKey', testData2, TestClass);
    const result = getClassExtendedMetadata('testKey', TestClass);
    expect(result).toStrictEqual([testData1, testData2]);
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
    class TestClass {
      testProperty: string;
      testMethod() {}
    }
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
});
