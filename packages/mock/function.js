const { createFunctionApp, close } = require('./dist');
const { join } = require('path');

(async () => {
  process.env.MIDWAY_TS_MODE = 'false';
  // 查找 process.argv 中的 --port 参数
  const portIndex = process.argv.findIndex(item => item === '--port');
  if (portIndex !== -1) {
    process.env.MIDWAY_HTTP_PORT = process.argv[portIndex + 1];
  }

  process.once('SIGINT', onSignal);
  // kill(3) Ctrl-\
  process.once('SIGQUIT', onSignal);
  // kill(15) default
  process.once('SIGTERM', onSignal);

  const app = await createFunctionApp({
    appDir: process.cwd(),
    baseDir: join(process.cwd(), 'dist'),
  });

  process.send({
    title: 'server-ready',
    port: process.env.MIDWAY_HTTP_PORT,
  });

  function onSignal() {
    close(app).then(() => {
      process.exit(0);
    });
  }
})();
