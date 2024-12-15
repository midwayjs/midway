import { CONFIGURATION_KEY, MAIN_MODULE_KEY, Provide, Scope } from '../';
import { MetadataManager } from '../metadataManager';
import { InjectionConfigurationOptions, ScopeEnum } from '../../interface';

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    options.namespace = options.namespace ?? MAIN_MODULE_KEY;
    MetadataManager.defineMetadata(CONFIGURATION_KEY, options, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
