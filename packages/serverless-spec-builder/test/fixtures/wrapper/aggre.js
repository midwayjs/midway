const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('testStarter');


let starter;
let runtime;
let inited = false;

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: []
  });
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async ({config} = {}) => {
  await initializeMethod(config);
});


exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  
  const allHandlers = [{"handler":"index.handler","path":"/api/test","level":2},{"handler":"render.handler","path":"/","level":1}];
  return runtime.asyncEvent(async (ctx) => {
    let handler = null;
    let ctxPath = ctx && ctx.path || '';
    if (ctxPath) {
      handler = allHandlers.find(handler => {
        return ctxPath.indexOf(handler.path) === 0;
      });
    }

    if (!handler) {
      handler = allHandlers[allHandlers.length - 1];
    }

    if (handler) {
      return starter.handleInvokeWrapper(handler.handler)(ctx);
    }
    return 'unhandler path: ' + ctxPath + '; handlerInfo: ' + JSON.stringify(allHandlers);
  })(...args);
  
});
