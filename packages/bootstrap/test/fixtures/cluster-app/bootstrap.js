const { ClusterManager, Bootstrap, setupStickyMaster } = require('../../../src');
const http = require('http');

const clusterManager = new ClusterManager({
  exec: __filename,
  count: 2,
  sticky: true,
});

if (clusterManager.isPrimary()) {
  const httpServer = http.createServer();
  setupStickyMaster(httpServer);

  clusterManager.start().then(() => {
    httpServer.listen(8080);
    console.log('main process is ok');
    process.send('ready');
  });
} else {
  Bootstrap
    .run()
    .then(() => {
      console.log('child is ready');
    });
}
