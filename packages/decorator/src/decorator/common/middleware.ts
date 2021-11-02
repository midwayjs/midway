import { Scope, ScopeEnum, Provide } from '../../index';

export function Middleware(): ClassDecorator {
  return (target: any) => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
