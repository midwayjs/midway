import {
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
} from '@midwayjs/core';
import { Framework, IFaaSConfigurationOptions } from './index';

export const createModuleServerlessFramework = async (
  globalOption: Omit<IMidwayBootstrapOptions, 'applicationContext'> &
    IFaaSConfigurationOptions
) => {
  const applicationContext = await initializeGlobalApplicationContext({
    ...globalOption,
    baseDir: '',
    appDir: '',
  });
  return applicationContext.get(Framework);
};
