import { saveObjectDefinition } from '../decoratorManager';
import { ScopeEnum } from '../interface';
import { Provide } from './provide';

export function Init(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    saveObjectDefinition(target, { initMethod: propertyKey });
  };
}

export function Destroy(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    saveObjectDefinition(target, {
      destroyMethod: propertyKey,
    });
  };
}

export function Scope(
  scope: ScopeEnum,
  scopeOptions?: { allowDowngrade?: boolean }
): ClassDecorator {
  return function (target: any): void {
    saveObjectDefinition(target, { scope, ...scopeOptions });
  };
}

export function Singleton(): ClassDecorator {
  return function (target: any): void {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
