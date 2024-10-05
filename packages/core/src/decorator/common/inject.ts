import { DecoratorManager } from '../decoratorManager';
import {
  IServiceFactory,
  ObjectIdentifier,
  InjectModeEnum,
  ClassType,
} from '../../interface';
import { FACTORY_SERVICE_CLIENT_KEY, PROPERTY_INJECT_KEY } from '../constant';
import { isClass } from '../../util/types';
import { MetadataManager } from '../metadataManager';

export function saveInjectMetadata(identifier, target, targetKey) {
  // 1、use identifier by user
  // let identifier = opts.identifier;
  let injectMode = InjectModeEnum.Identifier;
  // 2、use identifier by class uuid
  if (!identifier) {
    const type = MetadataManager.getPropertyType(target, targetKey);
    if (
      !type.isBaseType &&
      isClass(type.originDesign) &&
      DecoratorManager.isProvide(type.originDesign)
    ) {
      identifier = DecoratorManager.getProviderUUId(
        type.originDesign as ClassType
      );
      injectMode = InjectModeEnum.Class;
    }
    if (!identifier) {
      // 3、use identifier by property name
      identifier = targetKey;
      injectMode = InjectModeEnum.PropertyName;
    }
  }
  MetadataManager.attachMetadata(
    PROPERTY_INJECT_KEY,
    {
      targetKey,
      value: identifier,
      injectMode,
    },
    target,
    targetKey
  );
}

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string): void {
    saveInjectMetadata(identifier, target, targetKey);
  };
}

export function InjectClient(
  serviceFactoryClz: new (...args) => IServiceFactory<unknown>,
  clientName?: string
) {
  return DecoratorManager.createCustomPropertyDecorator(
    FACTORY_SERVICE_CLIENT_KEY,
    {
      serviceFactoryClz,
      clientName,
    }
  );
}
