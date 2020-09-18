import {
  SCHEDULE_KEY,
  ScheduleOpts,
  getClassMetadata,
  getProviderId,
  listModule,
} from '@midwayjs/decorator';

export = agent => {
  if (!agent.schedule) {
    return;
  }

  // ugly!! just support all and worker strategy
  class AllStrategy extends agent['TimerScheduleStrategy'] {
    handler() {
      this.sendAll();
    }
  }

  class WorkerStrategy extends agent['TimerScheduleStrategy'] {
    handler() {
      this.sendOne();
    }
  }

  const strategyMap = new Map();
  strategyMap.set('worker', WorkerStrategy);
  strategyMap.set('all', AllStrategy);

  agent.messenger.once('egg-ready', () => {
    const schedules: any[] = listModule(SCHEDULE_KEY);
    for (const scheduleModule of schedules) {
      const provideId = getProviderId(scheduleModule);
      const opts: ScheduleOpts = getClassMetadata(SCHEDULE_KEY, scheduleModule);
      const type = opts.type;
      if (opts.disable) {
        continue;
      }
      const key = provideId + '#' + scheduleModule.name;
      const Strategy = strategyMap.get(type);
      if (!Strategy) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'MidwayScheduleError';
        throw err;
      }

      const instance = new Strategy(opts, agent, key);
      instance.start();
    }
  });
};
