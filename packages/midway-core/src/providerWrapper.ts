import { IApplicationContext, ObjectIdentifier, Scope } from 'injection';
import { FUNCTION_INJECT_KEY } from './constant';

export function providerWrapper(wrapperInfo: Array<{
  id: ObjectIdentifier;
  provider: (context?: IApplicationContext) => any;
  scope?: Scope;
  isAutowire?: boolean;
}>): void {
  for (const info of wrapperInfo) {
    Object.defineProperty(info.provider, FUNCTION_INJECT_KEY, {
      value: info,
      writable: false,
    });
  }
}
