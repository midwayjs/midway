const wrapped = require('egg-schedule/agent');

module.exports = (agent) => {
  if (!agent.loggers.scheduleLogger) {
    agent.loggers.scheduleLogger = console;
    agent.loggers.scheduleLogger.unredirect = () => {};
  }
  wrapped(agent);
};
