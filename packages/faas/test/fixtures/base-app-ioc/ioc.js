const { join } = require('path');
module.exports = options => {
  return {
    loadDir: [join(options.appDir, 'proxy')],
  };
};
