const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');

const { registerFunctionToIocByConfig } = require('./registerFunction.js');
const { join } = require('path');

const picomatch = require('picomatch');


let starter;
let runtime;
let inited = false;


const initializeMethod = async (initializeContext = {}) => {
  
  runtime = await start({
    layers: [],
    getHandler: getHandler
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime, middleware: [] });
  
  
  registerFunctionToIocByConfig({
  "functionList": [
    {
      "functionName": "fp",
      "functionHandler": "fp.handler",
      "functionFilePath": "fun-index.js"
    }
  ]
}, {
    baseDir: join(__dirname, 'dist'),
    context: starter.loader.getApplicationContext()
  });
  
  await starter.start();
   inited = true; 
  
};

const getHandler = (hanlderName) => {
  
    if (hanlderName === 'handler') {
      return  async (ctx) => {
        const allHandlers = [
  {
    "handler": "normal1.handler",
    "router": "/normal/1",
    "pureRouter": "/normal/1",
    "level": 2
  },
  {
    "handler": "normal2.handler",
    "router": "/normal/2",
    "pureRouter": "/normal/2",
    "level": 2
  }
];
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
        return '<h1>404 Page Not Found</h1><hr />Request path: ' + ctxPath + '<hr /><div style="font-size: 12px;color: #999999;">Powered by <a href="https://github.com/midwayjs/midway">Midway Serverless</a></div>';
      }; 
    }
  
}




exports.initializer = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod(...args);
  }
});


exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  

  const handler = getHandler('handler');
  return runtime.asyncEvent(handler)(...args);
});

