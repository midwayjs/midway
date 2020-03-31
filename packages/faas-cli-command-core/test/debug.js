'use strict';
const core = require("../dist");
core.debug({
  debugFile: __filename,
  callback: () => {
    setTimeout(() => {
      process.exit();
    }, 10000);
  }
});
