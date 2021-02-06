import {
  createConfiguration,
  FUNCTION_INJECT_KEY,
} from '../../../../../../../src';

import { saveClassMetadata, saveModule, ScopeEnum, CONTROLLER_KEY, Provide, Inject } from '@midwayjs/decorator';
import { IMidwayContainer } from '../../../../../../../dist';

@Provide()
export class FunctionContainer {
  @Inject()
  ctx;

  async getFunction() {
    return this.ctx.requestContext.getAsync('');
  }
}

export const createHooks = (hooksOptions) => {

  const configuration = createConfiguration({
    namespace: 'hooks',
    directoryResolveFilter: [
      {
        pattern: hooksOptions.routes[0].loadDir,
        filter: (module, filePath, container: IMidwayContainer) => {
          for(const fnName in module) {
            module[fnName][FUNCTION_INJECT_KEY] = {
              id: fnName,
              provider:  async (requestContainer) => {
                return module[fnName];
              },
              scope: ScopeEnum.Request,
            }

            container.bindClass(module[fnName]);
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
  }).onReady(async () => {
    console.log('on ready in hooks');
  }).onStop(async () => {
    console.log('on ready in hooks');
  });

  return {
    Configuration: configuration,
  }
}
