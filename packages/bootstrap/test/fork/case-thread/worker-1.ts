const http = require('http');

console.log('---in worker--');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);

process.on('SIGINT', () => {
  server.close();
});
