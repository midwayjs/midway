import 'reflect-metadata';
import * as assert from 'assert';
import * as is from 'is-type-of';
import { SCHEDULE_CLASS } from './metaKeys';

interface SchedueOpts {
  interval: number;
  type: string;
  env?: string[];
}

export default (app) => {
  const dirs = app.loader
    .getLoadUnits()
    .map((unit) => require('path').join(unit.path, 'lib/schedule'));
  const Loader = getScheduleLoader(app);
  const schedules = app.schedules ? app.schedules : app.schedules = {};
  new Loader({
    directory: dirs,
    target: schedules,
    inject: app,
  }).load();
  return schedules;
};

function getScheduleLoader(app) {
  return class ScheduleLoader extends app.loader.FileLoader {
    constructor(...args) {
      super(...args);
    }

    load() {
      const target = this.options.target;
      const items = this.parse();
      for (const item of items) {
        const schedule = item.exports;
        const fullpath = item.fullpath;

        assert(is.class(schedule), `schedule(${fullpath}: should be class`);
        const opts: SchedueOpts | string = Reflect.getMetadata(
          SCHEDULE_CLASS,
          schedule,
        );
        assert(opts, `schedule(${fullpath}): must use @schedule to setup.`);

        const task = async (ctx, data) => {
          const ins = await ctx.requestContext.getAsync(schedule);
          // throw new Error('emmmmm ' + ins);
          ins.exec = app.toAsyncFunction(ins.exec);
          return ins.exec(ctx, data);
        };

        const env = app.config.env;
        const envList = (opts as SchedueOpts).env;
        if (is.array(envList) && !envList.includes(env)) {
          app.coreLogger.info(
            `[egg-schedule]: ignore schedule ${fullpath} due to \`schedule.env\` not match`,
          );
          continue;
        }

        target[fullpath] = {
          schedule: opts,
          task,
          key: fullpath,
        };
      }
    }
  };
}
