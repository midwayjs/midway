const { FaaSStarter } = require('@midwayjs/faas');

let starter;

exports.initialize = async ({ config } = {}) => {
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
};

exports.handler = async (...args) => {
  return starter.handleInvokeWrapper('index.handler')(...args);
};
