import { ScopeEnum, saveClassMetadata, saveModule, HSF_KEY } from '../../';
import { Scope } from '../';

export interface HSFOpts {
  interfaceName?: string;
  version?: string;
  group?: string;
  namespace?: string;
}

/**
 * @param hsfOption
 * @constructor
 */
export function HSF(hsfOption: HSFOpts = {}): ClassDecorator {
  return (target: any) => {
    saveModule(HSF_KEY, target);
    saveClassMetadata(HSF_KEY, hsfOption, target);
    Scope(ScopeEnum.Request)(target);
  };
}
