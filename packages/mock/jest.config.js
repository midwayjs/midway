const path = require('path');

module.exports = require('../../jest.config')({
  setupFiles: [path.join(__dirname, 'test/.setup.js')]
});

