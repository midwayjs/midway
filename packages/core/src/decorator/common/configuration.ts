import { CONFIGURATION_KEY } from '../';
import { IFileDetector } from '../../interface';
import { MetadataManager } from '../metadataManager';

export interface IComponentInfo {
  component: any;
  enabledEnvironment?: string[];
}

export interface ResolveFilter {
  pattern: string | RegExp;
  filter: (module, filter, bindModule) => any;
  ignoreRequire?: boolean;
}

export interface InjectionConfigurationOptions {
  imports?: Array<string | IComponentInfo | { Configuration: any }>;
  importObjects?: Record<string, unknown>;
  importConfigs?:
    | Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
  importConfigFilter?: (config: Record<string, any>) => Record<string, any>;
  namespace?: string;
  detector?: IFileDetector | false;
  detectorOptions?: Record<string, any>;
  conflictCheck?: boolean;
}

export function Configuration(
  options: InjectionConfigurationOptions = {}
): ClassDecorator {
  return (target: any) => {
    MetadataManager.defineMetadata(CONFIGURATION_KEY, options, target);
  };
}
