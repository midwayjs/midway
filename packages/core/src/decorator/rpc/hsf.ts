import { saveClassMetadata, saveModule, HSF_KEY, Provide, Scope } from '../';
import { ScopeEnum } from '../../interface';

export interface HSFOpts {
  interfaceName?: string;
  version?: string;
  group?: string;
  namespace?: string;
}

/**
 * @Deprecated
 * @param hsfOption
 * @constructor
 */
export function HSF(hsfOption: HSFOpts = {}): ClassDecorator {
  return (target: any) => {
    saveModule(HSF_KEY, target);
    saveClassMetadata(HSF_KEY, hsfOption, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
