export const taskConfig = {
  redis: 'redis://127.0.0.1:32768',
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: 'Asia/Shanghai',
    },
  },
};
