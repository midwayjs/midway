const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('testStarter');

const { registerFunctionToIocByConfig } = require('./registerFunction.js');
const { join } = require('path');

const picomatch = require('picomatch');
const layers = [];

try {
  const layer_npm_testNpm = require('test');
  layers.push(layer_npm_testNpm);
} catch(e) {
  console.error('npm layer "test" not install', e);
}

try {
  const layer_oss_remote_debug = require('remote-debug');
  layers.push(layer_oss_remote_debug);
} catch(e) {
  console.error('oss layer "remote-debug" not install', e);
}

try {
  const layer_oss_testOss = require('test');
  layers.push(layer_oss_testOss);
} catch(e) {
  console.error('oss layer "test" not install', e);
}


let starter;
let runtime;
let inited = false;


const initializeMethod = async (initializeContext = {}) => {
  
  runtime = await start({
    layers: layers,
    getHandler: getHandler
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime, middleware: [
  "test1",
  "test2"
] });
  
  
  registerFunctionToIocByConfig({
  "functionList": [
    {
      "functionName": "test",
      "functionHandler": "index.handler",
      "functionFilePath": "fun-index.js",
      "argsPath": "ctx.request.data.args"
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
    "handler": "index.handler",
    "router": "/api/test",
    "pureRouter": "/api/test",
    "level": 2
  },
  {
    "handler": "render.handler",
    "router": "/**",
    "pureRouter": "/",
    "level": 1
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




exports.initializeUserDefine = asyncWrapper(async (...args) => {
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

