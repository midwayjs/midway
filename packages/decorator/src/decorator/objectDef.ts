import { ScopeEnum, saveObjectDefinition } from '../';

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

export function Scope(scope: ScopeEnum = ScopeEnum.Singleton): ClassDecorator {
  return function (target: any): void {
    saveObjectDefinition(target, { scope });
  };
}
