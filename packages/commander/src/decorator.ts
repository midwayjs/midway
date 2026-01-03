import {
  DecoratorManager,
  MetadataManager,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';

export const CLI_COMMAND_KEY = 'cli:command';
export const CLI_OPTION_KEY = 'cli:option';

export interface CliCommandOptions {
  name: string;
  arguments?: string;
  description?: string;
  argsDescription?: Record<string, string>;
  aliases?: string[];
}

export interface CliOptionOptions {
  flags: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  name?: string; // 如果不传，从 flags 解析
}

export function Command(options: CliCommandOptions): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(CLI_COMMAND_KEY, target);
    MetadataManager.defineMetadata(CLI_COMMAND_KEY, options, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function Option(options: CliOptionOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    MetadataManager.attachMetadata(
      CLI_OPTION_KEY,
      {
        propertyKey,
        options,
      },
      target.constructor
    );
  };
}
