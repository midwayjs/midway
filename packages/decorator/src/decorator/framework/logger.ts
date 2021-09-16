import { attachClassMetadata, INJECT_CUSTOM_TAG, LOGGER_KEY } from '../../';

export function Logger(identifier?: string) {
  return function (target: any, targetKey: string): void {
    if (!identifier) {
      identifier = targetKey;
    }
    attachClassMetadata(
      INJECT_CUSTOM_TAG,
      {
        targetKey: identifier,
        propertyName: targetKey,
        key: LOGGER_KEY,
      },
      target,
      targetKey
    );
  };
}
