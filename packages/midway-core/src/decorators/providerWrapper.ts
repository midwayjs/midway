import {IApplicationContext, ObjectIdentifier} from 'injection';
import {FUNCTION_INJECT_KEY} from './metaKeys';

export function providerWrapper(wrapperInfo: Array<{
  id: ObjectIdentifier,
  provider: (context?: IApplicationContext) => any
}>): void {
  for(let info of wrapperInfo) {
    Object.defineProperty(info.provider, FUNCTION_INJECT_KEY, {
      value: info.id,
      writable: false
    });
  }
}
