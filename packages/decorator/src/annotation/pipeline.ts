import { ObjectIdentifier } from '../interface';
import {
  PIPELINE_IDENTIFIER,
  saveConstructorInject,
  savePropertyInject,
} from '../';

export function Pipeline(valves?: ObjectIdentifier[]) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      saveConstructorInject({
        target,
        targetKey,
        identifier: PIPELINE_IDENTIFIER,
        index,
        args: valves,
      });
    } else {
      savePropertyInject({
        target,
        targetKey,
        identifier: PIPELINE_IDENTIFIER,
        args: valves,
      });
    }
  };
}
