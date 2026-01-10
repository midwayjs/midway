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
  IMidwayCommanderContext,
} from './interface';
import {
  CLI_COMMAND_KEY,
  CLI_OPTION_KEY,
  CliCommandOptions,
  CliOptionOptions,
} from './decorator';
import { Command } from 'commander';
import { Readable } from 'stream';

@Framework()
export class MidwayCommanderFramework extends BaseFramework<
  IMidwayCommanderApplication,
  IMidwayCommanderContext,
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

  /**
   * 适用于测试或编程式触发命令的场景。
   *
   * 与 run() 不同，这里不会读取 process.argv，而是解析传入的 args，
   * 从而避免测试环境（Jest/Node）对命令行参数的污染。
   */
  public async runCommand(...args: string[]) {
    this.loadCommands();
    return this.program.parseAsync(args, { from: 'user' });
  }

  private async outputResult(result: unknown): Promise<void> {
    if (result == null) {
      return;
    }

    if (Buffer.isBuffer(result)) {
      process.stdout.write(result);
      return;
    }

    if (typeof result === 'string') {
      process.stdout.write(result);
      return;
    }

    if (this.isReadableLike(result)) {
      await new Promise<void>((resolve, reject) => {
        result.on('error', reject);
        result.on('end', resolve);
        result.pipe(process.stdout, { end: false });
      });
      return;
    }

    if (this.isAsyncIterableLike(result)) {
      for await (const chunk of result) {
        this.outputChunk(chunk);
      }
      return;
    }

    this.outputChunk(result);
  }

  private outputChunk(chunk: unknown) {
    if (chunk == null) {
      return;
    }

    if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
      process.stdout.write(chunk);
      return;
    }

    process.stdout.write(JSON.stringify(chunk));
  }

  private isReadableLike(value: unknown): value is NodeJS.ReadableStream {
    return (
      value instanceof Readable ||
      (!!value &&
        typeof (value as any).pipe === 'function' &&
        typeof (value as any).on === 'function')
    );
  }

  private isAsyncIterableLike(value: unknown): value is AsyncIterable<unknown> {
    return (
      !!value && typeof (value as any)[Symbol.asyncIterator] === 'function'
    );
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
        const commandObj = args[args.length - 1];
        const actualArgs = args.slice(0, -2);
        const actualOptions = commandObj.opts();
        const ctx = this.app.createAnonymousContext({
          command: commandObj,
          args: actualArgs,
          options: actualOptions,
          commandName: metadata.name,
        }) as IMidwayCommanderContext;
        ctx.command = commandObj;
        ctx.args = actualArgs;
        ctx.options = actualOptions;
        ctx.commandName = metadata.name;
        const fn = await this.applyMiddleware(async ctx => {
          const commandInstance = (await ctx.requestContext.getAsync(
            module
          )) as CommandRunner;
          if (commandInstance.run) {
            return await commandInstance.run(actualArgs, actualOptions);
          }
        });
        const result = await fn(ctx);
        await this.outputResult(result);
      });
    }
    this.isCommandsLoaded = true;
  }
}
