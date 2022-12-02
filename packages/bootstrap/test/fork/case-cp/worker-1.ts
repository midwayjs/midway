const http = require('http');
import { ChildProcessEventBus } from '@midwayjs/event-bus';
console.log('---in worker--');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('hello world');
}).listen(8000);

const bus = new ChildProcessEventBus();
bus.start();

process.on('SIGINT', () => {
  server.close();
});
