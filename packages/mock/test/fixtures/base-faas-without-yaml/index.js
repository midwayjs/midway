const { BootstrapStarter } = require('../../../../../packages-serverless/midway-fc-starter');

const starter = new BootstrapStarter();
module.exports = starter.start({
  appDir: __dirname,
  initializeMethodName: 'initializer',
});
