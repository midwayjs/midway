'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('mz-modules/rimraf');
const assert = require('assert');
const { TestCommand } = require('./helper');
const tmp = path.join(__dirname, '../.tmp');

describe('test/init.test.js', () => {
  beforeEach(() => rimraf(tmp));
  afterEach(() => rimraf(tmp));

  it('should prompt and create first boilerplate', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      [ null, { name: 'return' }],
      targetDir,
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp);

    assert(fs.existsSync(path.join(targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });

  it('should create boilerplate use relative dir', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      [ null, { name: 'return' }],
      '.tmp/test',
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp);

    assert(fs.existsSync(path.join(targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });

  it('should create boilerplate by type argv', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      '.tmp/test',
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp, '--type=midway-ts');

    assert(fs.existsSync(path.join(targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });

  it('should create boilerplate with targetDir', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp, '--type=midway-ts --dir=.tmp/test');

    assert(fs.existsSync(path.join(targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });

  it('should create boilerplate with local boilerplate', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp, '--dir=.tmp/test --template=test/fixtures/simple-test');

    assert(fs.existsSync(path.join(targetDir, 'boilerplate/gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));
  });

  it('should create boilerplate by package name', async () => {
    const targetDir = path.join(tmp, 'test');
    const command = new TestCommand();
    command.mockPrompt([
      [
        'my_project',
        [ null, { name: 'down' }],
        'test',
      ],
    ]);
    await command.run(tmp, '--dir=.tmp/test --package=midway-boilerplate-typescript');

    assert(fs.existsSync(path.join(targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8');
    assert(/QuickStart/.test(content));
  });
});
