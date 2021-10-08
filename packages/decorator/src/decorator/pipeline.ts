import { ObjectIdentifier } from '../interface';
import { createCustomPropertyDecorator, PIPELINE_IDENTIFIER } from '../';

export function Pipeline(valves?: Array<ObjectIdentifier | (new (...args) => any)>) {
  return createCustomPropertyDecorator(PIPELINE_IDENTIFIER, {
    valves,
  });
}
