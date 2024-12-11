import {
  DecoratorManager,
  Provide,
  PRELOAD_MODULE_KEY,
  MetadataManager,
  CUSTOM_PARAM_INJECT_KEY,
  CUSTOM_METHOD_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY
} from '../../src';

describe('/test/decoratorManager.test.ts', () => {
  afterEach(() => {
    DecoratorManager.clearAllModule();
  });

  it('should save and list preload module', () => {
    class TestClass {}
    DecoratorManager.savePreloadModule(TestClass);
    let modules = DecoratorManager.listPreloadModule();
    expect(modules).toContain(TestClass);

    DecoratorManager.resetModule(PRELOAD_MODULE_KEY);
    modules = DecoratorManager.listPreloadModule();
    expect(modules).toHaveLength(0);
  });

  it('should save and list module', () => {
    class TestClass {}
    DecoratorManager.saveModule('testKey', TestClass);
    const modules = DecoratorManager.listModule('testKey');
    expect(modules).toContain(TestClass);

    const nothings = DecoratorManager.listModule('c_custom_notfound');
    expect(nothings).toHaveLength(0);
  });

  it('should save and get provider id', () => {
    class TestClass {}
    DecoratorManager.saveProviderId('testId', TestClass);
    const result = DecoratorManager.getProviderId(TestClass);
    expect(result).toBe('testId');
  });

  it('should get provider name and uuid', () => {
    class TestClass {}
    DecoratorManager.saveProviderId('testId', TestClass);
    expect(DecoratorManager.getProviderName(TestClass)).toBe('testClass');
    expect(DecoratorManager.getProviderUUId(TestClass)).toBeDefined();
  });

  it('should check if class is provided', () => {
    class TestClass {}
    DecoratorManager.saveProviderId('testId', TestClass);
    const result = DecoratorManager.isProvide(TestClass);
    expect(result).toBe(true);
  });

  it('should create custom decorators', () => {
    const propertyDecorator = DecoratorManager.createCustomPropertyDecorator('testKey', {});
    const methodDecorator = DecoratorManager.createCustomMethodDecorator('testKey', {});
    const paramDecorator = DecoratorManager.createCustomParamDecorator('testKey', {});

    expect(typeof propertyDecorator).toBe('function');
    expect(typeof methodDecorator).toBe('function');
    expect(typeof paramDecorator).toBe('function');
  });

  it('should handle Provide decorator', () => {
    @Provide()
    class TestClass {}
    expect(DecoratorManager.getProviderId(TestClass)).toBeUndefined();
    expect(DecoratorManager.getProviderName(TestClass)).toBe('testClass');
    expect(DecoratorManager.getProviderUUId(TestClass)).toBeDefined();
  });

  it('should save and list module with filter', () => {
    class TestClass1 {}
    class TestClass2 {}
    DecoratorManager.saveModule('testKey', TestClass1);
    DecoratorManager.saveModule('testKey', TestClass2);
    const modules = DecoratorManager.listModule('testKey', (module) => module === TestClass1);
    expect(modules).toContain(TestClass1);
    expect(modules).not.toContain(TestClass2);
  });

  it('should reset module', () => {
    class TestClass {}
    DecoratorManager.saveModule('testKey', TestClass);
    expect(DecoratorManager.listModule('testKey')).toContain(TestClass);
    DecoratorManager.resetModule('testKey');
    expect(DecoratorManager.listModule('testKey')).toHaveLength(0);
  });

  it('should get provider UUID', () => {
    @Provide()
    class TestClass {}
    const uuid = DecoratorManager.getProviderUUId(TestClass);
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
  });

  it('should create custom property decorator', () => {
    const decorator = DecoratorManager.createCustomPropertyDecorator('testKey', { test: 'value' });
    class TestClass {
      @decorator
      testProperty: string;
    }
    const metadata = MetadataManager.getOwnPropertiesWithMetadata(CUSTOM_PROPERTY_INJECT_KEY, TestClass);
    expect(metadata).toEqual({
      "testProperty": [
        {
          "key": "testKey",
          "metadata": {
            "test": "value"
          },
          "options": {
            "impl": true
          },
          "propertyName": "testProperty"
        }
      ]
    });
  });

  it('should create custom method decorator', () => {
    const decorator = DecoratorManager.createCustomMethodDecorator('testKey', { test: 'value' });
    class TestClass {
      @decorator
      testMethod() {}
    }
    const metadata = MetadataManager.getMetadata(CUSTOM_METHOD_INJECT_KEY, TestClass);
    expect(metadata).toEqual([
      {
        "key": "testKey",
        "metadata": {
          "test": "value"
        },
        "options": {
          "impl": true
        },
        "propertyName": "testMethod"
      }
    ]);
  });

  it('should create custom param decorator', () => {
    const decorator = DecoratorManager.createCustomParamDecorator('testKey', { test: 'value' });
    class TestClass {
      testMethod(@decorator param: string) {}
    }

    const metadata = MetadataManager.getOwnPropertiesWithMetadata(
      CUSTOM_PARAM_INJECT_KEY,
      TestClass
    )
    expect(metadata).toEqual({"testMethod": [{"key": "testKey", "metadata": {"test": "value"}, "options": {"impl": true}, "parameterIndex": 0, "propertyName": "testMethod"}]});
  });
});
