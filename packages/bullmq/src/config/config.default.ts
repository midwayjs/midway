export const bullmq = {
  prefix: '{midway-bullmq}',
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
  contextLoggerApplyLogger: 'bullMQLogger',
  contextLoggerFormat: info => {
    const { jobId, from } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
  },
};

export const midwayLogger = {
  clients: {
    bullMQLogger: {
      fileLogName: 'midway-bullmq.log',
    },
  },
};
