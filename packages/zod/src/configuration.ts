import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { ZodValidationService } from './service';
import * as validation from '@midwayjs/validation';

@Configuration({
  namespace: 'zod',
  imports: [validation],
})
export class ZodValidateConfiguration {
  async onReady(container: IMidwayContainer) {
    const validationService = await container.getAsync(ZodValidationService);
    const validationServiceStore = await container.getAsync(
      validation.ValidationServiceStore
    );
    validationServiceStore.setValidationService(validationService);
  }
}
