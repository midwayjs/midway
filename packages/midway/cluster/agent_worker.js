'use strict';

/**
 * agent worker is child_process forked by master.
 *
 * agent worker only exit in two cases:
 *  - receive signal SIGTERM, exit code 0 (exit gracefully)
 *  - receive disconnect event, exit code 110 (maybe master exit in accident)
 */

const debug = require('debug')('egg-cluster');
const gracefulExit = require('graceful-process');
const ConsoleLogger = require('egg-logger').EggConsoleLogger;
const utils = require('./utils');
const consoleLogger = new ConsoleLogger({ level: process.env.EGG_AGENT_WORKER_LOGGER_LEVEL });

// $ node agent_worker.js options
const options = JSON.parse(process.argv[2]);
// if use typescript, ugly...
utils.isNeedCompile(options);

const framework = require(options.framework);
let agent;
if(framework.getAgent) {
  agent = framework.getAgent(options);
} else {
  const Agent = framework.Agent;
  debug('new Agent with options %j', options);
  agent = new Agent(options);
}

function startErrorHandler(err) {
  consoleLogger.error(err);
  consoleLogger.error('[agent_worker] start error, exiting with code:1');
  process.exit(1);
}

agent.ready(() => {
  agent.removeListener('error', startErrorHandler);
  process.send({ action: 'agent-start', to: 'master' });
});

// exit if agent start error
agent.once('error', startErrorHandler);

gracefulExit({
  logger: consoleLogger,
  label: 'agent_worker',
  beforeExit: () => agent.close(),
});
