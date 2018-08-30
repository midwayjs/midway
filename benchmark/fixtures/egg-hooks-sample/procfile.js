// you can use this file to deploy by pandora
// please use 'npm i pandora --save' first

'use strict';

const path = require('path');

module.exports = pandora => {

  /**
   * default is fork mode
   */
  pandora
    .fork('egg-hooks-sample', path.join(__dirname, './server.js'));

  /**
   * you can use cluster mode to start application
   */
  // pandora
  //   .cluster('./cluster.js');

  /**
   * you can create another process here
   */
  // pandora
  //   .process('background')
  //   .argv(['--expose-gc']);

  /**
   * more features please visit our document.
   * https://github.com/midwayjs/pandora/
   */

};
