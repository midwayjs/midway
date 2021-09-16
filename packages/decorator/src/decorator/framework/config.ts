import {
  ALL,
  attachClassMetadata,
  CONFIG_KEY,
  INJECT_CUSTOM_TAG,
} from '../../';

export function Config(identifier?: string) {
  return function (target: any, targetKey: string): void {
    if (!identifier) {
      identifier = targetKey;
    }
    if (identifier === ALL) {
      identifier = '';
    }
    attachClassMetadata(
      INJECT_CUSTOM_TAG,
      {
        key: CONFIG_KEY,
        propertyName: targetKey,
        targetKey: identifier,
      },
      target,
      targetKey
    );
  };
}
