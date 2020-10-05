const { Bootstrap } = require('@midwayjs/bootstrap');

process.on('message', (data) => {
  if (data.action === 'collect_mem') {
    process.send({ action: 'collect_mem_result', data: process.memoryUsage()});
  } else if(data.action === 'gc') {
    console.log('invoke global.gc');
    global.gc();
  }
});

Bootstrap.load(
  new (require('@midwayjs/web').Framework)().configure({
    port: 7001,
  })
).run();
