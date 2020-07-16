const { resolve } = require('path');
const compose = require('koa-compose');
const querystring = require('querystring');
const { EventEmitter } = require('events');
const { start } = require('egg');

module.exports = engine => {
  let eggApp;
  let proc;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      let framework = '';
      const baseDir = runtime.getPropertyParser().getEntryDir();
      // 从 packagejson 中获取 egg 框架
      const packageJSON = require(resolve(baseDir, 'package.json'));
      framework = packageJSON.egg && packageJSON.egg.framework;
      const localFrameWorkPath = resolve(__dirname, 'framework');
      require(localFrameWorkPath).getFramework(
        process.env.EGG_FRAMEWORK_DIR ||
          (framework && resolve(baseDir, 'node_modules', framework))
      );
      eggApp = await start({
        baseDir,
        framework: localFrameWorkPath,
        ignoreWarning: true,
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
    beforeInvoke(context) {
      const request = makeRequest(context);
      const eggContext = eggApp.createAnonymousContext(request);
      context.ectx = eggContext;
      context.eggRequest = request;
    },
    async defaultInvokeHandler(context) {
      const result = proc(context.ectx);
      const { req } = context;
      const request = context.eggRequest;
      // egg request的body是通过koa-bodyParse进行解析的，其依赖data和end事件
      if (req.rawBody) {
        request.emit('data', Buffer.from(req.rawBody));
      }
      request.emit('end');
      await result;
    },
    afterInvoke(err, result, context) {
      const { res, ectx } = context;
      res.statusCode = ectx.status;
      res.body = ectx.body;
      res.headers = ectx.res.getHeaders();
      context.ectx = ectx;
    },
  });
};

function formatReqHeaders(headers) {
  const realHost = headers['X-Real-Host'] || headers['x-real-host'];
  let host = realHost || headers.host || headers.Host;
  if (Array.isArray(host)) {
    host = host[0];
  }
  headers.host = headers.Host = host;
  return headers;
}

function makeRequest(fctx) {
  const { req } = fctx;
  const queryStr = querystring.stringify(req.query);
  const request = new EventEmitter();
  const headers = formatReqHeaders(req.headers);
  Object.assign(request, {
    fctx,
    headers,
    body: req.body, // 并没什么用
    query: req.query,
    querystring: queryStr,
    host: headers.host,
    hostname: headers.host,
    method: req.method,
    url: queryStr ? req.path + '?' + queryStr : req.path,
    path: req.path,
    socket: {
      remoteAddress: headers['x-remote-ip'],
      remotePort: 7001,
    },
  });
  return request;
}
