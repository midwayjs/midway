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

  const STRATEGY = Object.getOwnPropertySymbols(agent.schedule)[0];
  const STRATEGY_INSTANCE = Object.getOwnPropertySymbols(agent.schedule)[1];


  // ugly!! just support all and worker strategy
  class AllStrategy extends agent['TimerScheduleStrategy'] {
    timer;
    handler() {
      this.sendAll();
    }

    safeTimeout(...args) {
      this.timer = super.safeTimeout(...args);
      return this.timer;
    }
    close() {
      clearTimeout(this.timer);
    }
  }

  class WorkerStrategy extends agent['TimerScheduleStrategy'] {
    timer;
    handler() {
      this.sendOne();
    }
    safeTimeout(...args) {
      this.timer = super.safeTimeout(...args);
      return this.timer;
    }
    close() {
      clearTimeout(this.timer);

    }
  }

  agent.schedule.close = () => {
    agent.schedule.closed = true;
    for (const instance of agent.schedule[STRATEGY_INSTANCE].values()) {
      instance.close();
    }
  }

  const strategyMap = agent.schedule[STRATEGY];
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
