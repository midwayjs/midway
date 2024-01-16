import { ServiceFactory, DEFAULT_PRIORITY, MidwayPriorityManager } from '../../src';

describe('test/common/serviceFactory.test.ts', () => {

  class TestServiceFactory extends ServiceFactory<any> {
    protected createClient(config: any): any {
      const client =  {
        aaa: 123,
        isClose: false,
        async close() {
          client.isClose = true;
        }
      };
      return client;
    }

    getName() {
      return 'test';
    }

    async initClients(options) {
      return super.initClients(options);
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
    expect(instance.get('bbb').isClose).toBeFalsy();
    await instance.stop();
    expect(instance.get('bbb').isClose).toBeTruthy();
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

});
