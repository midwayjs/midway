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
  saveModule,
  Init,
  Get,
  getMethodParamTypes,
  attachClassMetadata,
  attachPropertyDataToClass,
  saveClassMetadata,
  savePreloadModule,
  saveProviderId,
} from '../../src';

// 从 customClass.ts 复制的装饰器
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

describe('/test/decoratorManager.test.ts', () => {

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
