'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('mz-modules/rimraf');
const assert = require('assert');
const Helper = require('./helper');
const proxy = require('proxy');
const mm = require('mm');

const tmp = path.join(__dirname, '../.tmp');

const Command = require('../lib/command');

describe('test/proxy.test.js', () => {
  let command;
  let helper;
  let proxyServer;
  let proxyPort;

  before(function* () {
    yield rimraf(tmp);
    command = new Command();
    helper = new Helper(command);
  });

  before(done => {
    proxyServer = proxy();
    proxyServer.listen(() => {
      proxyPort = proxyServer.address().port;
      done();
    });
  });

  beforeEach(() => rimraf(tmp));

  afterEach(function* () {
    mm.restore();
    yield rimraf(tmp);
    helper.restore();
  });

  after(done => {
    proxyServer.once('close', function() { done(); });
    proxyServer.close();
  });

  it('should work', function* () {
    mm(process.env, 'http_proxy', 'http://127.0.0.1:' + proxyPort);

    helper.mock([ helper.KEY_DOWN, [ 'test', 'this is xxx', 'TZ', helper.KEY_ENTER ]]);
    yield command.run(tmp, [ 'prompt-app', '--force' ]);

    assert(fs.existsSync(path.join(command.targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(command.targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(command.targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });
});
