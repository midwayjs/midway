'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('mz-modules/rimraf');
const assert = require('assert');
const Helper = require('./helper');

const tmp = path.join(__dirname, '../.tmp');

const Command = require('../lib/command');

describe('test/init.test.js', () => {
  let command;
  let helper;
  before(function* () {
    yield rimraf(tmp);
    command = new Command();
    helper = new Helper(command);
  });

  beforeEach(() => rimraf(tmp));

  afterEach(function* () {
    yield rimraf(tmp);
    helper.restore();
  });

  it('should prompt', function* () {
    helper.mock([ helper.KEY_ENTER, [ 'test', 'this is xxx', 'Harry', helper.KEY_ENTER ]]);
    yield command.run(tmp, [ 'midway-ts-app', '--force' ]);

    assert(fs.existsSync(path.join(command.targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(command.targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(command.targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });

});
