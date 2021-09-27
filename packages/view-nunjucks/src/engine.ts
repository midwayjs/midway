import { ALL, App, Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { Environment, FileSystemLoader, runtime } from 'nunjucks';

class MidwayNunjucksEnvironment extends Environment {
  constructor(fileLoader, config) {
    super(fileLoader, {
      noCache: config.noCache
    });

    // http://disse.cting.org/2016/08/02/2016-08-02-sandbox-break-out-nunjucks-template-engine
    const originMemberLookup = runtime.memberLookup;
    runtime.memberLookup = function(...args) {
      const val = args[1];
      if (val === 'prototype' || val === 'constructor') return null;
      return originMemberLookup(...args);
    };
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class NunjucksEnvironment {

  protected nunjucksEnvironment;

  @App()
  protected app;

  @Config(ALL)
  protected globalConfig;

  @Init()
  protected async init() {
    const coreLogger = this.app.getCoreLogger();
    const viewPaths = this.globalConfig.view.root;
    coreLogger.info('[@midwayjs/view-nunjucks] loading templates from %j', viewPaths);

    const config = this.globalConfig['nunjucks'];
    config.noCache = !config.cache;
    delete config.cache;

    const fileLoader = new FileSystemLoader(this.globalConfig.view.root);
    this.nunjucksEnvironment = new MidwayNunjucksEnvironment(fileLoader, config);
  }

  render(name, locals, cb) {
    return this.nunjucksEnvironment.render(name, locals, cb);
  }

  renderString(tpl, locals, opts, cb) {
    return this.nunjucksEnvironment.renderString(tpl, locals, opts, cb);
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
