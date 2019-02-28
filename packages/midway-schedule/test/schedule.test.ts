'use strict';

import { mm } from 'midway-mock';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
import { clearAllModule } from 'injection';

describe('test/schedule.test.ts', () => {
  let application;
  afterEach(() => {
    application.close();
    clearAllModule();
  });

  describe('schedule type worker', () => {
    it('should load schedules', async () => {
      application = mm.app({
        baseDir: 'app-load-schedule',
        typescript: true,
      });
      await application.ready();
      const list = Object.keys(application.schedules).filter((key) =>
        key.includes('HelloCron'),
      );
      assert(list.length === 1);
      const item = application.schedules[list[0]];
      assert.deepEqual(item.schedule, { type: 'worker', interval: 2333 });
    });

    it('should support interval with @schedule decorator (both app/schedule & lib/schedule)', async () => {
      const name = 'worker';
      application = mm.cluster({
        baseDir: name,
        typescript: true,
        worker: 2,
      });
      await application.ready();
      await sleep(5000);
      const log = getLogContent(name);
      assert(contains(log, 'hello decorator') === 4, '未正确执行 4 次');
    });

    it('should support non-default class with @schedule decorator', async () => {
      const name = 'worker-non-default-class';
      application = mm.cluster({
        baseDir: name,
        typescript: true,
        worker: 2,
      });
      await application.ready();
      await sleep(5000);
      const log = getLogContent(name);
      assert(contains(log, 'hello decorator') === 4, '未正确执行 4 次');
      assert(contains(log, 'hello other functions') === 4, '未正确执行 4 次');
    });
  });
});

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

// function getCoreLogContent(name) {
//   const logPath = path.join(
//     __dirname,
//     'fixtures',
//     name,
//     'logs',
//     name,
//     'egg-web.log',
//   );
//   return fs.readFileSync(logPath, 'utf8');
// }

function getLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'logs',
    name,
    `midway-web.log`,
  );
  return fs.readFileSync(logPath, 'utf8');
}

// function getErrorLogContent(name) {
//   const logPath = path.join(
//     __dirname,
//     'fixtures',
//     name,
//     'logs',
//     name,
//     'common-error.log',
//   );
//   return fs.readFileSync(logPath, 'utf8');
// }

// function getAgentLogContent(name) {
//   const logPath = path.join(
//     __dirname,
//     'fixtures',
//     name,
//     'logs',
//     name,
//     'egg-agent.log',
//   );
//   return fs.readFileSync(logPath, 'utf8');
// }

// function getScheduleLogContent(name) {
//   const logPath = path.join(
//     __dirname,
//     'fixtures',
//     name,
//     'logs',
//     name,
//     'egg-schedule.log',
//   );
//   return fs.readFileSync(logPath, 'utf8');
// }

function contains(content, match) {
  return content.split('\n').filter((line) => line.indexOf(match) >= 0).length;
}
