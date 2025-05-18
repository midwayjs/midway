import { ServiceDiscovery, ServiceDiscoveryOptions, ServiceDiscoveryAdapter, LoadBalancerFactory, LoadBalancerType, ILoadBalancer } from '../../src';

describe('/test/common/serviceDiscovery.test.ts', () => {

  describe('base service discovery case', () => {

    const mockClient = {
      init: jest.fn(),
      getServiceDiscoveryClient: jest.fn(),
      register: jest.fn(),
      deregister: jest.fn(),
      online: jest.fn(),
      offline: jest.fn(),
      stop: jest.fn(),
      getInstances: jest.fn(),
      getInstance: jest.fn(),
    };

    class MockServiceDiscoverAdapter extends ServiceDiscoveryAdapter<typeof mockClient, any, any> {
      getInstances<getInstanceOptions>(serviceNameOrOptions: string | getInstanceOptions): Promise<any[]> {
        return mockClient.getInstances(serviceNameOrOptions);
      }
      beforeStop(): Promise<void> {
        return mockClient.stop();
      }
      register(instance?: any): Promise<void> {
        return mockClient.register(instance);
      }
      deregister(instance?: any): Promise<void> {
        return mockClient.deregister(instance);
      }
      online(instance?: any): Promise<void> {
        return mockClient.online(instance);
      }
      offline(instance?: any): Promise<void> {
        return mockClient.offline(instance);
      }
      constructor(client: typeof mockClient, options: ServiceDiscoveryOptions<any>) {
        super(client, options);
      }
    }

     // implement a mock service discovery
    class MockServiceDiscovery extends ServiceDiscovery<typeof mockClient, any, any> {
      async init(options?: ServiceDiscoveryOptions<any>): Promise<void> {
        this.defaultAdapter = new MockServiceDiscoverAdapter(mockClient, options);
      }
      getServiceDiscoveryClient() {
        return mockClient;
      }
    }

    it('should create a mock service discovery', async () => {
      const serviceDiscovery = new MockServiceDiscovery();
      await serviceDiscovery.init();
      expect(serviceDiscovery).toBeDefined();
      expect(serviceDiscovery.getServiceDiscoveryClient()).toBe(mockClient);
    });

    it('should register and deregister a service', async () => {
      const serviceDiscovery = new MockServiceDiscovery();
      await serviceDiscovery.init();
      await serviceDiscovery.register();
      await serviceDiscovery.online();

      expect(mockClient.register).toHaveBeenCalled();
      expect(mockClient.online).toHaveBeenCalled();

      await serviceDiscovery.deregister();

      expect(mockClient.deregister).toHaveBeenCalled();
    });
  });

  describe('realistic service discovery case', () => {
    // 用于记录实例的 mock client
    const mockClientRealistic = {
      instanceMap: new Map<string, any>(),
      register: jest.fn(function(instance?: any) {
        if (instance) this.instanceMap.set(instance.id, { ...instance, status: 'DOWN' });
      }),
      deregister: jest.fn(function(instance?: any) {
        if (instance && instance.id) this.instanceMap.delete(instance.id);
      }),
      online: jest.fn(function(instance?: any) {
        if (instance && instance.id && this.instanceMap.has(instance.id)) {
          this.instanceMap.get(instance.id).status = 'UP';
        }
      }),
      offline: jest.fn(function(instance?: any) {
        if (instance && instance.id && this.instanceMap.has(instance.id)) {
          this.instanceMap.get(instance.id).status = 'DOWN';
        }
      }),
      getInstances: jest.fn(function(serviceName?: string) {
        // 忽略 serviceName，直接返回所有 UP 实例
        return Array.from(this.instanceMap.values()).filter((i: any) => i.status === 'UP');
      }),
      stop: jest.fn(function() {
        this.instanceMap.clear();
      })
    };

    type RealisticInstance = {
      id: string;
      name: string;
      meta: Record<string, any>;
    };

    class RealisticConsulAdapter extends ServiceDiscoveryAdapter<typeof mockClientRealistic, Record<any, any>, RealisticInstance> {
      getInstances(serviceName?: string): Promise<any[]> {
        return Promise.resolve(mockClientRealistic.getInstances(serviceName));
      }
      beforeStop(): Promise<void> {
        mockClientRealistic.stop();
        return Promise.resolve();
      }
      register(instance?: any): Promise<void> {
        if (!instance) {
          const defaultMeta = this.getDefaultInstanceMeta();
          instance = {
            id: defaultMeta.id,
            name: defaultMeta.serviceName,
            meta: defaultMeta.metadata,
          }
        }
        mockClientRealistic.register(instance);
        this.instance = instance;
        return Promise.resolve();
      }
      deregister(instance?: any): Promise<void> {
        mockClientRealistic.deregister(instance);
        return Promise.resolve();
      }
      online(instance?: any): Promise<void> {
        mockClientRealistic.online(instance);
        return Promise.resolve();
      }
      offline(instance?: any): Promise<void> {
        mockClientRealistic.offline(instance);
        return Promise.resolve();
      }
      constructor(client: typeof mockClientRealistic, options: ServiceDiscoveryOptions<any>) {
        super(client, options);
      }
    }

    class RealisticConsulDiscovery extends ServiceDiscovery<typeof mockClientRealistic, any, any> {
      async init(options?: ServiceDiscoveryOptions<any>): Promise<void> {
        this.defaultAdapter = new RealisticConsulAdapter(mockClientRealistic, options);
      }
      getServiceDiscoveryClient() {
        return mockClientRealistic;
      }
    }

    it('should register, online, offline, deregister and get instances', async () => {
      const serviceDiscovery = new RealisticConsulDiscovery();
      await serviceDiscovery.init();

      // 注册自己
      await serviceDiscovery.register();
      let instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(0);
      // 上线一下
      await serviceDiscovery.online();
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(1);
      expect(instances[0].id).toBe(serviceDiscovery.getAdapter().getSelfInstance().id);

      // 注册另外两个实例
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'a', name: 'svc', meta: { v: 1 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'b', name: 'svc', meta: { v: 2 } });
      // 上线这两个
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'a' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'b' });

      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(3);

      // 下线一个
      await serviceDiscovery.getServiceDiscoveryClient().offline({ id: 'a' });
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(2);
      expect(instances.some(i => i.id === 'a')).toBeFalsy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 上线回来
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'a' });
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(3);
      expect(instances.some(i => i.id === 'a')).toBeTruthy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 注销一个
      await serviceDiscovery.getServiceDiscoveryClient().deregister({ id: 'a' });
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(2);
      expect(instances.some(i => i.id === 'a')).toBeFalsy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 再注销另一个
      await serviceDiscovery.getServiceDiscoveryClient().deregister({ id: 'b' });
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(1);
      expect(instances.some(i => i.id === 'b')).toBeFalsy();

      // 下线自己
      await serviceDiscovery.offline();
      instances = await serviceDiscovery.getInstances('svc');
      expect(instances.length).toBe(0);
    });

    it('should test get instance with load balance', async () => {
      const serviceDiscovery = new RealisticConsulDiscovery();
      await serviceDiscovery.init();

      // 注册 5 个实例
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'a', name: 'svc', meta: { v: 1 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'b', name: 'svc', meta: { v: 2 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'c', name: 'svc', meta: { v: 3 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'd', name: 'svc', meta: { v: 4 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'e', name: 'svc', meta: { v: 5 } });
      // 上线
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'a' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'b' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'c' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'd' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'e' });

      // 随机获取一个实例，默认就是随机
      const instance = await serviceDiscovery.getInstance('svc');
      expect(instance).toBeDefined();

      // 随机获取 100 次，应该会都拿到（不可能运气这么差）
      const instances = [];
      for (let i = 0; i < 100; i++) {
        const instance = await serviceDiscovery.getInstance('svc');
        instances.push(instance);
      }
      expect(instances.length).toBe(100);
      expect(instances.some(i => i.id === 'a')).toBeTruthy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();
      expect(instances.some(i => i.id === 'c')).toBeTruthy();
      expect(instances.some(i => i.id === 'd')).toBeTruthy();
      expect(instances.some(i => i.id === 'e')).toBeTruthy();


      // 更新下 load-balance 的策略
      serviceDiscovery.getAdapter().setLoadBalancer(LoadBalancerFactory.create(LoadBalancerType.ROUND_ROBIN));

      // 获取 10 次，应该会拿到 a, b, c, d, e, a, b, c, d, e
      const roundRobinInstances = [];
      for (let i = 0; i < 10; i++) {
        const instance = await serviceDiscovery.getInstance('svc');
        roundRobinInstances.push(instance);
      }
      expect(roundRobinInstances.length).toBe(10);
      expect(roundRobinInstances[0].id).toBe('a');
      expect(roundRobinInstances[1].id).toBe('b');
      expect(roundRobinInstances[2].id).toBe('c');
      expect(roundRobinInstances[3].id).toBe('d');
      expect(roundRobinInstances[4].id).toBe('e');
      expect(roundRobinInstances[5].id).toBe('a');
      expect(roundRobinInstances[6].id).toBe('b');
      expect(roundRobinInstances[7].id).toBe('c');
      expect(roundRobinInstances[8].id).toBe('d');
      expect(roundRobinInstances[9].id).toBe('e');
    });

    it('should test get instance with custom load balance', async () => {
      class CustomLoadBalance implements ILoadBalancer<RealisticInstance> {
        select(instances: RealisticInstance[]): RealisticInstance {
          return instances[4];
        }
      }

      const serviceDiscovery = new RealisticConsulDiscovery();
      await serviceDiscovery.init({
        loadBalancer: new CustomLoadBalance(),
      });

      // 注册 5 个实例
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'a', name: 'svc', meta: { v: 1 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'b', name: 'svc', meta: { v: 2 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'c', name: 'svc', meta: { v: 3 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'd', name: 'svc', meta: { v: 4 } });
      await serviceDiscovery.getServiceDiscoveryClient().register({ id: 'e', name: 'svc', meta: { v: 5 } });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'a' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'b' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'c' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'd' });
      await serviceDiscovery.getServiceDiscoveryClient().online({ id: 'e' });

      // 获取 10 次，应该会拿到 e
      const instances = [];
      for (let i = 0; i < 10; i++) {
        const instance = await serviceDiscovery.getInstance('svc');
        instances.push(instance);
      }
      expect(instances.length).toBe(10);
      expect(instances.every(i => i.id === 'e')).toBeTruthy();
    });
  });
});
