'use strict';

import * as qs from 'querystring';
import * as path from 'path';
import loadSchedule from './lib/load_schedule';

const loadEggSchedule = require('egg-schedule/lib/load_schedule');

module.exports = (app) => {
  // don't redirect scheduleLogger
  app.loggers.scheduleLogger.unredirect('error');

  // 'app/schedule' load egg-schedule (spec for egg-logxx rotate)
  const schedules = loadEggSchedule(app);
  // 'lib/schedule' load midway-schedule (class only with decorator support)
  loadSchedule(app);

  // for test purpose
  app.runSchedule = (schedulePath) => {
    if (!path.isAbsolute(schedulePath)) {
      schedulePath = path.join(
        app.config.baseDir,
        'app/schedule',
        schedulePath,
      );
    }
    schedulePath = require.resolve(schedulePath);
    let schedule;

    try {
      schedule = schedules[schedulePath];
      if (!schedule) {
        throw new Error(`Cannot find schedule ${schedulePath}`);
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
  app.messenger.on('egg-schedule', (data) => {
    const id = data.id;
    const key = data.key;
    const schedule = schedules[key];
    const logger = app.loggers.scheduleLogger;
    logger.info(`[${id}] ${key} task received by app`);

    if (!schedule) {
      logger.warn(`[${id}] ${key} unknown task`);
      return;
    }
    /* istanbul ignore next */
    if (schedule.schedule.disable) return;

    // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${key}&${qs.stringify(schedule.schedule)}`,
    });

    const start = Date.now();
    const task = schedule.task;
    logger.info(`[${id}] ${key} executing by app`);
    // execute
    task(ctx, ...data.args)
      .then(() => true) // succeed
      .catch((err) => {
        logger.error(`[${id}] ${key} execute error.`, err);
        err.message = `[egg-schedule] ${key} execute error. ${err.message}`;
        app.logger.error(err);
        return false; // failed
      })
      .then((success) => {
        const rt = Date.now() - start;
        const status = success ? 'succeed' : 'failed';
        ctx.coreLogger.info(
          `[egg-schedule] ${key} execute ${status}, used ${rt}ms`,
        );
        logger[success ? 'info' : 'error'](
          `[${id}] ${key} execute ${status}, used ${rt}ms`,
        );
      });
  });
};
