const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('/Users/soar.gy/project/faas/github/midway/packages/serverless-scf-starter/dist/index.js');


let starter;
let runtime;
let inited = false;

const initializeMethod = async (initializeContext = {}) => {
  runtime = await start({
    layers: []
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext, applicationAdapter: runtime });
  
  starter.loader.loadDirectory({ baseDir: '/Users/soar.gy/project/faas/github/midway/packages/gateway-common-http/test/fixtures/ice-demo-repo/.faas_debug_tmp/faas_tmp_out/src'});
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
  
  return runtime.asyncEvent(starter.handleInvokeWrapper('test3.handler'))(...args);
  
});
