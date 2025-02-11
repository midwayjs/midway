import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { JoiValidationService } from './service';
import * as validation from '@midwayjs/validation';

@Configuration({
  namespace: 'joi',
  imports: [validation],
  importConfigs: [
    {
      default: {
        i18n: {
          localeTable: {
            en_US: {
              validate: require('../locales/en_US.json'),
            },
            zh_CN: {
              validate: require('../locales/zh_CN.json'),
            },
          },
        },
      },
    },
  ],
})
export class ValidateConfiguration {
  async onReady(container: IMidwayContainer) {
    const validationService = await container.getAsync(JoiValidationService);
    const validationServiceStore = await container.getAsync(
      validation.ValidationServiceStore
    );
    validationServiceStore.setValidationService(validationService);
  }
}
