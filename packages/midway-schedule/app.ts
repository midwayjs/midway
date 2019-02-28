import { SchedueOpts, SCHEDULE_KEY } from '@midwayjs/decorator';
import { getClassMetaData, listModule, TagClsMetadata, TAGGED_CLS } from 'injection';
import * as is from 'is-type-of';
import 'reflect-metadata';

export = (app) => {
  const schedules: any[] = listModule(SCHEDULE_KEY);
  for (const scheduleModule of schedules) {
    const metaData = Reflect.getMetadata(TAGGED_CLS, scheduleModule) as TagClsMetadata;
    app.loggers.coreLogger.info('-----module=' + scheduleModule);
    if (metaData) {
      const key = metaData.id + '#' + scheduleModule.name;
      const opts: SchedueOpts = getClassMetaData(SCHEDULE_KEY, scheduleModule);
      app.loggers.coreLogger.info('-----key=' + key);
      const task = async (ctx, data) => {
        const ins = await ctx.requestContext.getAsync(scheduleModule);
        ins.exec = app.toAsyncFunction(ins.exec);
        return ins.exec(ctx, data);
      };

      const env = app.config.env;
      const envList = opts.env;
      if (is.array(envList) && !envList.includes(env)) {
        app.coreLogger.info(
          `[midway-schedule]: ignore schedule ${key} due to \`schedule.env\` not match`,
        );
        return;
      }
      app.schedules[key] = {
        schedule: opts,
        task,
        key,
      };
    }

  }
};
