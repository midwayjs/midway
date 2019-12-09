import { RuntimeEngine } from '@midwayjs/runtime-engine';
import { join } from 'path';
import compose = require('koa-compose');
const { start } = require('egg');

export default (engine: RuntimeEngine) => {
  let eggApp;
  let proc;
  let framework = '';
  try {
    // 从packagejson中获取egg框架
    const packageJSON = require(join(process.env.ENTRY_DIR, 'package.json'));
    framework = packageJSON.egg.framework;
  } catch (e) {
    //
  }

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      eggApp = await start({
        baseDir: process.env.ENTRY_DIR,
        framework,
        mode: 'single',
        runtime,
      });
      const fn = compose(eggApp.middleware);
      proc = (ctx) => {
        return eggApp.handleRequest(ctx, fn);
      };
    },
    async beforeClose() {
      await eggApp.close();
      eggApp = null;
    },
    async defaultInvokeHandler(context) {
      const { req, res } = context;
      const eggContext = eggApp.createContext(req, res);

      const fakeContext = new Proxy(context, {
        get(target, p) {
          if (p in target) {
            return target[p];
          }
          return eggContext[p];
        },
      });

      return proc(fakeContext);
    },
  });
};
