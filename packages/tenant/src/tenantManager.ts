import {
  ApplicationContext,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
  AsyncContextManager,
  IMidwayContainer,
  IMidwayContext,
  MidwayEmptyValueError,
  Singleton,
} from '@midwayjs/core';

const TENANT_MANAGER_KEY = 'tenant:manager_attr_key';

@Singleton()
export class TenantManager {
  @ApplicationContext()
  applicationContext: IMidwayContainer;

  async getCurrentTenantId(): Promise<string | number | undefined> {
    const contextManager: AsyncContextManager = this.applicationContext.get(
      ASYNC_CONTEXT_MANAGER_KEY
    );

    const ctx = contextManager
      .active()
      .getValue(ASYNC_CONTEXT_KEY) as IMidwayContext;

    if (ctx) {
      return ctx.getAttr(TENANT_MANAGER_KEY);
    }
  }

  async setCurrentTenantId(tenantId: string | number): Promise<void> {
    const contextManager: AsyncContextManager = this.applicationContext.get(
      ASYNC_CONTEXT_MANAGER_KEY
    );

    const activeContext = contextManager.active();

    const requestContext = activeContext.getValue(
      ASYNC_CONTEXT_KEY
    ) as IMidwayContext;

    if (requestContext) {
      requestContext.setAttr(TENANT_MANAGER_KEY, tenantId);
    } else {
      throw new MidwayEmptyValueError('Current Async Context is Empty');
    }
  }
}
