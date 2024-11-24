import { CONFIGURATION_KEY } from '../';
import { ClassType, IFileDetector, ILifeCycle } from '../../interface';
import { MetadataManager } from '../metadataManager';
import { FunctionalConfiguration } from '../../functional';

export interface IComponentInfo {
  component: { Configuration: ClassType<ILifeCycle> } | FunctionalConfiguration;
  enabledEnvironment?: string[];
}

export interface InjectionConfigurationOptions {
  imports?: Array<
    | IComponentInfo
    | { Configuration: ClassType<ILifeCycle> }
    | FunctionalConfiguration
  >;
  importObjects?: Record<string, unknown>;
  importConfigs?:
    | Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
  importConfigFilter?: (config: Record<string, any>) => Record<string, any>;
  namespace?: string;
  detector?: IFileDetector | false;
}

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    MetadataManager.defineMetadata(CONFIGURATION_KEY, options, target);
  };
}
