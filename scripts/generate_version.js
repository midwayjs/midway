const { execSync } = require('child_process');
const { writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const result = {};
for (const info of data) {
  result[info.name] = info.version;
}

const key = result['@midwayjs/decorator'].replace('.', '_') + '-' + result['@midwayjs/core'].replace('.', '_');

const versionFile = join(__dirname, '../packages/version', `${key}.json`);

if (existsSync(versionFile)) {
  const originData = require(versionFile);
  for (const pkgName in result) {
    if (typeof originData[pkgName] === 'string') {
      originData[pkgName] = [originData[pkgName], result[pkgName]];
    } else {
      // array
      originData[pkgName].push(result[pkgName]);
    }
  }
  writeFileSync(versionFile, JSON.stringify(originData, null, 2));
} else {
  writeFileSync(versionFile, JSON.stringify(result, null, 2));
}
