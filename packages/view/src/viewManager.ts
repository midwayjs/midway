import {
  App,
  Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as assert from 'assert';
import * as path from 'path';
import { constants, existsSync, promises } from 'fs';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViewManager extends Map {
  @App()
  app;

  @Config('view')
  viewConfig;

  config;

  extMap = new Map();
  fileMap = new Map();

  @Init()
  init() {
    this.config = this.viewConfig;
    this.config.root = this.config.root
      .split(/\s*,\s*/g)
      .filter(filepath => existsSync(filepath));
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
  use(name: string, viewEngine): void {
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
   * if the name is `user.html` and root is `app/view` (by default),
   * it will return `app/view/user.html`
   * @param {String} name - the given path name, it's relative to config.root
   * @return {String} filename - the full path
   */
  async resolve(name: string): Promise<string> {
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
