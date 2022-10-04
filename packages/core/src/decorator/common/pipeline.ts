import { createCustomPropertyDecorator } from '../decoratorManager';
import { PIPELINE_IDENTIFIER } from '../constant';
import { ObjectIdentifier } from '../interface';

export function Pipeline(
  valves?: Array<ObjectIdentifier | (new (...args) => any)>
) {
  return createCustomPropertyDecorator(PIPELINE_IDENTIFIER, {
    valves,
  });
}
