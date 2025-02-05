import { Singleton } from "@midwayjs/core";
import { IValidationService } from "./interface";


@Singleton()
export class ValidationServiceStore<Schema> {
  private validationService: IValidationService<Schema>;
  setValidationService(service: IValidationService<Schema>) {
    this.validationService = service;
  }

  getValidationService() {
    return this.validationService;
  }
}
