import {
  Configuration,
  Inject,
  MidwayDecoratorService,
  WEB_ROUTER_PARAM_KEY,
  IMidwayContainer,
  Init,
} from '@midwayjs/core';
import * as i18n from '@midwayjs/i18n';
import {
  DecoratorValidPipe,
  ParseBoolPipe,
  ParseFloatPipe,
  ParseIntPipe,
  ValidationPipe,
} from './pipe';
import { VALID_KEY } from './constants';
import { ValidationService } from './service';

@Configuration({
  namespace: 'validation',
  imports: [i18n],
  importConfigs: [
    {
      default: {
        validation: {
          errorStatus: 422,
          throwValidateError: true,
        },
      },
    },
  ],
})
export class ValidationConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  validateService: ValidationService;

  @Init()
  async init() {
    this.decoratorService.registerParameterHandler(
      VALID_KEY,
      ({ parameterIndex, originParamType, originArgs, metadata }) => {
        if (!metadata.schema) {
          metadata.schema = this.validateService.getSchema(originParamType);
        }
        return originArgs[parameterIndex];
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    await container.getAsync(ValidationPipe);
    await container.getAsync(ParseIntPipe);
    await container.getAsync(ParseBoolPipe);
    await container.getAsync(ParseFloatPipe);
    await container.getAsync(DecoratorValidPipe);

    // register web param default pipe
    this.decoratorService.registerParameterPipes(WEB_ROUTER_PARAM_KEY, [
      ValidationPipe,
    ]);
  }
}
