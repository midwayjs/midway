'use strict';

const fs = require('fs');
const debug = require('debug')('midway-cluster');
const gracefulExit = require('graceful-process');
const ConsoleLogger = require('egg-logger').EggConsoleLogger;
const utils = require('./utils');

const consoleLogger = new ConsoleLogger({ level: process.env.EGG_APP_WORKER_LOGGER_LEVEL });

// $ node app_worker.js options
const options = JSON.parse(process.argv[2]);

// if use typescript, ugly...
utils.isNeedCompile(options);

const framework = require(options.framework);
let app;
if(framework.getApp) {
  app = framework.getApp(options);
} else {
  const Application = framework.Application;
  debug('new Application with options %j', options);
  app = new Application(options);
}

const clusterConfig = app.config.cluster || /* istanbul ignore next */ {};
const listenConfig = clusterConfig.listen || /* istanbul ignore next */ {};
const port = options.port = options.port || listenConfig.port;
process.send({ to: 'master', action: 'realport', data: port });
app.ready(startServer);

// exit if worker start timeout
app.once('startTimeout', startTimeoutHandler);
function startTimeoutHandler() {
  consoleLogger.error('[app_worker] start timeout, exiting with code:1');
  process.exit(1);
}

function startServer(err) {
  if (err) {
    consoleLogger.error(err);
    consoleLogger.error('[app_worker] start error, exiting with code:1');
    process.exit(1);
  }

  app.removeListener('startTimeout', startTimeoutHandler);

  let server;
  if (options.https) {
    const httpsOptions = Object.assign({}, options.https, {
      key: fs.readFileSync(options.https.key),
      cert: fs.readFileSync(options.https.cert),
    });
    server = require('https').createServer(httpsOptions, app.callback());
  } else {
    server = require('http').createServer(app.callback());
  }

  server.once('error', err => {
    consoleLogger.error('[app_worker] server got error: %s, code: %s', err.message, err.code);
    process.exit(1);
  });

  // emit `server` event in app
  app.emit('server', server);

  if (options.sticky) {
    server.listen(0, '127.0.0.1');
    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', (message, connection) => {
      if (message !== 'sticky-session:connection') {
        return;
      }

      // Emulate a connection event on the server by emitting the
      // event with the connection the master sent us.
      server.emit('connection', connection);
      connection.resume();
    });
  } else {
    if (listenConfig.path) {
      server.listen(listenConfig.path);
    } else {
      if (typeof port !== 'number') {
        consoleLogger.error('[app_worker] port should be number, but got %s(%s)', port, typeof port);
        process.exit(1);
      }
      const args = [ port ];
      if (listenConfig.hostname) args.push(listenConfig.hostname);
      debug('listen options %s', args);
      server.listen(...args);
    }
  }
}

gracefulExit({
  logger: consoleLogger,
  label: 'app_worker',
  beforeExit: () => app.close(),
});
