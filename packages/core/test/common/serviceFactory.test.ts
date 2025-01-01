import { ServiceFactory, DEFAULT_PRIORITY, MidwayPriorityManager } from '../../src';

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

});
