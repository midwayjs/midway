const { ClusterBootstrap } = require('../../../src');
ClusterBootstrap
  .configure({
    sticky: true,
    count: 2,
  })
  .run()
  .then(() => {
    process.send('ready');
  });
