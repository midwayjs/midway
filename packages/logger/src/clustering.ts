const debug = require('util').debuglog('midways:logger:clustering');
const LoggingEvent = require('./LoggingEvent');
const configuration = require('./configuration');

let disabled = false;
let cluster = null;
try {
  cluster = require('cluster');
} catch (e) {
  debug('cluster module not present');
  disabled = true;
}

const listeners = [];

let pm2 = false;
let pm2InstanceVar = 'NODE_APP_INSTANCE';

const isPM2Master = () => pm2 && process.env[pm2InstanceVar] === '0';
const isMaster = () => disabled || cluster.isMaster || isPM2Master();

const sendToListeners = logEvent => {
  listeners.forEach(l => l(logEvent));
};

// in a multi-process node environment, worker loggers will use
// process.send
const receiver = (worker, message) => {
  // prior to node v6, the worker parameter was not passed (args were message, handle)
  debug('cluster message received from worker ', worker, ': ', message);
  if (worker.topic && worker.data) {
    message = worker;
    worker = undefined;
  }
  if (message && message.topic && message.topic === 'log4js:message') {
    debug('received message: ', message.data);
    const logEvent = LoggingEvent.deserialise(message.data);
    sendToListeners(logEvent);
  }
};

if (!disabled) {
  configuration.addListener(config => {
    // clear out the listeners, because configure has been called.
    listeners.length = 0;

    ({
      pm2,
      disableClustering: disabled,
      pm2InstanceVar = 'NODE_APP_INSTANCE',
    } = config);

    debug(`clustering disabled ? ${disabled}`);
    debug(`cluster.isMaster ? ${cluster && cluster.isMaster}`);
    debug(`pm2 enabled ? ${pm2}`);
    debug(`pm2InstanceVar = ${pm2InstanceVar}`);
    debug(`process.env[${pm2InstanceVar}] = ${process.env[pm2InstanceVar]}`);

    // just in case configure is called after shutdown
    if (pm2) {
      process.removeListener('message', receiver);
    }
    if (cluster && cluster.removeListener) {
      cluster.removeListener('message', receiver);
    }

    if (disabled || config.disableClustering) {
      debug('Not listening for cluster messages, because clustering disabled.');
    } else if (isPM2Master()) {
      // PM2 cluster support
      // PM2 runs everything as workers - install pm2-intercom for this to work.
      // we only want one of the app instances to write logs
      debug('listening for PM2 broadcast messages');
      process.on('message', receiver);
    } else if (cluster.isMaster) {
      debug('listening for cluster messages');
      cluster.on('message', receiver);
    } else {
      debug('not listening for messages, because we are not a master process');
    }
  });
}

module.exports = {
  onlyOnMaster: (fn, notMaster) => (isMaster() ? fn() : notMaster),
  isMaster,
  send: msg => {
    if (isMaster()) {
      sendToListeners(msg);
    } else {
      if (!pm2) {
        msg.cluster = {
          workerId: cluster.worker.id,
          worker: process.pid,
        };
      }
      process.send({ topic: 'midway:logger:message', data: msg.serialise() });
    }
  },
  onMessage: listener => {
    listeners.push(listener);
  },
};
