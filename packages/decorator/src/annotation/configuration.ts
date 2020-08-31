import { saveClassMetadata, CONFIGURATION_KEY } from '../common';

export interface InjectionConfigurationOptions {
  imports?: string[];
  importObjects?: object;
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
