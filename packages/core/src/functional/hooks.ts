import {
  getCurrentAsyncContextManager,
  getCurrentMainApp,
} from '../util/contextUtil';
import { ASYNC_CONTEXT_KEY } from '../constants';
import { MidwayApplicationManager } from '../common/applicationManager';
import {
  ClassType,
  ILogger,
  IMidwayApplication,
  IMidwayContainer,
  IServiceFactory,
  MidwayConfig,
  IDataSourceManager,
} from '../interface';
import { MidwayConfigService } from '../service/configService';

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

export async function useInjectClient<Client = any>(
  serviceFactoryClz: new (...args) => IServiceFactory<Client>,
  clientName?: string
): Promise<Client> {
  const factoryService = await useInject(serviceFactoryClz);
  return factoryService.get(clientName);
}

export async function useInjectDataSource<DataSource = any>(
  dataSourceManagerClz: new (...args) => IDataSourceManager<DataSource, any>,
  dataSourceName: string
): Promise<DataSource> {
  const dataSourceManager = await useInject(dataSourceManagerClz);
  return dataSourceManager.getDataSource(dataSourceName);
}
