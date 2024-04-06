import {
  attachClassMetadata,
  attachPropertyMetadata,
  attachPropertyDataToClass,
  savePropertyDataToClass,
  saveClassMetadata,
  saveModule,
  savePreloadModule,
  savePropertyMetadata
} from '../../../src';

export function customCls(): ClassDecorator {
  return (target) => {
    saveClassMetadata('custom', 'test', target);
    saveModule('custom', target);
  };
}

export function preload(): ClassDecorator {
  return (target) => {
    savePreloadModule(target);
  };
}

export function customMethod(): MethodDecorator {
  return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
    savePropertyDataToClass('custom', {
      method: propertykey,
      data: 'customData',
    }, target, propertykey);

    savePropertyMetadata('custom', 'methodData', target, propertykey);
    saveClassMetadata('custom_method', propertykey, target);
  };
}

export function attachMethod(data): MethodDecorator {
  return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
    attachPropertyMetadata('custom_attach', data, target, propertykey);
    attachPropertyDataToClass('custom_attach_to_class', data, target, propertykey);
  };
}

export function attachClass(data): ClassDecorator {
  return (target: object) => {
    attachClassMetadata('custom_class_attach', data, target);
  };
}

export function propertyKeyA(data): PropertyDecorator {
  return (target: object, propertyKey) => {
    savePropertyMetadata('custom_property', data, target, propertyKey);
  };
}

export function propertyKeyB(data): PropertyDecorator {
  return (target: object, propertyKey) => {
    attachPropertyDataToClass('custom_property_class', data, target, propertyKey);
  };
}
