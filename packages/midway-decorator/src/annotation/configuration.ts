import { saveClassMetadata, saveModule, saveProviderId, LIFECYCLE_IDENTIFIER_PREFIX, CONFIGURATION_KEY, classNamed } from '../common';

export interface InjectionConfigurationOptions {
  imports?: string[];
  importObjects?: object;
  importConfigs?: string[];
  namespace?: string;
}

export function Configuration(
  options: InjectionConfigurationOptions
): ClassDecorator {
  return (target: any) => {
    saveModule(CONFIGURATION_KEY, target);
    saveClassMetadata(CONFIGURATION_KEY, options, target);

    const identifier = `${LIFECYCLE_IDENTIFIER_PREFIX}${classNamed(target.name)}`;
    saveProviderId(identifier, target);
  };
}
