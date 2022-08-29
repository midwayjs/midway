export const bull = {
  defaultQueueOptions: {
    prefix: 'midway-task',
  },
  contextLoggerApplyLogger: 'bullLog',
  contextLoggerFormat: info => {
    const { jobId, triggerName } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${triggerName}] ${info.message}`;
  },
};

export const midwayLogger = {
  clients: {
    bullLog: {
      fileLogName: 'midway-bull.log',
      disableConsole: true,
    },
  },
};
