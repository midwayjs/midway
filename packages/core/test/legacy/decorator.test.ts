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
  Get,
  DecoratorManager,
  PRELOAD_MODULE_KEY,
  Init, Inject
} from '../../src';

describe('legacy/decorator.test.ts', () => {
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

  describe('legacy decoratorManager case', () => {
    function customCls(): ClassDecorator {
      return (target) => {
        saveClassMetadata('custom', 'test', target);
        saveModule('custom', target);
      };
    }

    function preload(): ClassDecorator {
      return (target) => {
        savePreloadModule(target);
      };
    }

    function customMethod(): MethodDecorator {
      return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
        savePropertyDataToClass('custom', {
          method: propertykey,
          data: 'customData',
        }, target, propertykey);

        savePropertyMetadata('custom', 'methodData', target, propertykey);
        saveClassMetadata('custom_method', propertykey, target);
      };
    }

    function attachMethod(data): MethodDecorator {
      return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
        attachPropertyMetadata('custom_attach', data, target, propertykey);
        attachPropertyDataToClass('custom_attach_to_class', data, target, propertykey);
      };
    }

    function attachClass(data): ClassDecorator {
      return (target: object) => {
        attachClassMetadata('custom_class_attach', data, target);
      };
    }

    function propertyKeyA(data): PropertyDecorator {
      return (target: object, propertyKey) => {
        savePropertyMetadata('custom_property', data, target, propertyKey);
      };
    }

    function propertyKeyB(data): PropertyDecorator {
      return (target: object, propertyKey) => {
        attachPropertyDataToClass('custom_property_class', data, target, propertyKey);
      };
    }

    afterEach(() => {
      clearAllModule();
    });

    it('should save data on class and get it', () => {
      @customCls()
      class TestClass {
        @customMethod()
        testSomething() {}
      }
      expect(getClassMetadata('custom', TestClass)).toBe('test');
      expect(getClassMetadata('custom_method', TestClass)).toBe('testSomething');
    });

    it('should save data to class and list it', () => {
      @customCls()
      class TestClass {
        @customMethod()
        testSomething() {}
      }
      const dataRes = listPropertyDataFromClass('custom', TestClass);
      expect(dataRes.length).toBe(1);

      const { method, data } = getPropertyDataFromClass(
        'custom',
        TestClass,
        'testSomething'
      );
      expect(dataRes[0].method).toBe(method);
      expect(dataRes[0].data).toBe(data);
    });

    it('should get method meta data from method', () => {
      class TestClass {
        @customMethod()
        testSomething() {}
      }
      const m = new TestClass();
      expect(getPropertyMetadata('custom', m, 'testSomething')).toBe('methodData');
    });

    it('should list preload module', () => {
      @preload()
      class TestClass {}
      console.log(TestClass);
      let modules = listPreloadModule();
      expect(modules.length).toBe(1);

      resetModule(PRELOAD_MODULE_KEY);
      modules = listPreloadModule();
      expect(modules.length).toBe(0);
    });

    it('should list module', () => {
      @customCls()
      class TestClass {}
      console.log(TestClass);
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

    it('should get attach data from method', () => {
      class TestClass {
        @attachMethod('test')
        index() {}
      }
      const m = new TestClass();
      expect(getPropertyMetadata('custom_attach', m, 'index').length).toBe(1);
      expect(
        getPropertyDataFromClass('custom_attach_to_class', TestClass, 'index').length
      ).toBe(1);
    });

    it('should get attach data from class', () => {
      @attachClass('test')
      class TestClass {}
      expect(getClassMetadata('custom_class_attach', TestClass).length).toBe(1);
    });

    it('should get name from class', () => {
      class TestClass {}
      saveProviderId('123', TestClass);
      expect(TestClass.name).toBe('TestClass');
      expect(getProviderName(TestClass)).toBe('testClass');
      expect(getProviderName(class Test {})).toBeUndefined();
    });

    it('should get id from class', () => {
      class TestClass {}
      DecoratorManager.saveProviderId('123', TestClass);
      expect(getProviderId(TestClass)).toBe('123');
    });

    it('should get property data', () => {
      class TestClass {
        @propertyKeyA('property_a')
        @propertyKeyB('test_b')
        testProperty: string;
      }
      const m = new TestClass();
      expect(getPropertyMetadata('custom_property', m, 'testProperty')).toBe('property_a');
      expect(
        getPropertyDataFromClass('custom_property_class', TestClass, 'testProperty').length
      ).toBe(1);
    });

    it('should get object definition metadata', () => {
      class TestClass {
        @Init()
        async init() {}
      }
      const objDefinition = getObjectDefinition(TestClass);
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
        alias: CreateCatDto;
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
      expect(getType('alias')).toBe('CreateCatDto');
    });

    it('should test getMethodParamTypes', function () {
        const obj = { ccc: 'd' };
        class D {}
        class A {
          constructor(@Inject() a: string) {
          }
          @Get()
          async invoke(
            @Inject()
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

        const paramTypes1 = getMethodParamTypes(A, undefined);
        expect(paramTypes1.length).toBe(1);

        const paramTypes2 = getMethodParamTypes(A, 'invoke2');
        expect(paramTypes2.length).toBe(4);
      });
  });
});
