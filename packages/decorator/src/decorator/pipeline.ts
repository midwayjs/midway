import { ObjectIdentifier } from '../interface';
import { PIPELINE_IDENTIFIER, savePropertyInject } from '../';

export function Pipeline(valves?: ObjectIdentifier[]) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({
      target,
      targetKey,
      identifier: PIPELINE_IDENTIFIER,
      args: valves,
    });
  };
}
