import {
  attachClassMetadata,
  PLUGIN_KEY,
  attachConstructorDataOnClass,
} from '../';

export function Plugin(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, PLUGIN_KEY, index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachClassMetadata(
        PLUGIN_KEY,
        {
          key: identifier,
          propertyName: targetKey,
        },
        target
      );
    }
  };
}
