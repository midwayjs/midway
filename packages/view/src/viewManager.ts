import * as OriginViewManager from 'egg-view/lib/view_manager';
import { App, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { createMockApp } from '@midwayjs/mw-util';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViewManager {
  @App()
  app;

  innerManager;

  get extMap() {
    return this.innerManager.extMap;
  }

  get config() {
    return this.innerManager.config;
  }

  @Init()
  async init() {
    const mockApp = createMockApp(this.app);
    this.innerManager = new OriginViewManager(mockApp);
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
    return this.innerManager.use(name, viewEngine);
  }

  /**
   * Resolve the path based on the given name,
   * if the name is `user.html` and root is `app/view` (by default),
   * it will return `app/view/user.html`
   * @param {String} name - the given path name, it's relative to config.root
   * @return {String} filename - the full path
   */
  async resolve(name: string): Promise<string> {
    return this.innerManager.resolve(name);
  }

  get(key) {
    return this.innerManager.get(key);
  }
}
