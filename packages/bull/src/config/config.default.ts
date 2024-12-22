export const bull = {
  defaultQueueOptions: {
    prefix: '{midway-bull}',
    defaultJobOptions: {
      removeOnComplete: 3,
      removeOnFail: 10,
    },
  },
  defaultConcurrency: 1,
  clearRepeatJobWhenStart: true,
};

export const midwayLogger = {
  clients: {
    bullLogger: {
      fileLogName: 'midway-bull.log',
      contextFormat: info => {
        const { jobId, from } = info.ctx;
        return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
      },
    },
  },
};
