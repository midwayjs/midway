const http = require('http');

console.log('---in worker--');

const server = http.createServer((req, res) => {
  if (req.url === '/error') {
    // throw new Error('trigger error');
    console.log('got error');
    process.exit(1);
  }
  res.writeHead(200);
  res.end('hello world');
}).listen(8000);

process.on('SIGINT', () => {
  server.close();
});
