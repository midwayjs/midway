import { ScheduleContextLogger } from '../service/scheduleContextLogger';

export const task = {
  redis: 'redis://127.0.0.1:6379',
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: 'Asia/Shanghai',
    },
  },
  concurrency: 1,
  ContextLoggerClass: ScheduleContextLogger,
  ContextLoggerApplyLogger: 'taskLog',
};

export const midwayLogger = {
  clients: {
    taskLog: {
      fileLogName: 'midway-task.log',
      disableConsole: true,
      printFormat: info => {
        return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.label} ${info.message}`;
      },
    },
  },
};
