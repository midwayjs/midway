import { createModuleContainer, MidwayContainer } from '@midwayjs/core';
import { Framework } from './index';

export const createModuleServerlessFramework = async (options: {
  container?: MidwayContainer,
  modules: any[];
  entry: { Configuration: any };
}) => {
  const container = createModuleContainer(options);
  const framework = new Framework();
  framework.configure({});
  await framework.initialize({
    applicationContext: container,
    baseDir: '',
    appDir: '',
  });
  await framework.run();
  return framework;
};
