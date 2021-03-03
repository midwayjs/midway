import { saveClassMetadata, CONFIGURATION_KEY } from '../';
import { MidwayFrameworkType } from '../interface';

export interface IComponentInfo {
  component: any;
  enabledEnvironment?: string[];
}

export interface ResolveFilter {
  pattern: string | RegExp;
  filter: (module, filter, bindModule) => any;
  ignoreRequire?: boolean;
}

export enum FrameworkContainerScopeEnum {
  GLOBAL = 'global',
  FRAMEWORK = 'framework',
}

export interface InjectionConfigurationOptions {
  imports?: Array<string | IComponentInfo | { Configuration: any }>;
  importObjects?: Record<string, unknown>;
  importConfigs?: string[];
  namespace?: string;
  directoryResolveFilter?: ResolveFilter[];
  frameworkContainerScope?: FrameworkContainerScopeEnum;
  framework?: MidwayFrameworkType;
  conflictCheck?: boolean;
}

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(CONFIGURATION_KEY, options, target);
  };
}
