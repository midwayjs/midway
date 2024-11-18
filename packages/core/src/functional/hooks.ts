import {
  IMidwayContainer,
  MidwayConfigService,
  getCurrentAsyncContextManager,
  ASYNC_CONTEXT_KEY,
  ClassType,
  IMidwayApplication,
  MidwayConfig,
  ILogger,
  getCurrentMainApp
} from '../';

export function useContext<T = any>(): T {
  const ctx = getCurrentAsyncContextManager()
    .active()
    .getValue(ASYNC_CONTEXT_KEY);
  return ctx as T;
}

export function useLogger(loggerName?: string): ILogger {
  const ctx = useContext();
  return ctx.logger;
}

export function usePlugin(key: string): any {
  const ctx = useContext();
  return ctx.app[key] || ctx[key];
}

export async function useInject<T = any>(
  identifier: ClassType<T> | string,
  args?: any[]
): Promise<T> {
  const ctx = useContext();
  const requestContext: IMidwayContainer = ctx['requestContext'];
  return requestContext.getAsync(identifier, args);
}

export function useInjectSync<T = any>(
  identifier: ClassType<T> | string,
  args?: any[]
): T {
  const ctx = useContext();
  const requestContext: IMidwayContainer = ctx['requestContext'];
  return requestContext.get(identifier, args);
}

export function useConfig(key?: string): MidwayConfig {
  const ctx = useContext();
  const requestContext: IMidwayContainer = ctx['requestContext'];
  return requestContext.get(MidwayConfigService).getConfiguration(key);
}

export function useApp(appName: string): IMidwayApplication {
  const ctx = useContext();
  return ctx.app;
}

export function useMainApp(): IMidwayApplication {
  return getCurrentMainApp();
}
