import { Scope, Provide, ScopeEnum } from '../';

export function Pipe(): ClassDecorator {
  return (target: any) => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
