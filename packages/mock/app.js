const { createApp, close } = require('./dist');
const { join } = require('path');

(async () => {
  function onSignal() {
    close(app).then(() => {
      process.exit(0);
    });
  }

  if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let isShuttingDown = false;
    rl.on('SIGINT', async () => {
      rl.close();
      if (isShuttingDown) {
        console.error('Forcing shutdown, bye.');
        process.exit();
      } else {
        isShuttingDown = true;
        rl.close();
        process.emit('SIGINT');
      }
    });
  }
  process.env.MIDWAY_TS_MODE = 'false';
  // 查找 process.argv 中的 --port 参数
  const portIndex = process.argv.findIndex((item) => item === '--port');
  if (portIndex !== -1) {
    process.env.MIDWAY_HTTP_PORT = process.argv[portIndex + 1];
  }

  process.once('SIGINT', onSignal);
  // kill(3) Ctrl-\
  process.once('SIGQUIT', onSignal);
  // kill(15) default
  process.once('SIGTERM', onSignal);

  const app = await createApp({
    appDir: process.cwd(),
    baseDir: join(process.cwd(), 'dist'),
  });

  process.send({
    title: 'server-ready',
    port: process.env.MIDWAY_HTTP_PORT,
  });
})();
