const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('/Users/soar.gy/project/faas/github/midway/packages/serverless-fc-starter/dist/index.js');

const picomatch = require('picomatch');
const layers = [];


let starter;
let runtime;
let inited = false;


const initializeMethod = async (initializeContext = {}) => {
  
  runtime = await start({
    layers: layers,
    getHandler: getHandler
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime, middleware: [] });
  
  
  await starter.start();
   inited = true; 
  
};

const getHandler = (hanlderName) => {
  
    if (hanlderName === 'handler') {
      return  starter.handleInvokeWrapper('http.handler'); 
    }
  
    if (hanlderName === 'xxx') {
      return  starter.handleInvokeWrapper('http.xxx'); 
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

exports.xxx = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  

  const handler = getHandler('xxx');
  return runtime.asyncEvent(handler)(...args);
});

