const { Bootstrap } = require('../../../src');
Bootstrap.run().then(() => {
  process.send('ready');
});
