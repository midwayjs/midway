#!/usr/bin/env node

'use strict';

const childProcess = require('child_process');
const { Confirm } = require('enquirer');
const Command = require('..');

(async () => {
  const args = process.argv.slice(2);

  if (isInternal()) {
    const prompt = new Confirm({
      name: 'really',
      message: '检测到目前可能处于内网环境，推荐使用 @ali/midway-init，确定要继续吗？',
      initial: false,
      default: '[Y(es)|N(o)]',
    });
    const isContinue = await prompt.run();

    if (!isContinue) {
      return;
    }
  }

  try {
    const cmd = new Command();
    await cmd.run(process.cwd(), args);
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
})();

// 判断是否处于内网环境
function isInternal() {
  try {
    const { stdout } = childProcess.spawnSync('tnpm', [ 'view', '@ali/midway-init', '--json' ], {
      timeout: 3000,
    });

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
