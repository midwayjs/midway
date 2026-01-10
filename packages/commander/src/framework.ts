import {
  BaseFramework,
  Framework,
  IMidwayBootstrapOptions,
  DecoratorManager,
  MetadataManager,
} from '@midwayjs/core';
import {
  CommandRunner,
  ICommanderConfigurationOptions,
  IMidwayCommanderApplication,
  IMidwayContext,
} from './interface';
import {
  CLI_COMMAND_KEY,
  CLI_OPTION_KEY,
  CliCommandOptions,
  CliOptionOptions,
} from './decorator';
import { Command } from 'commander';

@Framework()
export class MidwayCommanderFramework extends BaseFramework<
  IMidwayCommanderApplication,
  IMidwayContext,
  ICommanderConfigurationOptions
> {
  public declare app: IMidwayCommanderApplication;
  protected frameworkLoggerName = 'commanderLogger';
  private program: Command;
  private isCommandsLoaded = false;

  configure(
    _options: ICommanderConfigurationOptions
  ): ICommanderConfigurationOptions {
    void _options;
    return this.configService.getConfiguration('commander');
  }

  async applicationInitialize(_options: IMidwayBootstrapOptions) {
    void _options;
    this.app = {} as IMidwayCommanderApplication;
    this.program = new Command();
    this.program.exitOverride();
  }

  public async run(): Promise<void> {
    this.loadCommands();
    try {
      await this.program.parseAsync(process.argv);
    } catch (error) {
      void error;
    }
  }

  public async runCommand(...args: string[]) {
    this.loadCommands();
    return this.program.parseAsync(args, { from: 'user' });
  }

  private loadCommands() {
    if (this.isCommandsLoaded) {
      return;
    }
    const modules = DecoratorManager.listModule(CLI_COMMAND_KEY);
    for (const module of modules) {
      const metadata: CliCommandOptions = MetadataManager.getMetadata(
        CLI_COMMAND_KEY,
        module
      );

      const cmd = this.program.command(metadata.name);
      if (metadata.arguments) {
        cmd.arguments(metadata.arguments);
      }
      if (metadata.description) {
        cmd.description(metadata.description, metadata.argsDescription);
      }
      if (metadata.aliases) {
        metadata.aliases.forEach(alias => cmd.alias(alias));
      }

      const optionMetadataList: Array<{
        propertyKey: string;
        options: CliOptionOptions;
      }> = MetadataManager.getMetadata(CLI_OPTION_KEY, module) || [];

      for (const optMeta of optionMetadataList) {
        const opt = optMeta.options;
        let parser;
        if (optMeta.propertyKey) {
          parser = module.prototype[optMeta.propertyKey];
        }

        if (opt.required) {
          if (parser) {
            cmd.requiredOption(
              opt.flags,
              opt.description,
              parser,
              opt.defaultValue
            );
          } else {
            cmd.requiredOption(opt.flags, opt.description, opt.defaultValue);
          }
        } else {
          if (parser) {
            cmd.option(opt.flags, opt.description, parser, opt.defaultValue);
          } else {
            cmd.option(opt.flags, opt.description, opt.defaultValue);
          }
        }
      }

      cmd.action(async (...args: any[]) => {
        const commandInstance = (await this.applicationContext.getAsync(
          module
        )) as CommandRunner;
        const commandObj = args[args.length - 1];

        const actualArgs = args.slice(0, -2);
        const actualOptions = commandObj.opts();

        if (commandInstance.run) {
          await commandInstance.run(actualArgs, actualOptions);
        }
      });
    }
    this.isCommandsLoaded = true;
  }
}
