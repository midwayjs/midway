const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const result = {};
for (const info of data) {
  result[info.name] = info.version;
}

writeFileSync(join(__dirname, '../packages/decorator/version.json'), JSON.stringify(result, null, 2));
