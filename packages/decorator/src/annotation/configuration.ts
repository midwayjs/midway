import { saveClassMetadata, CONFIGURATION_KEY } from '../';

export interface IComponentInfo {
  component: any;
  enabledEnvironment?: string[];
}

export interface ResolveFilter {
  pattern: string | RegExp;
  filter: (module, filter, bindModule) => any;
}

export interface InjectionConfigurationOptions {
  imports?: Array<string | IComponentInfo | { Configuration: any }>;
  importObjects?: Record<string, unknown>;
  importConfigs?: string[];
  namespace?: string;
  directoryResolveFilter?: ResolveFilter[];
}

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(CONFIGURATION_KEY, options, target);
  };
}
