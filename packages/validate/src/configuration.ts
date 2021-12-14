import {
  Configuration,
  Init,
  Inject,
  getMethodParamTypes,
  JoinPoint,
} from '@midwayjs/decorator';
import { MidwayDecoratorService } from '@midwayjs/core';
import { VALIDATE_KEY } from './constants';
import * as util from 'util';
import * as DefaultConfig from './config.default';
import { ValidateService } from './service';

const debug = util.debuglog('midway:debug');

@Configuration({
  namespace: 'validate',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ValidateConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  validateService: ValidateService;

  @Init()
  async init() {
    debug(`[validate]: Register @validate "${VALIDATE_KEY}" handler"`);
    this.decoratorService.registerMethodHandler(VALIDATE_KEY, options => {
      // get param types from method
      const paramTypes = getMethodParamTypes(
        options.target,
        options.propertyName
      );

      // add aspect method
      return {
        before: (joinPoint: JoinPoint) => {
          for (let i = 0; i < paramTypes.length; i++) {
            const item = paramTypes[i];
            const result = this.validateService.validate(
              item,
              joinPoint.args[i],
              options.metadata?.options
            );
            if (result && result.value) {
              joinPoint.args[i] = result.value;
            }
          }
        },
      };
    });
  }
}
