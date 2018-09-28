import { IApplicationContext, Scope, ObjectIdentifier } from 'injection';
import {FUNCTION_INJECT_KEY} from './metaKeys';

export function providerWrapper(wrapperInfo: Array<{
  id: ObjectIdentifier,
  provider: (context?: IApplicationContext) => any,
  scope?: Scope,
  isAutowire?: boolean
}>): void {
  for(let info of wrapperInfo) {
    Object.defineProperty(info.provider, FUNCTION_INJECT_KEY, {
      value: info,
      writable: false
    });
  }
}
