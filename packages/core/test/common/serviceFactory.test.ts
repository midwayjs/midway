import { ServiceFactory, DEFAULT_PRIORITY, MidwayPriorityManager, sleep } from '../../src';

describe('test/common/serviceFactory.test.ts', () => {

  class TestServiceFactory extends ServiceFactory<any> {
    protected createClient(config: any): any {
      return new Promise(resolve => {
        setTimeout(() => {
          const client = {
            aaa: 123,
            isClose: false,
            async close() {
              client.isClose = true;
            },
            createdAt: Date.now()
          };
          resolve(client);
        }, 100);
      });
    }

    getName() {
      return 'test';
    }

    async initClients(options, initOptions?) {
      return super.initClients(options, initOptions);
    }

    protected async destroyClient(client: any): Promise<void> {
      await client.close();
    }
  }

  it('should test service factory', async () => {
    const instance = new TestServiceFactory();
    expect(instance.getName()).toEqual('test');

    const ins = await instance.createInstance({});
    expect(ins['aaa']).toEqual(123);
    expect(instance.get('fff')).not.toBeDefined();
  });

  it('should test create instance with name', async () => {
    const instance = new TestServiceFactory();
    const ins = await instance.createInstance({}, 'fff');
    expect(ins['aaa']).toEqual(123);
    expect(instance.get('fff')).toBeDefined();
    expect(instance.has('fff')).toBeTruthy();
  });

  it('should test multi-clients', async () => {
    const instance = new TestServiceFactory();
    await instance.initClients({
      clients: {
        bbb: {},
        ccc: {}
      }
    });
    expect(instance.get('bbb')).toBeDefined();
    expect(instance.get('ccc')).toBeDefined();
    let ins = instance.get('bbb');
    expect(ins.isClose).toBeFalsy();
    await instance.stop();
    expect(ins.isClose).toBeTruthy();
  });

  it('should test default client', async () => {
    const instance = new TestServiceFactory();
    await instance.initClients({
      client: {
      }
    });
    expect(instance.get('default')).toBeDefined();
  });

  it('should test default name', async () => {
    const instance = new TestServiceFactory();
    await instance.initClients({
      defaultClientName: 'abc',
      clients: {}
    })
    expect(instance.getDefaultClientName()).toEqual('abc');
  });

  describe('Priority related tests', () => {
    let instance: TestServiceFactory;

    beforeEach(async () => {
      instance = new TestServiceFactory();
      instance['priorityManager'] = new MidwayPriorityManager();
      await instance.initClients({
        clients: {
          high: {},
          medium: {},
          low: {}
        },
        priority: {
          high: DEFAULT_PRIORITY.L1,
          medium: DEFAULT_PRIORITY.L2,
          low: DEFAULT_PRIORITY.L3
        }
      });
    });

    it('should get correct client priority', () => {
      expect(instance.getClientPriority('high')).toEqual(DEFAULT_PRIORITY.L1);
      expect(instance.getClientPriority('medium')).toEqual(DEFAULT_PRIORITY.L2);
      expect(instance.getClientPriority('low')).toEqual(DEFAULT_PRIORITY.L3);
    });

    it('should correctly identify high priority client', () => {
      expect(instance.isHighPriority('high')).toBeTruthy();
      expect(instance.isHighPriority('medium')).toBeFalsy();
      expect(instance.isHighPriority('low')).toBeFalsy();
    });

    it('should correctly identify medium priority client', () => {
      expect(instance.isMediumPriority('high')).toBeFalsy();
      expect(instance.isMediumPriority('medium')).toBeTruthy();
      expect(instance.isMediumPriority('low')).toBeFalsy();
    });

    it('should correctly identify low priority client', () => {
      expect(instance.isLowPriority('high')).toBeFalsy();
      expect(instance.isLowPriority('medium')).toBeFalsy();
      expect(instance.isLowPriority('low')).toBeTruthy();
    });

    it('should use default priority if not set', async () => {
      const instance = new TestServiceFactory();
      instance['priorityManager'] = new MidwayPriorityManager();
      await instance.initClients({
        clients: {
          defaultPriorityClient: {},
        },
      });

      expect(instance.getClientPriority('defaultPriorityClient')).toEqual(DEFAULT_PRIORITY.L2);
      expect(instance.isHighPriority('defaultPriorityClient')).toBeFalsy();
      expect(instance.isMediumPriority('defaultPriorityClient')).toBeTruthy();
      expect(instance.isLowPriority('defaultPriorityClient')).toBeFalsy();
    });
  });

  describe('test concurrent initialization', () => {
    it('should initialize clients serially by default', async () => {
      const instance = new TestServiceFactory();
      const startTime = Date.now();

      await instance.initClients({
        clients: {
          client1: {},
          client2: {},
          client3: {}
        }
      });

      const clients = instance.getClients();
      const creationTimes = Array.from(clients.values()).map(client => client.createdAt);

      // 验证客户端是按顺序创建的
      for (let i = 1; i < creationTimes.length; i++) {
        expect(creationTimes[i] - creationTimes[i-1]).toBeGreaterThanOrEqual(90);
      }

      // 总时间应该接近 300ms (3个客户端 * 100ms)
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(290);
    });

    it('should initialize clients concurrently when concurrent option is true', async () => {
      const instance = new TestServiceFactory();
      const startTime = Date.now();

      await instance.initClients({
        clients: {
          client1: {},
          client2: {},
          client3: {}
        }
      }, { concurrent: true });

      const clients = instance.getClients();
      const creationTimes = Array.from(clients.values()).map(client => client.createdAt);

      // 验证所有客户端创建时间应该接近
      for (let i = 1; i < creationTimes.length; i++) {
        expect(creationTimes[i] - creationTimes[i-1]).toBeLessThan(50);
      }

      // 总时间应该接近 100ms
      expect(Date.now() - startTime).toBeLessThan(200);
    });

    it('should handle errors in concurrent initialization', async () => {
      class ErrorTestServiceFactory extends TestServiceFactory {
        protected createClient(config: any, clientName?: string): any {
          if (clientName === 'client2') {
            throw new Error('Test error');
          }
          return super.createClient(config);
        }
      }

      const instance = new ErrorTestServiceFactory();

      await expect(instance.initClients({
        clients: {
          client1: {},
          client2: {},
          client3: {}
        }
      }, { concurrent: true })).rejects.toThrow('Test error');

      // 验证在出错时没有客户端被创建
      expect(instance.getClients().size).toBe(0);
    });
  });

  describe('test concurrent createInstance', () => {
    class ConcurrentTestServiceFactory extends ServiceFactory<any> {
      protected async createClient(config: any, clientName?: string): Promise<any> {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              config,
              clientName,
              createdAt: Date.now()
            });
          }, 100);
        });
      }

      getName() {
        return 'concurrent-test';
      }

      async initClients(options, initOptions?) {
        return super.initClients(options, initOptions);
      }

      protected async destroyClient(client: any): Promise<void> {
        // noop
      }
    }

    it('should handle mixed concurrent creations with different clientNames', async () => {
      const instance = new ConcurrentTestServiceFactory();
      const creationTimes = new Map<string, number>();

      instance['createClient'] = async (config: any, clientName?: string) => {
        const key = clientName || 'default';
        const currentCount = creationTimes.get(key) || 0;
        creationTimes.set(key, currentCount + 1);
        await sleep(100);
        return { clientName: key, id: currentCount + 1 };
      };

      // 并发调用不同的 clientName
      const results = await Promise.all([
        instance.createInstance({}, 'client1'),
        instance.createInstance({}, 'client2'),
        instance.createInstance({}, 'client1'), // 重复的 client1
        instance.createInstance({}, 'client2'), // 重复的 client2
        instance.createInstance({}, 'client3')
      ]);

      // 验证每个 clientName 只创建了一次
      expect(creationTimes.get('client1')).toBe(1);
      expect(creationTimes.get('client2')).toBe(1);
      expect(creationTimes.get('client3')).toBe(1);

      // 验证相同 clientName 返回相同实例
      expect(results[0]).toBe(results[2]); // client1
      expect(results[1]).toBe(results[3]); // client2
    });

    it('should create instance only once when multiple calls with same clientName', async () => {
      const instance = new TestServiceFactory();
      let createCount = 0;

      // 重写 createClient 以跟踪创建次数
      instance['createClient'] = async (config: any) => {
        createCount++;
        await sleep(100); // 模拟异步创建
        return {
          id: createCount,
          isClose: false,
          async close() {
            this.isClose = true;
          }
        };
      };

      // 并发调用 createInstance
      const results = await Promise.all([
        instance.createInstance({}, 'same'),
        instance.createInstance({}, 'same'),
        instance.createInstance({}, 'same')
      ]);

      // 验证只创建了一次
      expect(createCount).toBe(1);
      // 验证所有结果都是同一个实例
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      expect(results[0].id).toBe(1);
    });

    it('should handle errors in concurrent creation', async () => {
      const instance = new TestServiceFactory();
      let createCount = 0;

      // 重写 createClient 使其抛出错误
      instance['createClient'] = async () => {
        createCount++;
        await sleep(100);
        throw new Error('Creation failed');
      };

      // 并发调用 createInstance
      const promises = Array(3).fill(0).map(() =>
        instance.createInstance({}, 'error-client')
          .catch(err => err)
      );

      const results = await Promise.all(promises);

      // 验证只尝试创建了一次
      expect(createCount).toBe(1);
      // 验证所有调用都收到了相同的错误
      results.forEach(result => {
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Creation failed');
      });
      // 验证 creatingClients 已被清理
      expect(instance['creatingClients'].size).toBe(0);
    });

    it('should handle sync and async creations correctly', async () => {
      const instance = new ConcurrentTestServiceFactory();
      const createCounts = new Map<string, number>();

      // 修改 createClient 以确保总是返回 Promise
      instance['createClient'] = async (config: any, clientName?: string) => {
        const key = clientName || 'default';
        const currentCount = createCounts.get(key) || 0;
        createCounts.set(key, currentCount + 1);

        if (config.sync) {
          // 即使是同步结果，也包装成 Promise
          return Promise.resolve({ type: 'sync', id: currentCount + 1 });
        } else {
          await sleep(100);
          return { type: 'async', id: currentCount + 1 };
        }
      };

      // 混合同步和异步调用
      const results = await Promise.all([
        instance.createInstance({ sync: true }, 'sync1'),
        instance.createInstance({ sync: true }, 'sync1'),
        instance.createInstance({}, 'async1'),
        instance.createInstance({}, 'async1')
      ]);

      // 验证每个类型只创建了一次
      expect(createCounts.get('sync1')).toBe(1);
      expect(createCounts.get('async1')).toBe(1);
      
      // 验证实例复用
      expect(results[0]).toBe(results[1]); // 同步实例相同
      expect(results[2]).toBe(results[3]); // 异步实例相同
      
      // 验证类型正确
      expect(results[0].type).toBe('sync');
      expect(results[2].type).toBe('async');
    });

    it('should handle synchronous createClient correctly', async () => {
      class SyncTestServiceFactory extends ServiceFactory<any> {
        // 定义为同步方法
        protected createClient(config: any, clientName?: string) {
          return {
            id: config.id || 1,
            clientName,
            type: 'sync'
          };
        }

        getName() {
          return 'sync-test';
        }

        protected async destroyClient(client: any): Promise<void> {
          // noop
        }
      }

      const instance = new SyncTestServiceFactory();
      let createCount = 0;

      // 重写 createClient 以跟踪创建次数
      instance['createClient'] = (config: any, clientName?: string) => {
        createCount++;
        return {
          id: createCount,
          clientName,
          type: 'sync'
        };
      };

      // 测试多次调用
      const results = await Promise.all([
        instance.createInstance({}, 'sync-client'),
        instance.createInstance({}, 'sync-client'),
        instance.createInstance({}, 'sync-client')
      ]);

      // 验证只创建了一次
      expect(createCount).toBe(1);
      
      // 验证所有结果都是同一个实例
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      
      // 验证实例属性
      expect(results[0].type).toBe('sync');
      expect(results[0].id).toBe(1);
      expect(results[0].clientName).toBe('sync-client');

      // 验证实例已被正确缓存
      expect(instance.has('sync-client')).toBeTruthy();
      expect(instance.get('sync-client')).toBe(results[0]);
    });
  });

});
