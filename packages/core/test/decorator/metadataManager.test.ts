import { MetadataManager } from '../../src/decorator/metadataManager';

describe('MetadataManager.test.ts', () => {
  let metadataManager: MetadataManager = new MetadataManager();

  it('should create an instance', () => {
    expect(metadataManager).toBeInstanceOf(MetadataManager);
  });

  it('should define metadata', () => {
    class TestClass {}
    metadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(metadataManager.getOwnMetadata('testKey', TestClass)).toBe('testValue');
  });

  it('should get metadata', () => {
    class TestClass {}
    metadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(metadataManager.getMetadata('testKey', TestClass)).toBe('testValue');
  });

  it('should delete metadata', () => {
    class TestClass {}
    metadataManager.defineMetadata('testKey', 'testValue', TestClass);
    metadataManager.deleteMetadata('testKey', TestClass);
    expect(metadataManager.getOwnMetadata('testKey', TestClass)).toBeUndefined();
  });

  it('should check if metadata exists', () => {
    class TestClass {}
    metadataManager.defineMetadata('testKey', 'testValue', TestClass);
    expect(metadataManager.hasMetadata('testKey', TestClass)).toBe(true);
  });

  it('should get all metadata keys', () => {
    class TestClass {}
    metadataManager.defineMetadata('testKey1', 'testValue1', TestClass);
    metadataManager.defineMetadata('testKey2', 'testValue2', TestClass);
    const keys = metadataManager.getMetadataKeys(TestClass);
    expect(keys).toContain('testKey1');
    expect(keys).toContain('testKey2');
  });

  it('should get metadata from parent class', () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}

    metadataManager.defineMetadata('testKey', 'testValue', ParentClass);
    expect(metadataManager.getMetadata('testKey', ChildClass)).toBe('testValue');
  });

  it('should not get own metadata from parent class', () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}

    metadataManager.defineMetadata('testKey', 'testValue', ParentClass);
    expect(metadataManager.getOwnMetadata('testKey', ChildClass)).toBeUndefined();
  });

  it('should define metadata for a property', () => {
    class TestClass {
      public property: string;
    }
    metadataManager.defineMetadata('testKey', 'testValue', TestClass, 'property');
    expect(metadataManager.getOwnMetadata('testKey', TestClass, 'property')).toBe('testValue');
  });

  it('should get metadata from parent class property', () => {
    class ParentClass {
      public property: string;
    }
    class ChildClass extends ParentClass {}

    metadataManager.defineMetadata('testKey', 'testValue', ParentClass, 'property');
    expect(metadataManager.getMetadata('testKey', ChildClass, 'property')).toBe('testValue');
  });

  it('should not get own metadata from parent class property', () => {
    class ParentClass {
      public property: string;
    }
    class ChildClass extends ParentClass {}

    metadataManager.defineMetadata('testKey', 'testValue', ParentClass, 'property');
    expect(metadataManager.getOwnMetadata('testKey', ChildClass, 'property')).toBeUndefined();
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
});
