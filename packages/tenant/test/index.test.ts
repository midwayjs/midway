import { createLightApp, close } from '@midwayjs/mock';
import * as tenant from '../src';
import { ASYNC_CONTEXT_KEY, ASYNC_CONTEXT_MANAGER_KEY, ASYNC_ROOT_CONTEXT, Inject, Singleton } from '@midwayjs/core';

describe('index.test.ts', () => {

  it('should test tenant get and set', async () => {
    @Singleton()
    class TestService {
      @Inject()
      tenantManager: tenant.TenantManager;

      async getTenant() {
        return this.tenantManager.getCurrentTenantId();
      }
    }

    let app = await createLightApp('', {
      imports: [
        tenant
      ],
      preloadModules: [TestService]
    });

    const contextManager = app.getFramework()['bootstrapOptions'].asyncContextManager;
    contextManager.enable();

    app.getApplicationContext().registerObject(
      ASYNC_CONTEXT_MANAGER_KEY,
      contextManager
    );

    const manager = await app.getApplicationContext().getAsync(tenant.TenantManager);

    let err;
    try {
      await manager.setCurrentTenantId('test1');
    } catch (e) {
      err = e;
    }

    expect(err.message).toEqual('Current Async Context is Empty');

    const ctx1 = app.createAnonymousContext();
    const newContext1 = ASYNC_ROOT_CONTEXT.setValue(ASYNC_CONTEXT_KEY, ctx1);
    const ctx2 = app.createAnonymousContext();
    const newContext2 = ASYNC_ROOT_CONTEXT.setValue(ASYNC_CONTEXT_KEY, ctx2);

    contextManager.with(newContext1, async () => {
      await manager.setCurrentTenantId('test1');

      const service = await app.getApplicationContext().getAsync(TestService);
      expect(await service.getTenant()).toEqual('test1');
    });

    contextManager.with(newContext2, async () => {
      await manager.setCurrentTenantId('test2');

      const service = await app.getApplicationContext().getAsync(TestService);
      expect(await service.getTenant()).toEqual('test2');
    });

    await close(app);
  });
});
