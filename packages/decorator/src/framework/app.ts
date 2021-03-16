import {
  attachClassMetadata,
  APPLICATION_KEY,
  attachConstructorDataOnClass, MidwayFrameworkType,
} from '../';

export function App(type?: MidwayFrameworkType) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(targetKey, target, APPLICATION_KEY, index);
    } else {
      attachClassMetadata(
        APPLICATION_KEY,
        {
          key: type,
          propertyName: targetKey,
        },
        target
      );
    }
  };
}
