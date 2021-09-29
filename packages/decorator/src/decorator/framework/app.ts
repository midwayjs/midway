import {
  attachClassMetadata,
  APPLICATION_KEY,
  MidwayFrameworkType,
  INJECT_CUSTOM_TAG,
} from '../../';

export function App(type?: MidwayFrameworkType): PropertyDecorator {
  return function (target: any, targetKey: string): void {
    attachClassMetadata(
      INJECT_CUSTOM_TAG,
      {
        key: APPLICATION_KEY,
        propertyName: targetKey,
        meta: {
          type,
        },
      },
      target,
      targetKey
    );
  };
}
