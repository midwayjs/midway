const { invoke } = require('../');
const { join } = require('path');
invoke({
  functionDir: join(__dirname, 'fixtures/baseApp'),
  functionName: 'http',
  data: [{ name: 'params' }],
  debug: '9229'
}).then(result => {
  console.log('result', result);
});