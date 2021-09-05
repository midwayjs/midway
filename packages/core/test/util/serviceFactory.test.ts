import { ServiceFactory } from '../../src';

describe('test/util/serviceFactory.test.ts', () => {

  class TestServiceFactory extends ServiceFactory<any> {
    protected createClient(config: any): any {
      return {
        aaa: 123
      }
    }

    getName() {
      return 'test';
    }

    async initClients(options) {
      return super.initClients(options);
    }
  }

  it('should test service factory', async () => {
    const instance = new TestServiceFactory();
    expect(instance.getName()).toEqual('test');

    const ins = await instance.createInstance({});
    expect(ins).toEqual({
      aaa: 123
    });
    expect(instance.get('fff')).not.toBeDefined();
  });

  it('should test create instance with name', async () => {
    const instance = new TestServiceFactory();
    const ins = await instance.createInstance({}, 'fff');
    expect(ins).toEqual({
      aaa: 123
    });
    expect(instance.get('fff')).toBeDefined();
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
  });

  it('should test default client', async () => {
    const instance = new TestServiceFactory();
    await instance.initClients({
      client: {
      }
    });
    expect(instance.get('default')).toBeDefined();
  });

  it('should config must with client or clients', async () => {
    const instance = new TestServiceFactory();
    let err;
    try {
      await instance.initClients({
        client: {},
        clients: {}
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
