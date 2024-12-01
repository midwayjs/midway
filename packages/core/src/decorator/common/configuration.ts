import { CONFIGURATION_KEY } from '../';
import { MetadataManager } from '../metadataManager';
import { InjectionConfigurationOptions } from '../../interface';

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    MetadataManager.defineMetadata(CONFIGURATION_KEY, options, target);
  };
}
