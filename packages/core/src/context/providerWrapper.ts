import { IMidwayContainer, ObjectIdentifier, ScopeEnum } from '../interface';
import { FUNCTION_INJECT_KEY } from '../common/constants';

export function providerWrapper(
  wrapperInfo: Array<{
    id: ObjectIdentifier;
    provider: (context: IMidwayContainer, args?: any) => any;
    scope?: ScopeEnum;
  }>
): void {
  for (const info of wrapperInfo) {
    Object.defineProperty(info.provider, FUNCTION_INJECT_KEY, {
      value: info,
      writable: false,
    });
  }
}
