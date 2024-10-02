import { Scope, Provide, MOCK_KEY, DecoratorManager } from '../';
import { ScopeEnum } from '../../interface';

export function Mock(): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MOCK_KEY, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
