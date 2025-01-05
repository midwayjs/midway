export const bullmq = {
  prefix: '{midway-bullmq}',
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
  defaultQueueOptions: {
    defaultJobOptions: {
      removeOnComplete: 3,
      removeOnFail: 10,
    },
  },
  defaultWorkerOptions: {
    concurrency: 1,
  },
  clearRepeatJobWhenStart: true,
  contextLoggerFormat: info => {
    const { jobId, from } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
  },
};

export const midwayLogger = {
  clients: {
    bullLogger: {
      fileLogName: 'midway-bull.log',
    },
  },
};
