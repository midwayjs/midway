import { ObjectIdentifier, ScopeEnum } from '@midwayjs/decorator';
import { IApplicationContext } from '../interface';
import { FUNCTION_INJECT_KEY } from '../common/constants';

export function providerWrapper(wrapperInfo: Array<{
  id: ObjectIdentifier;
  provider: (context: IApplicationContext, args?: any) => any;
  scope?: ScopeEnum;
  isAutowire?: boolean;
}>): void {
  for (const info of wrapperInfo) {
    Object.defineProperty(info.provider, FUNCTION_INJECT_KEY, {
      value: info,
      writable: false,
    });
  }
}
