import {
  Configuration,
  Inject,
  getMethodParamTypes,
  JoinPoint,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
  Pipe,
  WEB_ROUTER_PARAM_KEY,
  IMidwayContainer,
  PipeTransform,
} from '@midwayjs/core';
import { VALIDATE_KEY } from './constants';
import * as DefaultConfig from './config/config.default';
import { ValidateService } from './service';
import * as i18n from '@midwayjs/i18n';
import * as Joi from 'joi';

@Pipe()
export class ValidationPipe implements PipeTransform {
  @Inject()
  protected validateService: ValidateService;
  transform(value: any) {
    const result = this.validateService.validateWithSchema(
      Joi.string().required(),
      value
    );
    if (result && result.value) {
      return result.value;
    }
    return value;
  }
}

@Configuration({
  namespace: 'validate',
  imports: [i18n],
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

  async onReady(container: IMidwayContainer) {
    await container.getAsync(ValidationPipe);

    this.decoratorService.registerMethodHandler(VALIDATE_KEY, options => {
      // get param types from method
      const paramTypes = getMethodParamTypes(
        options.target,
        options.propertyName
      );

      const validateOptions = options.metadata?.options;

      // add aspect method
      return {
        before: (joinPoint: JoinPoint) => {
          for (let i = 0; i < paramTypes.length; i++) {
            if (!validateOptions.locale) {
              const maybeCtx = joinPoint.target[REQUEST_OBJ_CTX_KEY];
              if (maybeCtx && maybeCtx.getAttr) {
                validateOptions.locale = maybeCtx.getAttr(i18n.I18N_ATTR_KEY);
              }
            }
            const item = paramTypes[i];
            const result = this.validateService.validate(
              item,
              joinPoint.args[i],
              validateOptions
            );
            if (result && result.value) {
              joinPoint.args[i] = result.value;
            }
          }
        },
      };
    });

    // register web param default pipe
    this.decoratorService.registerParameterPipes(WEB_ROUTER_PARAM_KEY, [
      ValidationPipe,
    ]);
  }
}
