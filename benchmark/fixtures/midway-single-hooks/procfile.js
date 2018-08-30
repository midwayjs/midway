// you can use this file to deploy by pandora
// please use 'npm i pandora --save' first

'use strict';

module.exports = pandora => {

  /**
   * default is fork mode
   */
  pandora
    .fork('midway-single-hooks', require.resolve('midway/server'));

};
