const { FaaSStarter } = require('@midwayjs/faas');

let starter;

exports.init = async ({ config }) => {
  starter = new FaaSStarter({
    config
  });
  await starter.start();
};

exports.handler = starter.handleInvokeWrapper;
