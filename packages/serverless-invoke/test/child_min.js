const { send } = require('../dist/utils');
setTimeout(() => {
  send('testmin', { name: 123 });
  process.exit();
}, 300);
