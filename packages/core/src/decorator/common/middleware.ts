import { Scope, Provide, ScopeEnum } from '../';

export function Middleware(): ClassDecorator {
  return (target: any) => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
