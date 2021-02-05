import {
  createConfiguration,
  FUNCTION_INJECT_KEY,
} from '../../../../../../../src';

import { ScopeEnum, CONTROLLER_KEY, Provide, Inject } from '@midwayjs/decorator';
import { saveClassMetadata, saveModule } from '../../../../../../../../decorator/dist/.mwcc-cache';

@Provide()
export class FunctionContainer {
  @Inject()
  ctx;

  async getFunction() {
    return this.ctx.requestContext.getAsync(fnName);
  }
}

export const createHooks = (hooksOptions) => {

  const configuration = createConfiguration({
    namespace: 'hooks',
    directoryResolveFilter: [
      {
        pattern: hooksOptions.pattern,
        filter: (module, filePath, bindModule) => {
          for(const fnName of module) {
            module[fnName][FUNCTION_INJECT_KEY] = {
              id: fnName,
              provider:  (requestContainer) => {
                return module[fnName];
              },
              scope: ScopeEnum.Request,
              isAutowire: true,
            }

            bindModule(module[fnName]);
            // register controller

            saveModule(CONTROLLER_KEY, FunctionContainer);
            saveClassMetadata(CONTROLLER_KEY, {
              path: '/api',
              method: 'getFunction'
            }, FunctionContainer);
          }
        }
      }
    ]
  });

  return {
    Configuration: configuration,
  }
}
