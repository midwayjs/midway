import { ScopeEnum, saveObjectDefProps } from '../';

export function Init() {
  return function (target: any, propertyKey: string): void {
    return saveObjectDefProps(target.constructor, { initMethod: propertyKey });
  };
}

export function Destroy() {
  return function (target: any, propertyKey: string): void {
    return saveObjectDefProps(target.constructor, {
      destroyMethod: propertyKey,
    });
  };
}

export function Scope(scope: ScopeEnum = ScopeEnum.Singleton) {
  return function (target: any): void {
    return saveObjectDefProps(target, { scope });
  };
}
