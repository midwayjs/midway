import { RuntimeEngine, Runtime } from '@midwayjs/runtime-engine';
import { resolve } from 'path';
import * as compose from 'koa-compose';
import querystring = require('querystring');

const { start } = require('egg');

export = (engine: RuntimeEngine) => {
  let eggApp;
  let proc;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime: Runtime) {
      let framework = '';
      const baseDir = runtime.getPropertyParser().getEntryDir();
      // 从packagejson中获取egg框架
      const packageJSON = require(resolve(baseDir, 'package.json'));
      framework = packageJSON.egg && packageJSON.egg.framework;
      const localFrameWorkPath = resolve(__dirname, '../framework');
      require(localFrameWorkPath).getFramework(
        process.env.EGG_FRAMEWORK_DIR ||
          (framework && resolve(baseDir, 'node_modules', framework))
      );
      eggApp = await start({
        baseDir,
        framework: localFrameWorkPath,
        mode: 'single',
        runtime,
      });
      const fn = compose(eggApp.middleware);
      proc = ctx => {
        return eggApp.handleRequest(ctx, fn);
      };
    },
    async beforeClose() {
      await eggApp.close();
      eggApp = null;
    },
    async defaultInvokeHandler(context) {
      const { res } = context;
      const request = makeRequest(context);
      const eggContext = eggApp.createAnonymousContext(request);

      await proc(eggContext);

      res.statusCode = eggContext.status;
      res.body = eggContext.body;
      res.headers = eggContext.res.getHeaders();
      context.ectx = eggContext;
    },
  });
};

function makeRequest(fctx) {
  const { req } = fctx;
  const queryStr = querystring.stringify(req.query);
  return {
    fctx,
    headers: {
      ...req.headers,
      host: req.headers['x-real-host'],
    },
    body: req.body,
    query: req.query,
    querystring: queryStr,
    host: req.headers['x-real-host'],
    hostname: req.headers['x-real-host'],
    method: req.method,
    url: queryStr ? req.path + '?' + queryStr : req.path,
    path: req.path,
    socket: {
      remoteAddress: req.headers['x-remote-ip'],
      remotePort: 7001,
    },
  };
}
