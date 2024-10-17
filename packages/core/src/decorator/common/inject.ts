import { DecoratorManager } from '../decoratorManager';
import {
  IServiceFactory,
  ObjectIdentifier,
  InjectModeEnum,
  ClassType,
} from '../../interface';
import {
  FACTORY_SERVICE_CLIENT_KEY,
  LAZY_INJECT_KEY,
  PROPERTY_INJECT_KEY,
} from '../constant';
import { isClass } from '../../util/types';
import { MetadataManager } from '../metadataManager';

export function saveInjectMetadata(
  identifier,
  target,
  targetKey,
  parameterIndex?: number
) {
  // 1、use identifier by user
  // let identifier = opts.identifier;
  let injectMode = InjectModeEnum.Identifier;
  let id = identifier;
  // 2、use identifier by class uuid
  if (!id) {
    const type = MetadataManager.getPropertyType(target, targetKey);
    if (
      !type.isBaseType &&
      isClass(type.originDesign) &&
      DecoratorManager.isProvide(type.originDesign)
    ) {
      id = DecoratorManager.getProviderUUId(type.originDesign as ClassType);
      injectMode = InjectModeEnum.Class;
    }
    if (!id) {
      // 3、use identifier by property name
      id = targetKey;
      injectMode = InjectModeEnum.SelfName;
    }
  }
  MetadataManager.defineMetadata(
    PROPERTY_INJECT_KEY,
    {
      targetKey,
      id,
      name: targetKey,
      injectMode,
    },
    target,
    targetKey
  );
}

export function Inject(
  identifier?: ObjectIdentifier
): PropertyDecorator & ParameterDecorator {
  return function (target: any, targetKey: string, parameterIndex?: number) {
    return saveInjectMetadata(identifier, target, targetKey, parameterIndex);
  };
}

export function LazyInject(
  identifier?: ObjectIdentifier | (() => ObjectIdentifier | ClassType)
): PropertyDecorator {
  if (identifier && typeof identifier !== 'function') {
    identifier = (() => {
      return identifier;
    }) as any;
  }
  return DecoratorManager.createCustomPropertyDecorator(LAZY_INJECT_KEY, {
    identifier,
  });
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
