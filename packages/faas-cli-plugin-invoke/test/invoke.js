const { invoke } = require('../');
const { join } = require('path');
invoke({
  functionDir: join(__dirname, 'fixtures/baseApp'),
  functionName: 'http',
  data: [{ name: 'params' }],
  verbose: true
}).then(result => {
  console.log('result', result);
});