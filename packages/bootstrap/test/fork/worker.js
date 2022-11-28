const cluster = require('cluster');

if (cluster['isWorker']) {
  console.log('---in worker--');
} else {
  console.log('---in master--');
}
