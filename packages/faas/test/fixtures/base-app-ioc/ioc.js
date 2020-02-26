const { join } = require('path');
module.exports = options => {
  return {
    loadDir: [
      options.baseDir,
      join(options.appDir, 'proxy')
    ],
  };
};
