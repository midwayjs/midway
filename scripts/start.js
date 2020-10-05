const heapdump = require('heapdump');
const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');

function showMemory(idx) {
  heapdump.writeSnapshot(join(__dirname, `midway_benchmark_${idx}.heapsnapshot`));
}
let idx = 1;
process.on('message', (data) => {
  if (data.action === 'collect_mem') {
    process.send({ action: 'collect_mem_result', data: process.memoryUsage()});
  } else if(data.action === 'gc') {
    console.log('invoke global.gc');
    global.gc();
  } else if(data.action === 'heapdump') {
    showMemory(idx++);
  }
});

Bootstrap.load(
  new (require('@midwayjs/web').Framework)().configure({
    port: 7001,
  })
).run();
