import { attachClassMetadata, INJECT_CUSTOM_TAG, PLUGIN_KEY } from '../../';

export function Plugin(identifier?: string) {
  return function (target: any, targetKey: string): void {
    if (!identifier) {
      identifier = targetKey;
    }
    attachClassMetadata(
      INJECT_CUSTOM_TAG,
      {
        targetKey: identifier,
        propertyName: targetKey,
        key: PLUGIN_KEY,
      },
      target,
      targetKey
    );
  };
}
