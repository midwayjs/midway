import { Singleton } from '@midwayjs/core';
import { IValidationService } from './interface';
import { MidwayValidationStoreNotSetError } from './error';

@Singleton()
export class ValidationServiceStore<Schema> {
  private validationService: IValidationService<Schema>;
  setValidationService(service: IValidationService<Schema>) {
    this.validationService = service;
  }

  getValidationService() {
    if (!this.validationService) {
      throw new MidwayValidationStoreNotSetError();
    }
    return this.validationService;
  }
}
