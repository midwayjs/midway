import {
  Configuration,
  Init,
  Inject,
  getMethodParamTypes,
  getClassExtendedMetadata,
  JoinPoint,
} from '@midwayjs/decorator';
import { MidwayDecoratorService } from '@midwayjs/core';
import { RULES_KEY, VALIDATE_KEY } from './constants';
import * as Joi from 'joi';
import { plainToClass } from 'class-transformer';

@Configuration({
  namespace: 'validate',
})
export class ValidateConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    this.decoratorService.registerMethodHandler(
      VALIDATE_KEY,
      (target, propertyKey, metadata) => {
        // get param types from method
        const paramTypes = getMethodParamTypes(target, propertyKey);

        // add aspect method
        return {
          before: (joinPoint: JoinPoint) => {
            for (let i = 0; i < paramTypes.length; i++) {
              const item = paramTypes[i];
              const rules = getClassExtendedMetadata(RULES_KEY, item);
              if (rules) {
                const schema = Joi.object(rules);
                const result = schema.validate(joinPoint.args[i]);
                if (result.error) {
                  throw result.error;
                } else {
                  joinPoint.args[i] = result.value;
                }
                // passed
                if (metadata.isTransform) {
                  joinPoint.args[i] = plainToClass(item, joinPoint.args[i]);
                }
              }
            }
          },
        };
      }
    );
  }
}
