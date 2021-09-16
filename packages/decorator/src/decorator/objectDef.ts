import { ScopeEnum, saveObjectDefinition } from '../';

export function Init() {
  return function (target: any, propertyKey: string): void {
    return saveObjectDefinition(target, { initMethod: propertyKey });
  };
}

export function Destroy() {
  return function (target: any, propertyKey: string): void {
    return saveObjectDefinition(target, {
      destroyMethod: propertyKey,
    });
  };
}

export function Scope(scope: ScopeEnum = ScopeEnum.Singleton) {
  return function (target: any): void {
    return saveObjectDefinition(target, { scope });
  };
}
