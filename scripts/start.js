const heapdump = require('heapdump');
const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');

Bootstrap.load(
  new (require('@midwayjs/web').Framework)().configure({
    port: 7001,
  })
).run();

function showMemory() {
  heapdump.writeSnapshot(join(__dirname, 'midway_benchmark.heapsnapshot'));
}

setInterval(showMemory, 60000);
