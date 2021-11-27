import {
  Configuration,
  Init,
  Inject,
  getMethodParamTypes,
  getClassExtendedMetadata,
  JoinPoint,
  Provide,
  Scope,
  ScopeEnum,
  Config,
} from '@midwayjs/decorator';
import { MidwayDecoratorService, MidwayValidationError } from '@midwayjs/core';
import { RULES_KEY, VALIDATE_KEY } from './constants';
import * as Joi from 'joi';
import * as util from 'util';
import * as DefaultConfig from './config.default';

const debug = util.debuglog('midway:debug');

@Provide()
@Scope(ScopeEnum.Singleton)
export class ValidateService {
  @Config('validate')
  validateConfig: typeof DefaultConfig.validate;

  validate(
    ClzType: new (...args) => any,
    value: any,
    options?: {
      errorStatus?: number;
      validateOptions?: Joi.ValidationOptions;
    }
  ) {
    const rules = getClassExtendedMetadata(RULES_KEY, ClzType);
    if (rules) {
      const schema = Joi.object(rules);
      const result = schema.validate(
        value,
        Object.assign(
          this.validateConfig.validationOptions,
          options.validateOptions ?? {}
        )
      );
      if (result.error) {
        throw new MidwayValidationError(
          result.error.message,
          options?.errorStatus ?? this.validateConfig.errorStatus,
          result.error
        );
      } else {
        return result;
      }
    }
  }
}

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
