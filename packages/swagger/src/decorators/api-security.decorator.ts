import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';
import { SecurityRequirementObject } from '../interfaces';

export function ApiSecurity(
  name: string | SecurityRequirementObject,
  requirements: string[] = []
): any {
  let metadata: SecurityRequirementObject;

  if (typeof name === 'string') {
    metadata = { [name]: requirements || [] };
  } else {
    metadata = name;
  }

  return createCustomMethodDecorator(DECORATORS.API_SECURITY, metadata);
}
