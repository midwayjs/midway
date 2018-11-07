'use strict';

const { mm } = require('../../midway-mock/dist');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

describe('test/schedule.test.js', () => {
  let app;
  // afterEach(() => app.close());

  describe('schedule type worker', () => {
    it('should support interval and cron', async () => {
      app = mm.app({
        baseDir: 'worker',
        framework: path.join(__dirname, '../../midway'),
      });
      // app.debug();
      await app.ready();
      console.log(app.schedules);
    });
  });
});

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function getCoreLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'logs',
    name,
    'egg-web.log',
  );
  return fs.readFileSync(logPath, 'utf8');
}

function getLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'dist',
    'logs',
    name,
    `midway-web.log`,
  );
  return fs.readFileSync(logPath, 'utf8');
}

function getErrorLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'logs',
    name,
    'common-error.log',
  );
  return fs.readFileSync(logPath, 'utf8');
}

function getAgentLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'logs',
    name,
    'egg-agent.log',
  );
  return fs.readFileSync(logPath, 'utf8');
}

function getScheduleLogContent(name) {
  const logPath = path.join(
    __dirname,
    'fixtures',
    name,
    'logs',
    name,
    'egg-schedule.log',
  );
  return fs.readFileSync(logPath, 'utf8');
}

function contains(content, match) {
  return content.split('\n').filter((line) => line.indexOf(match) >= 0).length;
}
