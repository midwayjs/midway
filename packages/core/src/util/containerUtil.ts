import { MidwayContainer } from '../context/container';
import { DirectoryFileDetector, CustomModuleDetector } from './fileDetector';
import { join } from 'path';
import { safeRequire } from './index';

export const createModuleContainer = (options: {
  modules: any[];
  entry: { Configuration: any };
}) => {
  const applicationContext = new MidwayContainer();
  applicationContext.setFileDetector(
    new CustomModuleDetector({
      modules: options.modules,
    })
  );
  applicationContext.load(options.entry);
  return applicationContext;
};

export const createDirectoryGlobContainer = options => {
  const applicationContext = new MidwayContainer(options.baseDir, undefined);
  applicationContext.setFileDetector(
    new DirectoryFileDetector({
      loadDir: options.baseDir,
    })
  );
  applicationContext.load(safeRequire(join(options.baseDir, 'configuration')));
  return applicationContext;
};
