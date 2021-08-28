import { createModuleContainer, IMidwayContainer } from '@midwayjs/core';
import { Framework, IFaaSConfigurationOptions } from './index';

export interface CreateOptions extends IFaaSConfigurationOptions {
  container?: IMidwayContainer;
  modules: any[];
  entry: { Configuration: any };
}

export const createModuleServerlessFramework = async (
  options: CreateOptions
) => {
  const container = createModuleContainer(options);
  const framework = new Framework();
  framework.configure(options);
  await framework.initialize({
    applicationContext: container,
    baseDir: '',
    appDir: '',
  });
  await framework.run();
  return framework;
};
