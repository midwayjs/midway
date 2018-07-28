'use strict';

module.exports = () => {
  const exports = {};

  exports.security = {
    csrf: {
      ignoreJSON: false,
    },
  };

  return exports;
};
