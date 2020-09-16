import {
  attachClassMetadata,
  APPLICATION_KEY,
  attachConstructorDataOnClass,
} from '../';

export function App() {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(targetKey, target, APPLICATION_KEY, index);
    } else {
      attachClassMetadata(
        APPLICATION_KEY,
        {
          key: APPLICATION_KEY,
          propertyName: targetKey,
        },
        target
      );
    }
  };
}
