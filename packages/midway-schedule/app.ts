'use strict';

import * as qs from 'querystring';
import * as path from 'path';
import loadSchedule from './lib/load_schedule';

const loadEggSchedule = require('egg-schedule/lib/load_schedule');

module.exports = (app) => {
  const logger = app.getLogger('scheduleLogger');
  // don't redirect scheduleLogger
  app.loggers.scheduleLogger.unredirect('error');

  // 'app/schedule' load egg-schedule (spec for egg-logxx rotate)
  const schedules = loadEggSchedule(app);
  // 'lib/schedule' load midway-schedule (class only with decorator support)
  loadSchedule(app);

  // log schedule list
  for (const s in schedules) {
    const schedule = schedules[s];
    if (!schedule.schedule.disable) {
      logger.info('[egg-schedule]: register schedule %s', schedule.key);
    }
  }

  // for test purpose
  const directory = [].concat(
    path.join(app.config.baseDir, 'app/schedule'),
    path.join(app.config.baseDir, 'lib/schedule'),
    app.config.schedule.directory || [],
  );
  app.runSchedule = (schedulePath, key = 'default') => {
    // resolve real path
    if (path.isAbsolute(schedulePath)) {
      schedulePath = require.resolve(schedulePath);
    } else {
      for (const dir of directory) {
        try {
          schedulePath = require.resolve(path.join(dir, schedulePath));
          break;
        } catch (_) {
          /* istanbul ignore next */
        }
      }
    }

    let schedule;

    try {
      schedule = schedules[schedulePath] || schedules[schedulePath + `#${key}`];
      if (!schedule) {
        throw new Error(`Cannot find schedule ${schedulePath}#${key}`);
      }
    } catch (err) {
      err.message = `[egg-schedule] ${err.message}`;
      return Promise.reject(err);
    }

    // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${schedulePath}&${qs.stringify(
        schedule.schedule,
      )}`,
    });

    return schedule.task(ctx);
  };

  // log schedule list
  for (const s in schedules) {
    const schedule = schedules[s];
    if (!schedule.schedule.disable)
      app.coreLogger.info('[egg-schedule]: register schedule %s', schedule.key);
  }

  // register schedule event
  app.messenger.on('egg-schedule', (info) => {
    const { id, key } = info;
    const schedule = schedules[key];

    logger.info(`[Job#${id}] ${key} task received by app`);

    if (!schedule) {
      logger.warn(`[Job#${id}] ${key} unknown task`);
      return;
    }

    /* istanbul ignore next */
    if (schedule.schedule.disable) {
      logger.warn(`[Job#${id}] ${key} disable`);
      return;
    }

    logger.info(`[Job#${id}] ${key} executing by app`);

    // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${key}&${qs.stringify(schedule.schedule)}`,
    });

    const start = Date.now();

    // execute
    return schedule
      .task(ctx, ...info.args)
      .catch((err) => {
        logger.error(`[Job#${id}] ${key} execute error.`, err);
        return err;
      })
      .then((err) => {
        const success = !err;
        const rt = Date.now() - start;

        logger[success ? 'info' : 'error'](
          `[Job#${id}] ${key} execute ${
            success ? 'succeed' : 'failed'
          }, used ${rt}ms`,
        );

        Object.assign(info, {
          success,
          workerId: process.pid,
          rt,
          message: err && err.message,
        });

        // notify agent job finish
        app.messenger.sendToAgent('egg-schedule', info);
      });
  });
};
