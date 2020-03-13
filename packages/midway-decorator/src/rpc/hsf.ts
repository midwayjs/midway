import { ScopeEnum, saveClassMetadata, saveModule, HSF_KEY } from '../common';
import { Scope } from '../annotation';

export interface HsfOpts {
  interfaceName?: string;
  version?: string;
  group?: string;
  namespace?: string;
}

export function hsf(hsfOption: HsfOpts = {}): ClassDecorator {
  return (target: any) => {
    saveModule(HSF_KEY, target);
    saveClassMetadata(HSF_KEY, hsfOption, target);
    Scope(ScopeEnum.Request)(target);
  };
}
