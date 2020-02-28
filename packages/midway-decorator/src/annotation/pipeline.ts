import { ObjectIdentifier } from '../interface';
import { Metadata, INJECT_TAG, tagProperty, PIPELINE_IDENTIFIER } from '../common';

export function Pipeline(valves?: ObjectIdentifier[]) {
  return function (target: any, targetKey: string, index?: number): void {
    const metadata = new Metadata(INJECT_TAG, PIPELINE_IDENTIFIER);
    metadata.args = valves;
    tagProperty(target, targetKey, metadata);
  };
}
