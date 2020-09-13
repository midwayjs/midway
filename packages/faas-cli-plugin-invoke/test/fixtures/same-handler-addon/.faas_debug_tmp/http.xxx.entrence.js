const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('/Users/soar.gy/project/faas/github/midway/packages/serverless-fc-starter/dist/index.js');
const picomatch = require('picomatch');


let starter;
let runtime;
let inited = false;
console.log('require----');

const initializeMethod = async (initializeContext = {}) => {
  
  runtime = await start({
    layers: [],
    getHandler: getHandler
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime });
  
  starter.loader.loadDirectory({ baseDir: '/Users/soar.gy/project/faas/github/midway/packages/faas-cli-plugin-invoke/test/fixtures/same-handler-addon/.faas_debug_tmp/faas_tmp_out/src'});
  await starter.start();
   inited = true; 
};

const getHandler = (hanlderName) => {
  
    if (hanlderName === 'xxx') {
      return  starter.handleInvokeWrapper('http.xxx'); 
    }
  
}


exports.initializer = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod(...args);
  }
});


exports.xxx = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }

  const handler = getHandler('xxx');
  return runtime.asyncEvent(handler)(...args);
});
