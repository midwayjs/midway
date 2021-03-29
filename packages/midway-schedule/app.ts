import {
  ScheduleOpts,
  SCHEDULE_KEY,
  getClassMetadata,
  listModule,
  getProviderId,
  isClass,
} from '@midwayjs/decorator';
import * as is from 'is-type-of';

export = app => {
  // egg-schedule 的 app 里没有 schedule
  if (!app.runSchedule) {
    return;
  }

  const originMethod = app.runSchedule;
  app.runSchedule = (...args) => {
    if (isClass(args[0])) {
      args[0] = getProviderId(args[0]) + '#' + args[0].name;
    }
    return originMethod.call(app, ...args);
  }

  const schedules: any[] = listModule(SCHEDULE_KEY);
  for (const scheduleModule of schedules) {
    const providerId = getProviderId(scheduleModule);
    if (providerId) {
      const key = providerId + '#' + scheduleModule.name;
      const opts: ScheduleOpts = getClassMetadata(SCHEDULE_KEY, scheduleModule);
      const task = async (ctx, data) => {
        const ins = await ctx.requestContext.getAsync(scheduleModule);
        ins.exec = app.toAsyncFunction(ins.exec);
        return ins.exec(ctx, data);
      };

      const env = app.config.env;
      const envList = opts.env;
      if (is.array(envList) && !envList.includes(env)) {
        app.coreLogger.info(
          `[midway-schedule]: ignore schedule ${key} due to \`schedule.env\` not match`
        );
        continue;
      }
      app.schedules[key] = {
        schedule: opts,
        task,
        key,
      };
    }
  }
};
