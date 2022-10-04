import {
  ALL,
  App,
  Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import {
  ConfigureOptions,
  Environment,
  FileSystemLoader,
  ILoader,
  runtime,
  TemplateCallback,
} from 'nunjucks';
import { RenderOptions } from '@midwayjs/view';

class MidwayNunjucksEnvironment extends Environment {
  constructor(
    fileLoader?: ILoader | ILoader[] | null,
    config?: ConfigureOptions
  ) {
    super(fileLoader, config);

    // http://disse.cting.org/2016/08/02/2016-08-02-sandbox-break-out-nunjucks-template-engine
    const originMemberLookup = runtime.memberLookup;
    runtime.memberLookup = function (...args: unknown[]) {
      const val = args[1];
      if (val === 'prototype' || val === 'constructor') return null;
      return originMemberLookup(...args);
    };
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class NunjucksEnvironment {
  protected nunjucksEnvironment: Environment;

  @App()
  protected app;

  @Config(ALL)
  protected globalConfig;

  @Init()
  protected async init() {
    const coreLogger = this.app.getCoreLogger();
    const viewPaths = this.globalConfig.view.root;
    coreLogger.info(
      '[midway:view-nunjucks] loading templates from %j',
      viewPaths
    );

    const config = this.globalConfig['nunjucks'];
    config.noCache = !config.cache;
    delete config.cache;

    const nunjucksConfig = {
      noCache: config.noCache,
      throwOnUndefined: config.throwOnUndefined,
      trimBlocks: config.trimBlocks,
      lstripBlocks: config.lstripBlocks,
      tags: config.tags,
      autoescape: config.autoescape,
    };

    const fileLoader = new FileSystemLoader(this.globalConfig.view.root, {
      noCache: nunjucksConfig.noCache,
    });
    this.nunjucksEnvironment = new MidwayNunjucksEnvironment(
      fileLoader,
      nunjucksConfig
    );
  }

  render(
    name: string,
    context?: Record<string, any>,
    callback?: TemplateCallback<string>
  ) {
    return this.nunjucksEnvironment.render(name, context, callback);
  }

  renderString(
    tpl: string,
    context?: Record<string, any>,
    options?: RenderOptions,
    callback?: TemplateCallback<string>
  ) {
    return this.nunjucksEnvironment.renderString(
      tpl,
      context,
      options,
      callback
    );
  }

  addFilter(name: string, callback: (...args) => string) {
    return this.nunjucksEnvironment.addFilter(name, callback);
  }

  getFilter(name: string) {
    return this.nunjucksEnvironment.getFilter(name);
  }

  hasExtension(name: string): boolean {
    return this.nunjucksEnvironment.hasExtension(name);
  }

  addGlobal(name: string, value) {
    return this.nunjucksEnvironment.addGlobal(name, value);
  }
}
