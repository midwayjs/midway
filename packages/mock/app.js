const { createApp, close, processArgsParser } = require('./dist');
const { join } = require('path');

(async () => {
  process.env.MIDWAY_TS_MODE = 'false';
  const args = processArgsParser(process.argv);
  if (args.port) {
    process.env.MIDWAY_HTTP_PORT = args.port;
  }

  process.once('SIGINT', onSignal);
  // kill(3) Ctrl-\
  process.once('SIGQUIT', onSignal);
  // kill(15) default
  process.once('SIGTERM', onSignal);

  let app = undefined;
  app = await createApp({
    appDir: process.cwd(),
    baseDir: join(process.cwd(), 'dist'),
    ...args,
  });

  process.send({
    title: 'server-ready',
    port: process.env.MIDWAY_HTTP_PORT,
    ssl: args.ssl,
  });

  function onSignal() {
    close(app).then(() => {
      process.exit(0);
    });
  }
})();
