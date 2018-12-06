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
      const files = this.parse();
      for (const file of files) {
        const item = file.exports;
        const fullpath = file.fullpath;
        if (is.class(item)) {
          collectTask(item, 'default', fullpath);
          continue;
        }
        Object.keys(item)
          .filter((key) => !key.startsWith('__'))
          .filter((key) => is.class(item[key]))
          .map((key) => collectTask(item[key], key, fullpath));
      }
      return;

      function collectTask(cls, name, fullpath) {
        const key = fullpath + '#' + name;
        const opts: SchedueOpts | string = Reflect.getMetadata(
          SCHEDULE_CLASS,
          cls,
        );
        assert(opts, `schedule(${key}): must use @schedule to setup.`);
        const task = async (ctx, data) => {
          const ins = await ctx.requestContext.getAsync(cls);
          ins.exec = app.toAsyncFunction(ins.exec);
          return ins.exec(ctx, data);
        };

        const env = app.config.env;
        const envList = (opts as SchedueOpts).env;
        if (is.array(envList) && !envList.includes(env)) {
          app.coreLogger.info(
            `[egg-schedule]: ignore schedule ${key} due to \`schedule.env\` not match`,
          );
          return;
        }
        target[key] = {
          schedule: opts,
          task,
          key,
        };
      }
    }
  };
}