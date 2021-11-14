import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContainer,
  IMidwayFramework,
} from '../interface';

export const getCurrentApplicationContext = (): IMidwayContainer => {
  return global['MIDWAY_APPLICATION_CONTEXT'];
};

export const getCurrentMainFramework = <
  APP extends IMidwayApplication,
  T extends IConfigurationOptions
>(): IMidwayFramework<APP, T> => {
  return global['MIDWAY_MAIN_FRAMEWORK'] as IMidwayFramework<APP, T>;
};

export const getCurrentMainApp = <APP extends IMidwayApplication>(): APP => {
  return getCurrentMainFramework().getApplication() as APP;
};
