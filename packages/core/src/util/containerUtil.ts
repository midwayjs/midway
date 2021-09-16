import { MidwayContainer } from '../context/container';
import { DirectoryFileDetector, CustomModuleDetector } from './fileDetector';
import { join } from 'path';
import { safeRequire } from './index';
import { IMidwayContainer } from '../interface';

export const createModuleContainer = (options: {
  container?: IMidwayContainer;
  modules: any[];
  entry: { Configuration: any };
}) => {
  const applicationContext = options.container || new MidwayContainer();
  applicationContext.setFileDetector(
    new CustomModuleDetector({
      modules: options.modules,
    })
  );
  applicationContext.load(options.entry);
  return applicationContext;
};

export const createDirectoryGlobContainer = options => {
  const applicationContext = new MidwayContainer();
  applicationContext.setFileDetector(
    new DirectoryFileDetector({
      loadDir: options.baseDir,
    })
  );
  applicationContext.load(safeRequire(join(options.baseDir, 'configuration')));
  return applicationContext;
};
