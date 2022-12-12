const http = require('http');
import { ChildProcessEventBus } from '@midwayjs/event-bus';
console.log('---in worker--');
const server = http.createServer((req, res) => {
  if (req.url === '/error') {
    // throw new Error('trigger error');
    console.log('got error');
    process.exit(1);
  }
  res.writeHead(200);
  res.end('hello world');
}).listen(8000, () => {
  const bus = new ChildProcessEventBus();
  bus.start();
  bus.publish('ready', {
    topic: 'ready'
  })
});

process.on('SIGINT', () => {
  server.close();
});
