import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';
import { OperationObject } from '../interfaces';

export type ApiOperationOptions = Partial<OperationObject>;

const defaultOperationOptions: ApiOperationOptions = {
  summary: '',
};

export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
  return createCustomMethodDecorator(DECORATORS.API_OPERATION, {
    ...defaultOperationOptions,
    ...options,
  } as ApiOperationOptions);
}
