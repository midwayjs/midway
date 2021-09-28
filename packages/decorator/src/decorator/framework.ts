import { saveModule, FRAMEWORK_KEY, Scope, ScopeEnum } from '../';

export function Framework(): ClassDecorator {
  return (target: any) => {
    saveModule(FRAMEWORK_KEY, target);
    Scope(ScopeEnum.Singleton);
  };
}
