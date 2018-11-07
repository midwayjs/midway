const wrapped = require('egg-schedule/agent');

module.exports = (agent) => {
  if (!agent.loggers.scheduleLogger) {
    agent.loggers.scheduleLogger = {
      unredirect: () => {},
      warn: console.warn,
    };
  }
  wrapped(agent);
};
