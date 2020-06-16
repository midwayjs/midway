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
  
  return runtime.asyncEvent(starter.handleInvokeWrapper('render.handler'))(...args);
  
});
