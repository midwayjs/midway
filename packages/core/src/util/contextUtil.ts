import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContainer,
  IMidwayFramework,
  IMidwayContext,
} from '../interface';

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
  return getCurrentMainFramework().getApplication() as APP;
};
