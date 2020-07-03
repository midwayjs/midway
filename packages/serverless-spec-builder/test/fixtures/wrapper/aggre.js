const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('testStarter');


let starter;
let runtime;
let inited = false;

const initializeMethod = async (initializeContext = {}) => {
  runtime = await start({
    layers: []
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime });
  
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async (...args) => {
  await initializeMethod(...args);
});


exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  
  const picomatch = require('picomatch');
  const allHandlers = [{"handler":"index.handler","router":"/api/test","pureRouter":"/api/test","level":2},{"handler":"render.handler","router":"/**","pureRouter":"/","level":1}];
  return runtime.asyncEvent(async (ctx) => {
    let handler = null;
    let ctxPath = ctx && ctx.path || '';
    if (ctxPath) {
      handler = allHandlers.find(handler => {
        return picomatch.isMatch(ctxPath, handler.router)
      });
    }

    if (handler) {
      return starter.handleInvokeWrapper(handler.handler)(ctx);
    }
    ctx.status = 404;
    ctx.set('Content-Type', 'text/html');
    return '<h1>404 Page Not Found</h1><hr />Request path: ' + ctxPath + '<hr /><div style="font-size: 12px;color: #999999;">Powered by <a href="https://github.com/midwayjs/midway-faas">Midway</a></div>';
  })(...args);
  
});
