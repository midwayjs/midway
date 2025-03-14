import {
  MidwayConfigService,
  MidwayContainer as Container,
  MidwayEnvironmentService,
  MidwayFrameworkService,
  MidwayInformationService,
  MidwayLoggerService,
  MidwayDecoratorService,
  MidwayAspectService,
  APPLICATION_KEY,
  CONFIG_KEY,
  PLUGIN_KEY,
  INJECT_TAG,
  Inject,
  Config,
  Plugin,
  App,
  Provide,
  MetadataManager,
  Init,
  sleep,
  Scope,
  ScopeEnum,
  MidwayDefinitionNotFoundError,
  MidwayContainer,
  LazyInject
} from '../../src';
import {
  Grandson,
  BaseService,
  BaseServiceAsync,
  Katana,
} from '../fixtures/class_sample';

import { BMWX1, Car, Electricity, Gas, Tesla, Turbo } from '../fixtures/class_sample_car';
import { childAsyncFunction,
  childFunction,
  testInjectAsyncFunction,
  testInjectFunction,
  singletonFactory2,
  AliSingleton,
  singletonFactory
} from '../fixtures/fun_sample';

describe('/test/context/container.test.ts', () => {

  it('Should be able to store bindings', () => {
    const ninjaId = 'Ninja';
    const container = new Container();
    class Ninja {
      katana1;
      katana2;
    }
    container.bind<Ninja>(ninjaId, Ninja as any);
    const ninja = container.get(ninjaId);
    expect(ninja instanceof Ninja).toBeTruthy();
  });

  it('should inject attributes that on the prototype chain and property', () => {
    const container = new Container();
    class Katana {}
    class Parent {
      @Inject('katana1')
      katana1: Katana;
    }
    class Child extends Parent {
      @Inject('katana2')
      katana2: Katana;
    }
    class Grandson extends Child {
      @Inject('katana3')
      katana3: Katana;
    }
    container.bind<Grandson>('grandson', Grandson as any);
    container.bind<Grandson>('katana1', Katana as any);
    container.bind<Grandson>('katana2', Katana as any);
    container.bind<Grandson>('katana3', Katana as any);
    const grandson = container.get<Grandson>('grandson');
    expect(grandson instanceof Child).toBeTruthy();
    expect(grandson instanceof Parent).toBeTruthy();
    expect(grandson.katana1).toBeDefined();
    expect(grandson.katana2).toBeDefined();
    expect(grandson.katana3).toBeDefined();
  });

  it('should get all metaDatas that on the prototype chain and property', () => {
    const container = new Container();
    class Parent {
      @Inject('katana1')
      katana1: Katana;
    }
    class Child extends Parent {
      @Inject('katana2')
      katana2: Katana;
    }
    class Grandson extends Child {
      @Inject('katana3')
      katana3: Katana;
    }
    container.bind<Grandson>('grandson', Grandson as any);
    container.bind<Grandson>('child', Child as any);
    container.bind<Grandson>('parent', Parent as any);
    container.bind<Grandson>('katana1', Katana as any);
    container.bind<Grandson>('katana2', Katana as any);
    container.bind<Grandson>('katana3', Katana as any);
    const metadatas = ['grandson', 'child', 'parent'].map(function (identifier) {
      const defition = container.registry.getDefinition(identifier);
      const tareget = defition.path;
      return {
        recursiveMetadata: MetadataManager.getPropertiesWithMetadata(INJECT_TAG, tareget),
      };
    });
    const grandsonMetadata = metadatas[0];
    const childMetadata = metadatas[1];
    const parentMetadata = metadatas[2];

    expect(Object.keys(grandsonMetadata.recursiveMetadata)).toEqual(["katana3", "katana2", "katana1"]);
    expect(Object.keys(childMetadata.recursiveMetadata)).toEqual(["katana2", "katana1"]);
    expect(Object.keys(parentMetadata.recursiveMetadata)).toEqual(["katana1"]);
  });

  it('should extends base with decorator be ok', async () => {
    const container = new Container();
    class ParentCustom {
      @Config('hello')
      hello: any;

      @App()
      a: any;

      @Plugin('hh')
      p: any;
    }
    @Provide()
    class SubCustom extends ParentCustom {
      @Config('tt')
      tt: any;

      @App()
      a: any;

      @Plugin()
      bb: any;
    }
    container.bind(SubCustom);
    container.bind(MidwayFrameworkService);
    container.bind(MidwayConfigService);
    container.bind(MidwayLoggerService);
    container.bind(MidwayEnvironmentService);
    container.bind(MidwayInformationService);
    container.bind(MidwayAspectService);
    container.bind(MidwayDecoratorService);
    container.registerObject('appDir', '');
    container.registerObject('baseDir', '');

    const frameworkService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    frameworkService.registerPropertyHandler(APPLICATION_KEY, () => {
      return {appName: 'hello'};
    });
    frameworkService.registerPropertyHandler(PLUGIN_KEY, (propertyName, meta) => {
      if (meta.identifier === 'hh') {
        return {hh: 123};
      }
      return {d: 'hello'};
    });
    frameworkService.registerPropertyHandler(CONFIG_KEY, (propertyName, meta) => {
      if (meta.identifier === 'hello') {
        return {hello: 'this is hello config'}
      }

      if (meta.identifier === 'tt') {
        return 'this is tt config';
      }

      return {};
    });

    const inst: SubCustom = await container.getAsync('subCustom');
    expect(inst.a).toStrictEqual({ appName: 'hello'});
    expect(inst.bb).toStrictEqual({ d: 'hello' });
    expect(inst.hello).toStrictEqual({hello: 'this is hello config'});
    expect(inst.p).toStrictEqual({hh: 123});
    expect(inst.tt).toEqual('this is tt config');
  });

  it('should throw error with class name when injected property error', async () => {
    const container = new Container();
    container.bind<Grandson>('grandson', Grandson as any);

    expect(() => container.get('grandson')).toThrow(/Grandson/);
    expect(() => container.get('nograndson')).toThrow(/nograndson/);

    // container.get('grandson')

    await expect(container.getAsync('grandson')).rejects.toThrow(/Grandson/);
    await expect(container.getAsync('nograndson')).rejects.toThrow(/nograndson/);
  });

  it('should bind class directly', () => {
    const container = new Container();
    container.bind(Katana);
    const ins1 = container.get(Katana);
    const ins2 = container.get('katana');
    expect(ins1).toEqual(ins2);
  });

  it('should use get async method replace get', async () => {
    const container = new Container();
    container.bind(BaseService);
    const ins = await container.getAsync(BaseService);
    expect(ins instanceof BaseService).toBeTruthy();
  });

  it('should execute async init method when object created', async () => {
    const container = new Container();
    container.bind(BaseServiceAsync);
    const ins = await container.getAsync(BaseServiceAsync) as BaseServiceAsync;
    expect(ins.foodNumber).toEqual(20);
  });

  it('should support constructor inject', async () => {
    const container = new Container();
    container.bind('engine', Turbo);
    container.bind('fuel', Gas);
    container.bind(Car);

    const car = await container.getAsync(Car) as Car;
    car.run();
    expect(car.getFuelCapacity()).toEqual(35);
  });

  it('should support constructor inject from parent', async () => {
    const container = new Container();
    container.bind('engine', Turbo);
    container.bind('fuel', Gas);
    container.bind(BMWX1);

    const car = await container.getAsync(BMWX1) as Car;
    car.run();
    expect(car.getFuelCapacity()).toEqual(35);
    expect(car.getBrand()).toEqual('bmw');
  });

  it('should inject constructor parameter in order', async () => {
    const container = new Container();
    container.bind(Tesla);
    container.bind('engine', Turbo);
    container.bind('fuel', Electricity);

    const car = await container.getAsync(Tesla) as Car;
    car.run();
    expect(car.getFuelCapacity()).toEqual(130);
  });

  describe('inject function', () => {

    it('should get function module', () => {
      const container = new Container();
      container.bind('parent', testInjectFunction);
      container.bind('child', childFunction);
      const result = container.get('parent');
      expect(result).toEqual(3);
    });

    it('should get async function module', async () => {
      const container = new Container();
      container.bind('parentAsync', testInjectAsyncFunction);
      container.bind('childAsync', childAsyncFunction);
      const result = await container.getAsync('parentAsync');
      expect(result).toEqual(7);
    });
  });

  describe('mix suit', () => {
    it('should use factory dynamic create object', () => {
      const container = new Container();
      interface Engine {
        capacity;
      }

      @Scope(ScopeEnum.Prototype)
      @Provide('petrol')
      class PetrolEngine implements Engine {
        capacity = 10;
      }

      @Scope(ScopeEnum.Prototype)
      @Provide('diesel')
      class DieselEngine implements Engine {
        capacity = 20;
      }

      function engineFactory(context) {
        return (named: string) => {
          return context.get(named);
        };
      }

      @Provide()
      class DieselCar {
        dieselEngine: Engine;
        backUpDieselEngine: Engine;

        @Inject('engineFactory')
        factory: (category: string) => Engine;

        @Init()
        init() {
          this.dieselEngine = this.factory('diesel') as Engine;
          this.backUpDieselEngine = this.factory('diesel') as Engine;
        }

        run() {
          this.dieselEngine.capacity -= 5;
        }
      }

      container.bind('engineFactory', engineFactory);
      container.bind(DieselCar);
      container.bind(PetrolEngine);
      container.bind(DieselEngine);
      const result = container.get<DieselCar>(DieselCar);
      result.run();
      expect(result.dieselEngine.capacity).toEqual(15);
      expect(result.backUpDieselEngine.capacity).toEqual(20);
    });
  });

  describe('function definition', () => {
    const container = new Container();

    it('factory function should be ok', async () => {
      container.bind(AliSingleton);
      container.bind('singletonFactory', singletonFactory);
      container.bind('singletonFactory2', singletonFactory2);

      const arr = await Promise.all([
        container.getAsync('aliSingleton'),
        container.getAsync('singletonFactory'),
        container.getAsync('singletonFactory2'),
      ]);

      const s = arr[0] as AliSingleton;
      const fn = arr[2] as any;
      expect(s.getInstance()).toEqual('alisingleton');
      expect(await fn()).toEqual('alisingleton');
    });
  });

  describe('new get object and async object', () => {
    it('should test new get async method', async () => {
      @Provide()
      class C {
        name = 'c';
      }

      @Provide()
      class B {
        name = 'b';
        @Inject()
        c: C
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      const a = await container.getAsync(A);
      expect(a.name).toEqual('a');
      expect(a.b.name).toEqual('b');
      expect(a.b.c.name).toEqual('c');
    });

    it('should test new get async method 2', async () => {
      @Provide()
      class B {
        name = 'b';

        @Init()
        async init() {
          await sleep(200);
          this.name = 'e';
        }
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B

        @Init()
        async init() {
          this.name = this.b.name;
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);

      const a = await container.getAsync(A);
      expect(a.name).toBe('e');
    });

    it('should test new get async method and with async init', async () => {
      @Provide()
      class C {
        name = 'c';

        @Init()
        async init() {
          await sleep(300);
          this.name = 'f';
        }

        async getData() {
          return this.name;
        }
      }

      @Provide()
      class B {
        name = 'b';
        @Inject()
        c: C

        @Init()
        async init() {
          await sleep(200);
          this.name = 'e';
        }

        async getData() {
          return await this.c.getData() + this.name;
        }
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B

        @Init()
        async init() {
          await sleep(100);
          this.name = 'd';
        }

        async getData() {
          return await this.b.getData() + this.name;
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      const a = await container.getAsync(A);
      expect(await a.getData()).toEqual('fed');
    });

    it('should test new get async method and with async init 2', async () => {
      @Provide()
      class C {
        name = 'c';

        @Init()
        async init() {
          await sleep(300);
          this.name = 'f';
        }

        async getData() {
          return this.name;
        }
      }

      @Provide()
      class B {
        name = 'b';
        @Inject()
        c: C

        @Init()
        async init() {
          await sleep(200);
          this.name = 'e';
        }

        async getData() {
          return this.name;
        }
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B

        @Inject()
        c: C

        @Init()
        async init() {
          this.name = await this.b.getData() + await this.c.getData();
        }

        async getData() {
          return this.name;
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      const a = await container.getAsync(A);
      expect(await a.getData()).toEqual('ef');
    });

    it('should handle complex dependencies and avoid duplicate initialization', async () => {
      let initCount = {
        a: 0,
        b: 0,
        c: 0,
        d: 0
      };

      @Provide()
      class D {
        name = 'd';

        @Init()
        async init() {
          await sleep(100);
          initCount.d++;
          this.name = 'd_initialized';
        }
      }

      @Provide()
      class C {
        name = 'c';
        @Inject()
        d: D;

        @Init()
        async init() {
          await sleep(100);
          initCount.c++;
          this.name = 'c_initialized';
        }
      }

      @Provide()
      class B {
        name = 'b';
        @Inject()
        c: C;
        @Inject()
        d: D;

        @Init()
        async init() {
          await sleep(100);
          initCount.b++;
          this.name = 'b_initialized';
        }
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B;
        @Inject()
        c: C;

        @Init()
        async init() {
          await sleep(100);
          initCount.a++;
          this.name = this.b.name + '_' + this.c.name;
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);
      container.bind(D);

      const a = await container.getAsync(A);

      expect(a.name).toBe('b_initialized_c_initialized');
      expect(a.b.name).toBe('b_initialized');
      expect(a.c.name).toBe('c_initialized');
      expect(a.b.c.name).toBe('c_initialized');
      expect(a.b.d.name).toBe('d_initialized');
      expect(a.c.d.name).toBe('d_initialized');

      // 验证每个类只被初始化一次
      expect(initCount).toEqual({
        a: 1,
        b: 1,
        c: 1,
        d: 1
      });

      expect(a === await container.getAsync(A)).toBeTruthy();
      expect(a.c.d === a.b.d).toBeTruthy();
    });

    it('should handle complex dependencies and avoid duplicate initialization 2', async () => {
      let initCount = {
        a: 0,
        b: 0,
        c: 0,
      };

      let initOrder: string[] = [];

      @Provide()
      class C {
        name = 'c';

        @Init()
        async init() {
          initCount.c++;
          initOrder.push('C');
        }
      }

      @Provide()
      class B {
        name = 'b';
        @Inject()
        c: C;

        @Init()
        async init() {
          initCount.b++;
          initOrder.push('B');
        }
      }

      @Provide()
      class A {
        name = 'a';
        @Inject()
        b: B;
        @Inject()
        c: C;

        @Init()
        async init() {
          initCount.a++;
          initOrder.push('A');
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      const a = await container.getAsync(A);
      const b = await container.getAsync(B);

      expect(initOrder).toEqual(['C', 'B', 'A']);
      // 验证每个类只被初始化一次
      expect(initCount).toEqual({
        a: 1,
        b: 1,
        c: 1,
      });

      expect(a === await container.getAsync(A)).toBeTruthy();
      expect(b === await container.getAsync(B)).toBeTruthy();
    });

    it('should initialize dependencies in correct order without duplication', async () => {
      let initOrder: string[] = [];

      @Provide()
      class D {
        value = 0;

        @Init()
        async init() {
          await sleep(100);
          this.value = 1;
          initOrder.push('D');
        }
      }

      @Provide()
      class C {
        @Inject()
        d: D;

        value = 0;

        @Init()
        async init() {
          await sleep(100);
          this.value = this.d.value * 2;
          initOrder.push('C');
        }
      }

      @Provide()
      class B {
        @Inject()
        c: C;
        @Inject()
        d: D;

        value = 0;

        @Init()
        async init() {
          await sleep(100);
          this.value = this.c.value + this.d.value;
          initOrder.push('B');
        }
      }

      @Provide()
      class A {
        @Inject()
        b: B;
        @Inject()
        c: C;

        value = 0;

        @Init()
        async init() {
          await sleep(100);
          this.value = this.b.value + this.c.value;
          initOrder.push('A');
        }
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);
      container.bind(D);

      const a = await container.getAsync(A);
      const b = await container.getAsync(B);

      // 检查初始化顺序
      expect(initOrder).toEqual(['D', 'C', 'B', 'A']);

      // 检查计算结果
      expect(a.value).toBe(5);  // (1*2) + (2+1) = 2 + 3 = 5
      expect(a.b.value).toBe(3);  // 2 + 1 = 3
      expect(a.c.value).toBe(2);  // 1 * 2 = 2
      expect(a.b.c.value).toBe(2);
      expect(a.b.d.value).toBe(1);
      expect(a.c.d.value).toBe(1);

      // 检查实例共享
      expect(a.b.c).toBe(a.c);
      expect(a.b.d).toBe(a.c.d);

      expect(a.c).toBe(b.c);
    });

    it('should detect circular dependencies', async () => {
      @Provide()
      class A {
        @Inject()
        b;
      }

      @Provide()
      class B {
        @Inject()
        c;
      }

      @Provide()
      class C {
        @Inject()
        a: A;
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      await expect(container.getAsync(A)).rejects.toThrow('Circular dependency detected: A -> B -> C -> A');
    });

    it('should recognize property name circular dependencies', () => {
      @Provide()
      class TestA {
        @Inject('testB')
        b;
      }
      @Provide()
      class TestB {
        @Inject()
        a: TestA;
      }
      const container = new MidwayContainer();
      container.bind(TestA);
      container.bind(TestB);

      expect(() => {container.get(TestA)}).toThrow('Circular dependency detected: TestA -> TestB -> TestA');
    });

    it('should resolve property name circular dependencies', () => {
      @Provide()
      class TestA {
        data = 'a';
        @Inject('testB')
        b;
      }
      @Provide()
      class TestB {
        data = 'b';
        @LazyInject()
        a: TestA;
      }
      const container = new MidwayContainer();
      container.bind(TestA);
      container.bind(TestB);

      const a = container.get(TestA);
      expect(a.b.a.data).toEqual('a');
    });

    it('should recognize constructor circular dependencies', () => {
      @Provide()
      class TestA {
        data = 'a';
        constructor(@Inject('testB') public b) {
        }
      }
      @Provide()
      class TestB {
        data = 'b';
        constructor(@Inject() public a: TestA) {
        }
      }
      const container = new MidwayContainer();
      container.bind(TestA);
      container.bind(TestB);

      expect(() => {container.get(TestA)}).toThrow('Circular dependency detected: TestA -> TestB -> TestA');
    });

    it('should resolve constructor circular dependencies', () => {
      @Provide()
      class TestA {
        data = 'a';
        constructor(@Inject('testB') public b) {
        }
      }
      @Provide()
      class TestB {
        data = 'b';
        constructor(@LazyInject() public a: TestA) {
        }
      }
      const container = new MidwayContainer();
      container.bind(TestA);
      container.bind(TestB);

      const a = container.get(TestA);
      expect(a.b.a.data).toEqual('a');
    });

    it('should test MidwayDefinitionNotFoundError message', async () => {
      @Provide()
      class A {
        @Inject()
        b;
      }

      @Provide()
      class B {
        @Inject()
        c;
      }

      @Provide()
      class C {
        @Inject('baseDir')
        baseDir;
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      await expect(container.getAsync(A)).rejects.toThrow('Definition for "baseDir" not found in current context. Detection path: "A -> B -> C"');
    });

    it('should test MidwayDefinitionNotFoundError message with name', async () => {
      @Provide()
      class A {
        @Inject()
        b;
      }

      @Provide()
      class B {
        @Inject()
        c;
      }

      @Provide()
      class D {
      }

      @Provide()
      class C {
        @Inject()
        d: D;
      }

      const container = new Container();
      container.bind(A);
      container.bind(B);
      container.bind(C);

      await expect(container.getAsync(A)).rejects.toThrow('Definition for "d" not found in current context. Detection path: "A -> B -> C"');
    });

    it('should throw MidwayDefinitionNotFoundError when getting non-existent definition', async () => {
      const container = new Container();

      // 同步测试
      expect(() => {
        container.get('nonExistentDefinition');
      }).toThrow(MidwayDefinitionNotFoundError);

      // 异步测试
      await expect(
        container.getAsync('nonExistentDefinition')
      ).rejects.toThrow(MidwayDefinitionNotFoundError);
    });

    it('should include the definition name in the error message', () => {
      const container = new Container();
      const definitionName = 'testDefinition';

      try {
        container.get(definitionName);
      } catch (error) {
        expect(error).toBeInstanceOf(MidwayDefinitionNotFoundError);
        expect(error.message).toContain(definitionName);
      }
    });

    it('should throw MidwayDefinitionNotFoundError when getting non-existent property', () => {
      const container = new Container();

      @Provide()
      class TestClass {
        @Inject()
        nonExistentProperty: any;
      }

      container.bind(TestClass);

      expect(() => {
        container.get(TestClass);
      }).toThrow(MidwayDefinitionNotFoundError);
    });

    it('should test inject with multi-level extends', () => {

      @Provide()
      class Katana {}

      class GrandParent {
        @Inject()
        katana1: Katana;
      }

      class Parent extends GrandParent {
      }

      @Provide()
      class Child extends Parent {
        @Inject()
        katana2: Katana;
      }

      const container = new Container();
      container.bind(Child);
      container.bind(Katana);

      const child = container.get(Child);
      expect(child.katana1).toBeDefined();
      expect(child.katana2).toBeDefined();
    });
  });
});
