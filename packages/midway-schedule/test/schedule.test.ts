import { closeApp, create } from './utils';
import * as path from 'path';
const fs = require('fs');
const assert = require('assert');

describe('test/schedule.test.ts', () => {

  describe('schedule type worker', () => {
    it('should load schedules', async () => {
      const application: any = await create('app-load-schedule',  {},);
      const list = Object.keys(application.schedules).filter((key) =>
        key.includes('HelloCron'),
      );
      assert(list.length === 1);
      const item = application.schedules[list[0]];
      assert.deepEqual(item.schedule, {type: 'worker', interval: 2333});
      await closeApp(application);
    });

    it('should support interval with @schedule decorator (both app/schedule & lib/schedule)', async () => {
      const name = 'worker';
      const application = await create('worker',  {});
      await sleep(5000);
      const log = getLogContent(name);
      assert(contains(log, 'hello decorator') === 4, '未正确执行 4 次');
      await closeApp(application);
    });

    it('should support non-default class with @schedule decorator', async () => {
      const name = 'worker-non-default-class';
      const application = await create(name,  {});
      await sleep(5000);
      const log = getLogContent(name);
      assert(contains(log, 'hello decorator') === 4, '未正确执行 4 次');
      assert(contains(log, 'hello other functions') === 4, '未正确执行 4 次');
      await closeApp(application);
    });
  });

  describe('app.runSchedule', () => {
    it('should run schedule not exist throw error', async () => {
      const application = await create('worker-other',  {});
      await application.runSchedule('intervalCron#IntervalCron');
      await sleep(1000);
      const log = getLogContent('worker-other');
      // console.log(log);
      expect(contains(log, 'hello decorator')).toEqual(1);
      await closeApp(application);
    });
  });
});

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

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

function contains(content, match) {
  return content.split('\n').filter((line) => line.indexOf(match) >= 0).length;
}
