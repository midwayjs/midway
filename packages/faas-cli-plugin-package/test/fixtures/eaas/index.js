const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');

let runtime;
let inited = false;

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: [],
  });
  inited = true;
};

exports.initializer = asyncWrapper(async ({ config } = {}) => {
  await initializeMethod(config);
});

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }

  return runtime.asyncEvent()(...args);
});
