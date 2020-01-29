import { saveClassMetadata } from 'injection';
import { CONFIGURATION_KEY } from '../constant';

export interface InjectionConfigurationOptions {
  imports: string[];
  importObjects: any[];
}

export function Configuration(
  options: InjectionConfigurationOptions
): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(CONFIGURATION_KEY, options, target);
  };
}
