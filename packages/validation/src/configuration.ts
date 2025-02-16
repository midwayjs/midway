import {
  Configuration,
  Inject,
  MidwayDecoratorService,
  WEB_ROUTER_PARAM_KEY,
  IMidwayContainer,
  Init,
  MidwayConfigService,
  ApplicationContext,
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
import { registry } from './registry';
import { IValidationService } from './interface';

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
  configService: MidwayConfigService;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

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

    const validators = this.configService.getConfiguration<
      Record<
        string,
        (container: IMidwayContainer) => Promise<IValidationService<any>>
      >
    >('validation.validators');
    if (validators) {
      for (const [name, validatorHandler] of Object.entries(validators)) {
        registry.register(
          name,
          await validatorHandler(this.applicationContext)
        );
      }
    }
  }

  async onReady(container: IMidwayContainer) {
    this.validateService = await container.getAsync(ValidationService);
    await container.getAsync(ValidationPipe);
    await container.getAsync(ParseIntPipe);
    await container.getAsync(ParseBoolPipe);
    await container.getAsync(ParseFloatPipe);
    await container.getAsync(DecoratorValidPipe);

    // register web param default pipe
    this.decoratorService.registerParameterPipes(WEB_ROUTER_PARAM_KEY, [
      ValidationPipe,
    ]);

    // register default validator if not set
    if (!registry.getDefaultValidator()) {
      registry.setFirstValidatorToDefault();
    }
  }

  async onStop() {
    registry.clear();
  }
}
