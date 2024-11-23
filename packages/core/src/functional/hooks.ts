import {
  IMidwayContainer,
  MidwayConfigService,
  getCurrentAsyncContextManager,
  ASYNC_CONTEXT_KEY,
  ClassType,
  IMidwayApplication,
  MidwayConfig,
  ILogger,
  getCurrentMainApp,
  MidwayApplicationManager,
} from '../';

export function useContext<T = any>(): T | undefined {
  const ctx = getCurrentAsyncContextManager()
    .active()
    .getValue(ASYNC_CONTEXT_KEY);
  return ctx as T;
}

export function useLogger(loggerName?: string): ILogger {
  const ctx = useContext();
  if (ctx) {
    if (loggerName) {
      return ctx.logger.getLogger(loggerName);
    }
    return ctx.logger;
  } else {
    return useMainApp().getLogger(loggerName);
  }
}

export function usePlugin(key: string): any {
  const ctx = useContext();
  return ctx ? ctx.app[key] || ctx[key] : useMainApp()[key];
}

export async function useInject<T = any>(
  identifier: ClassType<T> | string,
  args?: any[]
): Promise<T> {
  const ctx = useContext();
  const requestContext: IMidwayContainer = ctx
    ? ctx['requestContext']
    : useMainApp().getApplicationContext();
  return requestContext.getAsync(identifier, args);
}

export function useInjectSync<T = any>(
  identifier: ClassType<T> | string,
  args?: any[]
): T {
  ``;
  const ctx = useContext();
  const requestContext: IMidwayContainer = ctx
    ? ctx['requestContext']
    : useMainApp().getApplicationContext();
  return requestContext.get(identifier, args);
}

export function useConfig(key?: string): MidwayConfig {
  return useMainApp()
    .getApplicationContext()
    .get(MidwayConfigService)
    .getConfiguration(key);
}

export function useApp(appName: string): IMidwayApplication {
  const applicationManager = useMainApp()
    .getApplicationContext()
    .get(MidwayApplicationManager);
  return applicationManager.getApplication(appName);
}

export function useMainApp(): IMidwayApplication {
  return getCurrentMainApp();
}
