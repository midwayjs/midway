export const task = {
  redis: 'redis://127.0.0.1:6379',
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: 'Asia/Shanghai',
    },
  },
  concurrency: 1,
  contextLoggerApplyLogger: 'taskLog',
  contextLoggerFormat: info => {
    const { taskInfo } = info.ctx;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${taskInfo.type}][${taskInfo.id}][${taskInfo.trigger}] ${info.message}`;
  },
};

export const midwayLogger = {
  clients: {
    taskLog: {
      fileLogName: 'midway-task.log',
      disableConsole: true,
    },
  },
};
