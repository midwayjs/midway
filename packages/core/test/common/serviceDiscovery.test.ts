import { ServiceDiscovery, ServiceDiscoveryOptions, ServiceDiscoveryClient, LoadBalancerFactory, LoadBalancerType, ILoadBalancer } from '../../src';

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

    class MockServiceDiscoverAdapter extends ServiceDiscoveryClient<typeof mockClient, any, any> {
      beforeStop(): Promise<void> {
        return mockClient.stop();
      }
      register(instance?: any): Promise<void> {
        return mockClient.register(instance);
      }
      deregister(): Promise<void> {
        return mockClient.deregister();
      }
      online(): Promise<void> {
        return mockClient.online();
      }
      offline(): Promise<void> {
        return mockClient.offline();
      }
      constructor(client: typeof mockClient, options: ServiceDiscoveryOptions<any>) {
        super(client, options);
      }
    }

    class MockServiceDiscovery extends ServiceDiscovery<typeof mockClient, any, any> {
      getServiceClient() {
        return mockClient;
      }
      protected createServiceDiscoverClientImpl(options: any) {
        return new MockServiceDiscoverAdapter(mockClient, options);
      }
      protected getDefaultServiceDiscoveryOptions() {
        return {};
      }
      public async getInstances(options?: any): Promise<any[]> {
        return mockClient.getInstances(options);
      }
    }

    it('should create a mock service discovery', async () => {
      const serviceDiscovery = new MockServiceDiscovery();
      expect(serviceDiscovery).toBeDefined();
      expect(serviceDiscovery.getServiceClient()).toBe(mockClient);
      await serviceDiscovery.getInstances({});
    });

    it('should register and deregister a service', async () => {
      const serviceDiscovery = new MockServiceDiscovery();
      const client = serviceDiscovery.createClient();
      await client.register({ id: 'mock', name: 'mock', meta: {} });
      await client.online();

      expect(mockClient.register).toHaveBeenCalled();
      expect(mockClient.online).toHaveBeenCalled();

      await client.deregister();

      expect(mockClient.deregister).toHaveBeenCalled();
      await serviceDiscovery.getInstances({});
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
      getInstances: jest.fn(function(serviceNameOrOptions?: any) {
        // 兼容 string 或对象
        let name = typeof serviceNameOrOptions === 'string' ? serviceNameOrOptions : (serviceNameOrOptions && serviceNameOrOptions.name);
        // 返回所有 UP 实例，或指定 name 的 UP 实例
        return Array.from(this.instanceMap.values()).filter((i: any) => i.status === 'UP' && (!name || i.name === name));
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

    class RealisticConsulAdapter extends ServiceDiscoveryClient<typeof mockClientRealistic, Record<any, any>, RealisticInstance> {
      beforeStop(): Promise<void> {
        mockClientRealistic.stop();
        return Promise.resolve();
      }
      register(instance?: any): Promise<void> {
        if (!instance) {
          instance = {
            id: 'self',
            name: 'svc',
            meta: {},
          }
        }
        mockClientRealistic.register(instance);
        this.instance = instance;
        return Promise.resolve();
      }
      deregister(): Promise<void> {
        if (this.instance) {
          mockClientRealistic.deregister(this.instance);
          this.instance = undefined;
        }
        return Promise.resolve();
      }
      online(): Promise<void> {
        if (this.instance) {
          mockClientRealistic.online(this.instance);
        }
        return Promise.resolve();
      }
      offline(): Promise<void> {
        if (this.instance) {
          mockClientRealistic.offline(this.instance);
        }
        return Promise.resolve();
      }
      constructor(client: typeof mockClientRealistic, options: ServiceDiscoveryOptions<any>) {
        super(client, options);
      }
    }

    class RealisticConsulDiscovery extends ServiceDiscovery<typeof mockClientRealistic, any, RealisticInstance> {
      getServiceClient() {
        return mockClientRealistic;
      }
      protected createServiceDiscoverClientImpl(options: any) {
        return new RealisticConsulAdapter(mockClientRealistic, options);
      }
      protected getDefaultServiceDiscoveryOptions() {
        return {};
      }
      public async getInstances(options: RealisticInstance | string): Promise<RealisticInstance[]> {
        return mockClientRealistic.getInstances(options) as RealisticInstance[];
      }
    }

    it('should register, online, offline, deregister and get instances', async () => {
      const serviceDiscovery = new RealisticConsulDiscovery();
      await serviceDiscovery.init();

      // 创建 client 并注册
      const client = serviceDiscovery.createClient();
      await client.register({ id: 'self', name: 'svc', meta: {} });
      let instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(0);

      // 上线
      await client.online();
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(1);
      expect(instances[0].id).toBe('self');

      // 注册另外两个实例
      mockClientRealistic.register({ id: 'a', name: 'svc', meta: { v: 1 } });
      mockClientRealistic.register({ id: 'b', name: 'svc', meta: { v: 2 } });
      // 上线这两个
      mockClientRealistic.online({ id: 'a' });
      mockClientRealistic.online({ id: 'b' });

      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(3);

      // 下线一个
      mockClientRealistic.offline({ id: 'a' });
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(2);
      expect(instances.some(i => i.id === 'a')).toBeFalsy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 上线回来
      mockClientRealistic.online({ id: 'a' });
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(3);
      expect(instances.some(i => i.id === 'a')).toBeTruthy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 注销一个
      mockClientRealistic.deregister({ id: 'a' });
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(2);
      expect(instances.some(i => i.id === 'a')).toBeFalsy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();

      // 再注销另一个
      mockClientRealistic.deregister({ id: 'b' });
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(1);
      expect(instances.some(i => i.id === 'b')).toBeFalsy();

      // 下线自己
      await client.offline();
      instances = await serviceDiscovery.getInstances({ name: 'svc' } as any);
      expect(instances.length).toBe(0);
    });

    it('should test get instance with load balance', async () => {
      const serviceDiscovery = new RealisticConsulDiscovery();
      await serviceDiscovery.init();

      // 注册 5 个实例
      mockClientRealistic.register({ id: 'a', name: 'svc', meta: { v: 1 } });
      mockClientRealistic.register({ id: 'b', name: 'svc', meta: { v: 2 } });
      mockClientRealistic.register({ id: 'c', name: 'svc', meta: { v: 3 } });
      mockClientRealistic.register({ id: 'd', name: 'svc', meta: { v: 4 } });
      mockClientRealistic.register({ id: 'e', name: 'svc', meta: { v: 5 } });
      // 上线
      mockClientRealistic.online({ id: 'a' });
      mockClientRealistic.online({ id: 'b' });
      mockClientRealistic.online({ id: 'c' });
      mockClientRealistic.online({ id: 'd' });
      mockClientRealistic.online({ id: 'e' });

      // 随机获取一个实例，默认就是随机
      const instance = await serviceDiscovery.getInstance({ name: 'svc' } as any);
      expect(instance).toBeDefined();

      // 随机获取 100 次，应该会都拿到（不可能运气这么差）
      const instances = [];
      for (let i = 0; i < 100; i++) {
        const instance = await serviceDiscovery.getInstance({ name: 'svc' } as any);
        instances.push(instance);
      }
      expect(instances.length).toBe(100);
      expect(instances.some(i => i.id === 'a')).toBeTruthy();
      expect(instances.some(i => i.id === 'b')).toBeTruthy();
      expect(instances.some(i => i.id === 'c')).toBeTruthy();
      expect(instances.some(i => i.id === 'd')).toBeTruthy();
      expect(instances.some(i => i.id === 'e')).toBeTruthy();

      // 更新下 load-balance 的策略
      serviceDiscovery.setLoadBalancer(LoadBalancerFactory.create(LoadBalancerType.ROUND_ROBIN));

      // 获取 10 次，应该会拿到 a, b, c, d, e, a, b, c, d, e
      const roundRobinInstances = [];
      for (let i = 0; i < 10; i++) {
        const instance = await serviceDiscovery.getInstance({ name: 'svc' } as any);
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
      serviceDiscovery.setLoadBalancer(new CustomLoadBalance());

      // 注册 5 个实例
      mockClientRealistic.register({ id: 'a', name: 'svc', meta: { v: 1 } });
      mockClientRealistic.register({ id: 'b', name: 'svc', meta: { v: 2 } });
      mockClientRealistic.register({ id: 'c', name: 'svc', meta: { v: 3 } });
      mockClientRealistic.register({ id: 'd', name: 'svc', meta: { v: 4 } });
      mockClientRealistic.register({ id: 'e', name: 'svc', meta: { v: 5 } });
      mockClientRealistic.online({ id: 'a' });
      mockClientRealistic.online({ id: 'b' });
      mockClientRealistic.online({ id: 'c' });
      mockClientRealistic.online({ id: 'd' });
      mockClientRealistic.online({ id: 'e' });

      // 获取 10 次，应该会拿到 e
      const instances = [];
      for (let i = 0; i < 10; i++) {
        const instance = await serviceDiscovery.getInstance({ name: 'svc' } as any);
        instances.push(instance);
      }
      expect(instances.length).toBe(10);
      expect(instances.every(i => i.id === 'e')).toBeTruthy();
    });
  });
});
