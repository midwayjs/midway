import { Scope } from '../annotation';
import { ScopeEnum, saveClassMetadata, saveModule, FUNC_KEY } from '../common';
import { KoaMiddlewareParamArray } from '..';

export function Func(
  funHandler: string,
  functionOptions: {
    middleware?: KoaMiddlewareParamArray;
  } = { middleware: [] }
): ClassDecorator {
  return (target: any) => {
    // 保存到扫描列表
    saveModule(FUNC_KEY, target);
    saveClassMetadata(
      FUNC_KEY,
      {
        funHandler,
        middleware: functionOptions.middleware,
      },
      target
    );
    // 注册数据
    Scope(ScopeEnum.Request)(target);
  };
}
