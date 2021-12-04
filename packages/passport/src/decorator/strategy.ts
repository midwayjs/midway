import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

export function Strategy(): ClassDecorator {
  return (target) => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  }
}
