import { ObjectIdentifier } from '../interface';
import { Metadata, INJECT_TAG, tagProperty, PIPELINE_IDENTIFIER, tagParameter } from '../common';

export function Pipeline(valves?: ObjectIdentifier[]) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      const metadata = new Metadata(INJECT_TAG, PIPELINE_IDENTIFIER);
      metadata.args = valves;
      tagParameter(target, targetKey, index, metadata);
    } else {
      const metadata = new Metadata(INJECT_TAG, PIPELINE_IDENTIFIER);
      metadata.args = valves;
      tagProperty(target, targetKey, metadata);
    }
  };
}
