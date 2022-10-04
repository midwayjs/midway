import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

export function CustomStrategy(): ClassDecorator {
  return target => {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
