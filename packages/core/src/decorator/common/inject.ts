import { DecoratorManager } from '../decoratorManager';
import {
  IServiceFactory,
  ObjectIdentifier,
  InjectModeEnum,
  ClassType,
} from '../../interface';
import {
  CONSTRUCTOR_INJECT_KEY,
  FACTORY_SERVICE_CLIENT_KEY,
  PROPERTY_INJECT_KEY,
} from '../constant';
import { isClass } from '../../util/types';
import { MetadataManager } from '../metadataManager';
import { getParamNames } from '../../util';

function getConstructParamNames(target) {
  let paramNames = MetadataManager.getOwnMetadata(
    'constructorParamNames',
    target
  );
  if (!paramNames) {
    // cache constructor param names
    paramNames = getParamNames(target);
    MetadataManager.defineMetadata('constructorParamNames', paramNames, target);
  }
  return paramNames;
}

export function saveInjectMetadata(
  identifier,
  target,
  targetKey,
  isLazyInject = false,
  parameterIndex?: number
) {
  // 1、use identifier by user
  // let identifier = opts.identifier;
  let injectMode = InjectModeEnum.Identifier;
  let id = identifier;
  const isConstructor = parameterIndex !== undefined;
  // 2、use identifier by class uuid
  if (isConstructor) {
    const paramNames = getConstructParamNames(target);

    if (!id) {
      const argsTypes = MetadataManager.getMethodParamTypes(target, targetKey);
      const type = MetadataManager.transformTypeFromTSDesign(
        argsTypes[parameterIndex]
      );
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
        id = paramNames[parameterIndex];
        injectMode = InjectModeEnum.SelfName;
      }
    }
    MetadataManager.attachMetadata(
      CONSTRUCTOR_INJECT_KEY,
      {
        targetKey,
        id,
        name: paramNames[parameterIndex],
        injectMode,
        isLazyInject,
        parameterIndex,
      },
      target,
      'default'
    );
  } else {
    if (!id) {
      const type = MetadataManager.transformTypeFromTSDesign(
        MetadataManager.getPropertyType(target, targetKey)
      );
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
        isLazyInject,
        injectMode,
      },
      target,
      targetKey
    );
  }
}

export function Inject(
  identifier?: ObjectIdentifier
): PropertyDecorator & ParameterDecorator {
  return function (target: any, targetKey: string, parameterIndex?: number) {
    return saveInjectMetadata(
      identifier,
      target,
      targetKey,
      false,
      parameterIndex
    );
  };
}

export function LazyInject(
  identifier?: ObjectIdentifier | (() => ObjectIdentifier | ClassType)
): PropertyDecorator & ParameterDecorator {
  let id = identifier;
  if (id && typeof id !== 'function') {
    id = (() => {
      return identifier;
    }) as any;
  }
  return function (target: any, targetKey: string, parameterIndex?: number) {
    return saveInjectMetadata(id, target, targetKey, true, parameterIndex);
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
