import { MetadataManager } from '../../src/decorator/metadataManager';

describe('MetadataManager.test.ts', () => {
  it('should define metadata', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(MetadataManager.getOwnMetadata('testKey', TestClass)).toBe('testValue');
  });

  it('should get metadata', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(MetadataManager.getMetadata('testKey', TestClass)).toBe('testValue');
  });

  it('should get own metadata', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(MetadataManager.getOwnMetadata('testKey', TestClass)).toBe('testValue');

    class TestClass2 extends TestClass {}
    expect(MetadataManager.getMetadata('testKey', TestClass2)).toBe('testValue');
    expect(MetadataManager.getOwnMetadata('testKey', TestClass2)).toBeUndefined();
  });

  it('should test hasOwnMetadata', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(MetadataManager.hasOwnMetadata('testKey', TestClass)).toBe(true);
  });

  it('should delete metadata', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    MetadataManager.deleteMetadata('testKey', TestClass);
    expect(MetadataManager.getOwnMetadata('testKey', TestClass)).toBeUndefined();
  });

  it('should check if metadata exists', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(MetadataManager.hasMetadata('testKey', TestClass)).toBe(true);
  });

  it('should get all metadata keys', () => {
    class TestClass {}
    MetadataManager.defineMetadata('testKey1', 'testValue1', TestClass);
    MetadataManager.defineMetadata('testKey2', 'testValue2', TestClass);
    const keys = MetadataManager.getOwnMetadataKeys(TestClass);
    expect(keys).toContain('testKey1');
    expect(keys).toContain('testKey2');
  });

  it('should get metadata keys from prototype chain', () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}

    MetadataManager.defineMetadata('testKey1', 'testValue1', ParentClass);
    MetadataManager.defineMetadata('testKey2', 'testValue2', ChildClass);
    MetadataManager.defineMetadata('testKey1', 'testValue3', ChildClass);
    const keys = MetadataManager.getMetadataKeys(ChildClass);
    expect(keys.length).toBe(2);
    expect(keys).toContain('testKey1');
    expect(keys).toContain('testKey2');
  });

  it('should get metadata from parent class', () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}

    MetadataManager.defineMetadata('testKey', 'testValue', ParentClass);
    expect(MetadataManager.getMetadata('testKey', ChildClass)).toBe('testValue');
  });

  it('should not get own metadata from parent class', () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}

    MetadataManager.defineMetadata('testKey', 'testValue', ParentClass);
    expect(MetadataManager.getOwnMetadata('testKey', ChildClass)).toBeUndefined();
  });

  it('should define metadata for a property', () => {
    class TestClass {
      public property: string;
    }
    MetadataManager.defineMetadata('testKey', 'testValue', TestClass, 'property');
    expect(MetadataManager.getOwnMetadata('testKey', TestClass, 'property')).toBe('testValue');
  });

  it('should get metadata from parent class property', () => {
    class ParentClass {
      public property: string;
    }
    class ChildClass extends ParentClass {}

    MetadataManager.defineMetadata('testKey', 'testValue', ParentClass, 'property');
    expect(MetadataManager.getMetadata('testKey', ChildClass, 'property')).toBe('testValue');
  });

  it('should not get own metadata from parent class property', () => {
    class ParentClass {
      public property: string;
    }
    class ChildClass extends ParentClass {}

    MetadataManager.defineMetadata('testKey', 'testValue', ParentClass, 'property');
    expect(MetadataManager.getOwnMetadata('testKey', ChildClass, 'property')).toBeUndefined();
  });

  it("should test class and method extends", () => {

    const Test = () => {
      return (target) => {
        console.log('[class]' + target.name);
      }
    }

    const TestMethod = () => {
      return (target, key, descriptor: PropertyDescriptor) => {
        console.log('[method]' + target.constructor.name + '.' + key);
      };
    }

    const TestProperty = () => {
      return (target, key) => {
        console.log('[property]' + target.constructor.name + '.' + key);
      };
    }

    @Test()
    class Parent {
      @TestMethod()
      public method() {}

      @TestProperty()
      public property: string;
    }

    @Test()
    class Child extends Parent {
      @TestMethod()
      public method() {}

      @TestProperty()
      public property: string;
    }

    new Child().method();
  });

  describe('MetadataManager copy metadata tests', () => {

    it('should copy metadata from different class use copyMetadata', () => {
      class SourceClass {
        public property: string;
      }
      class TargetClass {}

      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass);
      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass, 'property');
      MetadataManager.copyMetadata(SourceClass, TargetClass);

      expect(MetadataManager.getMetadata('testKey', TargetClass)).toBe('testValue');
      expect(MetadataManager.getMetadata('testKey', TargetClass, 'property')).toBe('testValue');
    });

    it('should copy metadata from different class use copyOwnMetadata', () => {
      class SourceClass {
        public property: string;
      }
      class TargetClass {}

      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass);
      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass, 'property');
      MetadataManager.copyOwnMetadata(SourceClass, TargetClass);

      expect(MetadataManager.getMetadata('testKey', TargetClass)).toBe('testValue');
      expect(MetadataManager.getMetadata('testKey', TargetClass, 'property')).toBe('testValue');
    });

    it('should copy own metadata from different class with overwrite', () => {
      class SourceClass {
        public property: string;
      }
      class TargetClass {
        public property: string;
      }

      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass);
      MetadataManager.defineMetadata('testKey', 'newValue', SourceClass, 'property');
      MetadataManager.defineMetadata('testKey', 'targetTestValue', TargetClass);
      MetadataManager.defineMetadata('testKey', 'targetTestNewValue', TargetClass, 'property');
      MetadataManager.copyOwnMetadata(SourceClass, TargetClass, { overwrite: false });

      expect(MetadataManager.getMetadata('testKey', TargetClass)).toBe('targetTestValue');
      expect(MetadataManager.getMetadata('testKey', TargetClass, 'property')).toBe('targetTestNewValue');
    });

    it('should copy own metadata from different class with default overwrite', () => {
      class SourceClass {
        public property: string;
      }
      class TargetClass {
        public property: string;
      }

      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass);
      MetadataManager.defineMetadata('testKey', 'newValue', SourceClass, 'property');
      MetadataManager.defineMetadata('testKey', 'targetTestValue', TargetClass);
      MetadataManager.defineMetadata('testKey', 'targetTestNewValue', TargetClass, 'property');
      MetadataManager.copyOwnMetadata(SourceClass, TargetClass, { overwrite: true });

      expect(MetadataManager.getMetadata('testKey', TargetClass)).toBe('testValue');
      expect(MetadataManager.getMetadata('testKey', TargetClass, 'property')).toBe('newValue');
    });

    it('should copy own metadata from different class with metadataKeyFilter', () => {
      class SourceClass {
        public property: string;
      }
      class TargetClass {}

      MetadataManager.defineMetadata('testKey', 'testValue', SourceClass);
      MetadataManager.defineMetadata('testPropertyKey', 'newValue', SourceClass, 'property');
      MetadataManager.copyOwnMetadata(SourceClass, TargetClass, {
        metadataFilter: (key) => key === 'testKey',
      });

      expect(MetadataManager.getMetadata('testKey', TargetClass)).toBe('testValue');
      expect(MetadataManager.getMetadata('testPropertyKey', TargetClass, 'property')).toBeUndefined();
    });

    it('should copy metadata with prototype chain', () => {
      class ParentClass {
        public property: string;
      }
      class ChildClass extends ParentClass {}
      class GrandChildClass {
        public property: string;
      }

      MetadataManager.defineMetadata('a', 1, ParentClass);
      MetadataManager.defineMetadata('a', 0, ParentClass, 'property');
      MetadataManager.defineMetadata('a', false, ChildClass);

      MetadataManager.copyMetadata(ChildClass, GrandChildClass);

      expect(MetadataManager.getMetadata('a', GrandChildClass)).toBe(false);
      expect(MetadataManager.getMetadata('a', GrandChildClass, 'property')).toBe(0);
    });

    it('should test dto pick', () => {
      class ParentClass {
        public a: string;
        public b: string;
        public c: string;
      }

      MetadataManager.defineMetadata('rule', 1, ParentClass, 'a');
      MetadataManager.defineMetadata('rule', 2, ParentClass, 'b');
      MetadataManager.defineMetadata('rule', 3, ParentClass, 'c');

      const pickedDto: any = function () {};
      pickedDto.prototype = ParentClass.prototype;

      MetadataManager.copyMetadata(ParentClass, pickedDto, {
        metadataFilter: (key, propertyKey) => {
          return key === "rule" && ["a", "b"].includes(propertyKey as string);
        },
      });

      class Test extends pickedDto {}

      expect(MetadataManager.getMetadata('rule', Test, 'a')).toBe(1);
      expect(MetadataManager.getMetadata('rule', Test, 'b')).toBe(2);
      expect(MetadataManager.getMetadata('rule', Test, 'c')).toBeUndefined();
    })
  });

  describe('MetadataManager Cache Tests', () => {

    class CacheMetadataManager extends MetadataManager {
      public static hasCache(
        metadataKey: string | symbol,
        target: any,
        propertyKey?: string | symbol
      ): boolean {
        const cache = this.getCache(metadataKey, target, propertyKey);
        return cache !== undefined && cache !== this.emptyValueSymbol;
      }
    }

    it('should cache metadata retrieval', () => {
      class TestClass {}

      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(false);
      CacheMetadataManager.defineMetadata('testKey', 'testValue', TestClass);

      // First retrieval should cache the result
      const firstRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass);
      expect(firstRetrieval).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(true);
    });

    it('should invalidate cache on metadata change', () => {
      class TestClass {}
      CacheMetadataManager.defineMetadata('testKey', 'testValue', TestClass);
      // No cache when metadata is first defined
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(false);

      // First retrieval should cache the result
      const firstRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass);
      expect(firstRetrieval).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(true);

      // Define new metadata which should invalidate the cache
      CacheMetadataManager.defineMetadata('testKey', 'newValue', TestClass);

      // Second retrieval should return the new value
      const secondRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass);
      expect(secondRetrieval).toBe('newValue');

      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(true);
    });

    it("should test remove cache when delete metadata", () => {
      class TestClass {}
      CacheMetadataManager.defineMetadata('testKey', 'testValue', TestClass);
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(false);
      expect(CacheMetadataManager.getMetadata('testKey', TestClass)).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(true);
      CacheMetadataManager.deleteMetadata('testKey', TestClass);
      expect(CacheMetadataManager.getMetadata('testKey', TestClass)).toBeUndefined();
      expect(CacheMetadataManager.hasCache('testKey', TestClass)).toBe(false);
    });

    it('should cache metadata for properties', () => {
      class TestClass {
        public property: string;
      }
      CacheMetadataManager.defineMetadata('testKey', 'testValue', TestClass, 'property');

      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(false);
      const firstRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass, 'property');
      expect(firstRetrieval).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(true);
    });

    it('should invalidate cache on property metadata change', () => {
      class TestClass {
        public property: string;
      }
      CacheMetadataManager.defineMetadata('testKey', 'testValue', TestClass, 'property');

      // No cache when metadata is first defined
      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(false);

      // First retrieval should cache the result
      const firstRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass, 'property');
      expect(firstRetrieval).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(true);
      // Define new metadata which should invalidate the cache
      CacheMetadataManager.defineMetadata('testKey', 'newValue', TestClass, 'property');

      // Second retrieval should return the new value
      const secondRetrieval = CacheMetadataManager.getMetadata('testKey', TestClass, 'property');
      expect(secondRetrieval).toBe('newValue');
      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(true);

      // delete
      CacheMetadataManager.deleteMetadata('testKey', TestClass, 'property');
      expect(CacheMetadataManager.getMetadata('testKey', TestClass, 'property')).toBeUndefined();
      expect(CacheMetadataManager.hasCache('testKey', TestClass, 'property')).toBe(false);
    });
  });

  describe('MetadataManager inheritance tests', () => {
    class CacheMetadataManager extends MetadataManager {
      public static hasCache(
        metadataKey: string | symbol,
        target: any,
        propertyKey?: string | symbol
      ): boolean {
        const cache = this.getCache(metadataKey, target, propertyKey);
        return cache !== undefined && cache !== this.emptyValueSymbol;
      }

      public static hooksSize(target) {
        if (!this['_metadataStore'].has(target)) {
          return 0;
        }
        const metadata = this['_metadataStore'].get(target);
        const hooks = metadata?.[this.cleanHooksSymbol];
        return hooks ? hooks.length : 0;
      }
    }

    it('should get metadata from parent class with cache', () => {
      class ParentClass {
        public property: string;
      }
      class ChildClass extends ParentClass {}

      CacheMetadataManager.defineMetadata('testKey', 'testValue', ParentClass);
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass)).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(true);

      // update parent metadata and will clean child cache
      CacheMetadataManager.defineMetadata('testKey', 'newValue', ParentClass);
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(false);

      // get metadata from parent class with cache
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass)).toBe('newValue');
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(true);

      // test property
      CacheMetadataManager.defineMetadata('testKey', 'testValue', ParentClass, 'property');
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass, 'property')).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', ChildClass, 'property')).toBe(true);

      // update
      CacheMetadataManager.defineMetadata('testKey', 'newValue', ParentClass, 'property');
      expect(CacheMetadataManager.hasCache('testKey', ChildClass, 'property')).toBe(false);

      // get metadata from parent class with cache
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass, 'property')).toBe('newValue');
      expect(CacheMetadataManager.hasCache('testKey', ChildClass, 'property')).toBe(true);
    });

    it("should clean cache with multi-level inheritance", () => {
      class ParentClass {}
      class ChildClass extends ParentClass {}
      class GrandChildClass extends ChildClass {}

      CacheMetadataManager.defineMetadata('testKey', 'testValue', ParentClass);

      expect(CacheMetadataManager.getMetadata('testKey', GrandChildClass)).toBe('testValue');
      expect(CacheMetadataManager.hasCache('testKey', GrandChildClass)).toBe(true);
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(false);

      CacheMetadataManager.defineMetadata('testKey', 'newValue', ParentClass);
      expect(CacheMetadataManager.hasCache('testKey', GrandChildClass)).toBe(false);
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(false);
      expect(CacheMetadataManager.getMetadata('testKey', GrandChildClass)).toBe('newValue');
      expect(CacheMetadataManager.hasCache('testKey', GrandChildClass)).toBe(true);
      expect(CacheMetadataManager.hasCache('testKey', ChildClass)).toBe(false);
    });

    it('should test remove cache and hooks length when define metadata', () => {
      class ParentClass {}
      class ChildClass extends ParentClass {}
      class GrandChildClass extends ChildClass {}

      CacheMetadataManager.defineMetadata('testKey', 'testValue', ParentClass);
      expect(CacheMetadataManager.getMetadata('testKey', GrandChildClass)).toBe('testValue');
      expect(CacheMetadataManager.hooksSize(ParentClass)).toBe(1);
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass)).toBe('testValue');
      expect(CacheMetadataManager.hooksSize(ParentClass)).toBe(2);

      // redefine metadata
      CacheMetadataManager.defineMetadata('testKey', 'newValue', ParentClass);
      expect(CacheMetadataManager.hooksSize(ParentClass)).toBe(0);
      expect(CacheMetadataManager.getMetadata('testKey', GrandChildClass)).toBe('newValue');
      expect(CacheMetadataManager.hooksSize(ParentClass)).toBe(1);
      expect(CacheMetadataManager.getMetadata('testKey', ChildClass)).toBe('newValue');
      expect(CacheMetadataManager.hooksSize(ParentClass)).toBe(2);
    });

    it('should test inheritance with attach metadata and get properties', () => {
      class ParentClass {}
      class ChildClass extends ParentClass {}

      CacheMetadataManager.attachMetadata('property_inject', 'a', ParentClass, 'propertyA');
      CacheMetadataManager.attachMetadata('property_inject', 'b', ChildClass, 'propertyB');

      expect(CacheMetadataManager.getMetadata('property_inject', ChildClass, 'propertyB')).toStrictEqual(['b']);
      expect(CacheMetadataManager.getMetadata('property_inject', ParentClass, 'propertyA')).toStrictEqual(['a']);

      expect(CacheMetadataManager.getOwnPropertiesWithMetadata('property_inject', ChildClass)).toStrictEqual({
        propertyB: ['b']
      });

      expect(CacheMetadataManager.getPropertiesWithMetadata('property_inject', ChildClass)).toStrictEqual({
        propertyB: ['b'],
        propertyA: ['a']
      });
    });

    it('should test inheritance with same property and attach metadata', () => {
      class ParentClass {
        public property: string;
      }
      class ChildClass extends ParentClass {}

      CacheMetadataManager.attachMetadata('property_inject', 'a', ParentClass, 'property');
      CacheMetadataManager.attachMetadata('property_inject', 'b', ChildClass, 'property');

      expect(CacheMetadataManager.getPropertiesWithMetadata('property_inject', ChildClass)).toStrictEqual({
        property: ['b'],
      });
    });
  });

  describe('MetadataManager Object Type Tests', () => {
    it('should handle Object type with ensureTargetType and defineMetadata', () => {
      const configuration = {};
      const options = {
        namespace: 'test-namespace',
        detector: 'test-detector',
        onReady: () => console.log('ready')
      };

      // 模拟 defineConfiguration 的行为
      MetadataManager.ensureTargetType(
        configuration,
        MetadataManager.ObjectType.Object
      );
      MetadataManager.defineMetadata(
        'test-configuration-key',
        options,
        configuration
      );

      // 验证元数据能被正确存储和读取
      expect(MetadataManager.hasOwnMetadata('test-configuration-key', configuration)).toBe(true);
      expect(MetadataManager.getOwnMetadata('test-configuration-key', configuration)).toEqual(options);
      expect(MetadataManager.getOwnMetadata('test-configuration-key', configuration).namespace).toBe('test-namespace');
    });

    it('should preserve all properties when storing Object metadata', () => {
      const obj = {};
      const complexOptions = {
        namespace: 'hooks',
        detector: { type: 'custom', modules: ['ModuleA', 'ModuleB'] },
        imports: ['import1', 'import2'],
        onReady: async () => 'ready',
        onStop: async () => 'stop',
        customProp: { nested: { value: 42 } }
      };

      MetadataManager.ensureTargetType(obj, MetadataManager.ObjectType.Object);
      MetadataManager.defineMetadata('complex-config', complexOptions, obj);

      const retrieved = MetadataManager.getOwnMetadata('complex-config', obj);
      expect(retrieved).toEqual(complexOptions);
      expect(retrieved.namespace).toBe('hooks');
      expect(retrieved.detector.modules).toEqual(['ModuleA', 'ModuleB']);
      expect(retrieved.customProp.nested.value).toBe(42);
    });

    it('should handle multiple metadata keys on same Object', () => {
      const obj = {};
      MetadataManager.ensureTargetType(obj, MetadataManager.ObjectType.Object);

      MetadataManager.defineMetadata('key1', { value: 'test1' }, obj);
      MetadataManager.defineMetadata('key2', { value: 'test2' }, obj);

      expect(MetadataManager.hasOwnMetadata('key1', obj)).toBe(true);
      expect(MetadataManager.hasOwnMetadata('key2', obj)).toBe(true);
      expect(MetadataManager.getOwnMetadata('key1', obj).value).toBe('test1');
      expect(MetadataManager.getOwnMetadata('key2', obj).value).toBe('test2');
    });

    it('should correctly handle functional configuration workflow with ensureTargetType', () => {
      // 模拟 defineConfiguration 的完整工作流程
      const CONFIGURATION_OBJECT_KEY = 'common:configuration_object';

      // 创建一个功能配置选项，包含命名空间
      const configOptions = {
        namespace: 'hooks',
        detector: { modules: ['TestModule'] },
        onReady: async () => console.log('ready'),
        onStop: async () => console.log('stop'),
        imports: ['some-import']
      };

      // 创建配置对象
      const configuration = { options: configOptions };

      // 执行 defineConfiguration 的关键步骤
      MetadataManager.ensureTargetType(
        configuration,
        MetadataManager.ObjectType.Object
      );
      MetadataManager.defineMetadata(
        CONFIGURATION_OBJECT_KEY,
        configOptions,
        configuration
      );

      // 验证目标类型被正确设置（通过formatTarget的行为来验证）
      // 如果ensureTargetType正确工作，formatTarget应该返回原对象
      const formattedTarget = MetadataManager['formatTarget'](configuration);
      expect(formattedTarget).toBe(configuration);

      // 验证元数据被正确存储
      expect(MetadataManager.hasOwnMetadata(CONFIGURATION_OBJECT_KEY, configuration)).toBe(true);

      // 验证配置选项完整性，特别是 namespace
      const storedConfig = MetadataManager.getOwnMetadata(CONFIGURATION_OBJECT_KEY, configuration);
      expect(storedConfig).toEqual(configOptions);
      expect(storedConfig.namespace).toBe('hooks');
      expect(storedConfig.detector.modules).toEqual(['TestModule']);

      // 模拟组件加载器读取配置的过程
      if (MetadataManager.hasOwnMetadata(CONFIGURATION_OBJECT_KEY, configuration)) {
        const configurationOptions = MetadataManager.getOwnMetadata(CONFIGURATION_OBJECT_KEY, configuration);
        expect(configurationOptions.namespace).toBe('hooks');
        expect(configurationOptions).toBeDefined();
      } else {
        fail('Configuration metadata should be found');
      }
    });

    it('should detect ensureTargetType implementation correctness', () => {
      const obj = {};

      // 清除任何可能存在的元数据
      MetadataManager.clear();

      // 调用 ensureTargetType
      MetadataManager.ensureTargetType(obj, MetadataManager.ObjectType.Object);

      // 关键测试：验证 isClassSymbol 是否被存储在元数据系统中
      // 如果使用错误的 Object.defineProperty，这个测试会失败
      const hasSymbolInMetadata = MetadataManager['hasOwnProperty'](obj, MetadataManager['isClassSymbol']);
      expect(hasSymbolInMetadata).toBe(true);

      // 验证能通过元数据系统读取到类型
      const typeFromMetadata = MetadataManager['getOwnProperty'](obj, MetadataManager['isClassSymbol']);
      expect(typeFromMetadata).toBe(MetadataManager.ObjectType.Object);

      // 验证不会在对象本身上创建属性
      expect(obj.hasOwnProperty(MetadataManager['isClassSymbol'])).toBe(false);
    });
  });
});
