export const bull = {
  defaultQueueOptions: {
    prefix: 'midway-task',
  },
  contextLoggerApplyLogger: 'bullLogger',
  contextLoggerFormat: info => {
    const { jobId, triggerName } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${triggerName}] ${info.message}`;
  },
  defaultConcurrency: 1,
};

export const midwayLogger = {
  clients: {
    bullLogger: {
      fileLogName: 'midway-bull.log',
    },
  },
};
