import { Scope, Provide, saveModule, MOCK_KEY } from '../';
import { ScopeEnum } from '../../interface';

export function Mock(): ClassDecorator {
  return (target: any) => {
    saveModule(MOCK_KEY, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
