import { DecoratorManager } from '../decoratorManager';
import { PIPELINE_IDENTIFIER } from '../constant';
import { ObjectIdentifier } from '../../interface';

export function Pipeline(
  valves?: Array<ObjectIdentifier | (new (...args) => any)>
) {
  return DecoratorManager.createCustomPropertyDecorator(PIPELINE_IDENTIFIER, {
    valves,
  });
}
