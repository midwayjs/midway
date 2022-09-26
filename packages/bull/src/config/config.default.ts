export const bull = {
  defaultQueueOptions: {
    prefix: 'midway-task',
  },
  contextLoggerApplyLogger: 'bullLogger',
  contextLoggerFormat: info => {
    const { jobId, from } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}}] ${info.message}`;
  },
  defaultConcurrency: 1,
  clearJobWhenStart: true,
};

export const midwayLogger = {
  clients: {
    bullLogger: {
      fileLogName: 'midway-bull.log',
    },
  },
};
