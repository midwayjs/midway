import { App, Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import * as assert from 'assert';
import * as path from 'path';
import { constants, existsSync, promises } from 'fs';
import { IViewEngine } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViewManager extends Map {
  @App()
  protected app;

  @Config('view')
  protected viewConfig;

  protected config;

  protected extMap = new Map();
  protected fileMap = new Map();
  protected localsMap = {};

  @Init()
  protected init() {
    this.config = this.viewConfig;
    const rootSet: Set<string> = new Set(Object.values(this.config.rootDir));
    if (this.config.root) {
      this.config.root.split(/\s*,\s*/g).forEach(filepath => {
        rootSet.add(filepath);
      });
    }

    this.config.root = Array.from(rootSet.values()).filter(filepath => {
      return existsSync(filepath);
    });
    this.extMap = new Map();
    this.fileMap = new Map();
    for (const ext of Object.keys(this.config.mapping)) {
      this.extMap.set(ext, this.config.mapping[ext]);
    }
  }

  /**
   * This method can register view engine.
   *
   * You can define a view engine class contains two method, `render` and `renderString`
   *
   * ```js
   * class View {
   *   render() {}
   *   renderString() {}
   * }
   * ```
   * @param {String} name - the name of view engine
   * @param {Object} viewEngine - the class of view engine
   */
  public use(name: string, viewEngine: new (...args) => IViewEngine): void {
    assert(name, 'name is required');
    assert(!this.has(name), `${name} has been registered`);

    assert(viewEngine, 'viewEngine is required');
    assert(
      viewEngine.prototype.render,
      'viewEngine should implement `render` method'
    );
    assert(
      viewEngine.prototype.renderString,
      'viewEngine should implement `renderString` method'
    );

    this.set(name, viewEngine);
  }

  /**
   * Resolve the path based on the given name,
   * if the name is `user.html` and root is `view` (by default),
   * it will return `view/user.html`
   * @param {String} name - the given path name, it's relative to config.root
   * @return {String} filename - the full path
   */
  public async resolve(name: string): Promise<string> {
    const config = this.config;

    // check cache
    let filename = this.fileMap.get(name);
    if (config.cache && filename) return filename;

    // try find it with default extension
    filename = await resolvePath(
      [name, name + config.defaultExtension],
      config.root
    );
    assert(filename, `Can't find ${name} from ${config.root.join(',')}`);

    // set cache
    this.fileMap.set(name, filename);
    return filename;
  }

  /**
   * add a global data for all views
   * @param key
   * @param localValue
   */
  public addLocals(key, localValue) {
    this.localsMap[key] = localValue;
  }

  /**
   * get global locals data
   */
  public getLocals() {
    return this.localsMap;
  }

  public findEngine(ext: string): string {
    return this.extMap.get(ext);
  }
}

async function resolvePath(names, root) {
  for (const name of names) {
    for (const dir of root) {
      const filename = path.join(dir, name);
      try {
        await promises.access(filename, constants.R_OK);
        if (inpath(dir, filename)) {
          return filename;
        }
      } catch (err) {
        // ignore
      }
    }
  }
}

function inpath(parent, sub) {
  return sub.indexOf(parent) > -1;
}
