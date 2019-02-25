import { saveModule, scope, ScopeEnum } from 'injection';
import { FUNC_KEY } from '../constant';

export function func(): ClassDecorator {
  return (target: any) => {
    // 保存到扫描列表
    saveModule(FUNC_KEY, target);
    // 注册数据
    scope(ScopeEnum.Request)(target);
  };
}
