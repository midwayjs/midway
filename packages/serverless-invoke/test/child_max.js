const { send } = require('../dist/utils');
setTimeout(() => {
  send('testmax', new Array(10000).fill('test'));
  process.exit();
}, 300);
