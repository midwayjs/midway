import { saveClassMetadata, CONFIGURATION_KEY } from '../';

export interface IComponentInfo {
  component: any;
  enabledEnvironment?: string[];
}

export interface InjectionConfigurationOptions {
  imports?: Array<string | IComponentInfo | { Configuration: any }>;
  importObjects?: Record<string, unknown>;
  importConfigs?: string[];
  namespace?: string;
}

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(CONFIGURATION_KEY, options, target);
  };
}
