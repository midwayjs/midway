import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

export function CustomStrategy(): ClassDecorator {
  return target => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
