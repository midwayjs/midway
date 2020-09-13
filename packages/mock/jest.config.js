const path = require('path');

module.exports = require('../../jest.config')({
  setupFilesAfterEnv: [path.join(__dirname, 'test/.setup.js')]
});
