import { ObjectIdentifier } from '../../interface';
import { createCustomPropertyDecorator } from '../decoratorManager';
import { PIPELINE_IDENTIFIER } from '../constant';

export function Pipeline(
  valves?: Array<ObjectIdentifier | (new (...args) => any)>
) {
  return createCustomPropertyDecorator(PIPELINE_IDENTIFIER, {
    valves,
  });
}
