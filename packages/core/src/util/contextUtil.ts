import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContainer,
  IMidwayFramework,
  IMidwayContext,
} from '../interface';
import { AsyncContextManager } from '../common/asyncContextManager';
import { ASYNC_CONTEXT_MANAGER_KEY } from '../constants';

export const getCurrentApplicationContext = (): IMidwayContainer => {
  return global['MIDWAY_APPLICATION_CONTEXT'];
};

export const getCurrentMainFramework = <
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  CONFIG extends IConfigurationOptions
>(): IMidwayFramework<APP, CTX, CONFIG> => {
  return global['MIDWAY_MAIN_FRAMEWORK'] as IMidwayFramework<APP, CTX, CONFIG>;
};

export const getCurrentMainApp = <APP extends IMidwayApplication>(): APP => {
  const framework = getCurrentMainFramework();
  if (framework) {
    return framework.getApplication() as APP;
  }
  return undefined;
};

export const getCurrentAsyncContextManager = (): AsyncContextManager => {
  return getCurrentApplicationContext().get(ASYNC_CONTEXT_MANAGER_KEY);
};
