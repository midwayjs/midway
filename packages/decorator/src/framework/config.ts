import { ALL, attachClassMetadata, attachConstructorDataOnClass, CONFIG_KEY, } from '../';

export function Config(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, CONFIG_KEY, index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      if (identifier === ALL) {
        identifier = '';
      }
      attachClassMetadata(
        CONFIG_KEY,
        {
          key: identifier,
          propertyName: targetKey,
        },
        target
      );
    }
  };
}
