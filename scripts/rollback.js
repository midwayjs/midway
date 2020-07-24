const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const arr = ['#!/bin/bash\n', `# timestamp: ${Date.now()}\n\n`];
const diff = ['\n# Changes:\n\n'];

for (const item of data) {
  console.log('---->', item.name);
  if (item.private === false) {
    const version = execSync(
      `npm show ${item.name} version`
    ).toString().replace('\n', '');
    arr.push(
      `npm dist-tag add ${item.name}@${version} latest\n`
    );
    arr.push(
      `tnpm dist-tag add ${item.name}@${version} latest\n`
    );
    diff.push(`#  - ${item.name}: ${version} => 3.2.9\n`);
  }
}

writeFileSync(join(__dirname, 'rollback.sh'), arr.join('') + diff.join(''));
