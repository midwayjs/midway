import { createModuleContainer } from '@midwayjs/core';
import { Framework } from './index';

export const createModuleServerlessFramework = async (options: {
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
