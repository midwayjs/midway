#!/usr/bin/env node

'use strict';

const co = require('co');
const childProcess = require('child_process');
const { Confirm } = require('enquirer');
const Command = require('..');
const pkgInfo = require('../package.json');

const options = {
  name: 'midway-init',
  pkgInfo,
};

co(function* () {
  const args = process.argv.slice(2);

  if (isInternal()) {
    const prompt = new Confirm({
      name: 'really',
      message: '检测到目前可能处于内网环境，推荐使用 @ali/midway-init，确定要继续吗？',
      initial: false,
      default: '[Y(es)|N(o)]',
    });
    const isContinue = yield prompt.run();

    if (!isContinue) {
      return;
    }
  }

  const cmd = new Command(Object.assign({}, options));
  yield cmd.run(process.cwd(), args);
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});

// 判断是否处于内网环境
function isInternal() {
  try {
    const { stdout } = childProcess.spawnSync('tnpm', [ 'view', '@ali/midway-init', '--json' ]);
    const npmData = JSON.parse(stdout.toString(), null, 2);

    if (npmData.name === '@ali/midway-init') {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}
