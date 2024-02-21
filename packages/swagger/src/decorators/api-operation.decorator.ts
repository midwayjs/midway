import { DECORATORS } from '../constants';
import { OperationObject } from '../interfaces';
import { createMixedDecorator } from './helpers';

export type ApiOperationOptions = Partial<OperationObject>;

const defaultOperationOptions: ApiOperationOptions = {
  summary: '',
};

export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
  return createMixedDecorator(DECORATORS.API_OPERATION, {
    ...defaultOperationOptions,
    ...options,
  } as ApiOperationOptions);
}
