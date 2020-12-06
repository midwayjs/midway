import { MidwayFrameworkLogger } from '@midwayjs/logger';
import { IMidwayFramework } from './interface';

export const createFrameworkLogger = (framework: IMidwayFramework<any, any>) => {
  return new MidwayFrameworkLogger({
    label: framework.getFrameworkType(),
    dir: framework.getAppDir(),
  });
}
