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

const CURRENT_TENANT_MANAGER_KEY = 'tenant:current_manager_tenant_key';

@Singleton()
export class TenantManager {
  @ApplicationContext()
  applicationContext: IMidwayContainer;

  async getCurrentTenant<T = any>(): Promise<T> {
    const contextManager: AsyncContextManager = this.applicationContext.get(
      ASYNC_CONTEXT_MANAGER_KEY
    );

    const ctx = contextManager
      .active()
      .getValue(ASYNC_CONTEXT_KEY) as IMidwayContext;

    if (ctx) {
      return ctx.getAttr(CURRENT_TENANT_MANAGER_KEY);
    }
  }

  async setCurrentTenant<T = any>(currentTenant: T): Promise<void> {
    const contextManager: AsyncContextManager = this.applicationContext.get(
      ASYNC_CONTEXT_MANAGER_KEY
    );

    const activeContext = contextManager.active();

    const requestContext = activeContext.getValue(
      ASYNC_CONTEXT_KEY
    ) as IMidwayContext;

    if (requestContext) {
      requestContext.setAttr(CURRENT_TENANT_MANAGER_KEY, currentTenant);
    } else {
      throw new MidwayEmptyValueError('Current Async Context is Empty');
    }
  }
}
