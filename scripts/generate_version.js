const { execSync } = require('child_process');
const { writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const result = {};
for (const info of data) {
  result[info.name] = info.version;
}

const key = result['@midwayjs/decorator'].replace(/\./g, '_') + '-' + result['@midwayjs/core'].replace(/\./g, '_');

const versionFile = join(__dirname, '../packages/version/versions', `${key}.json`);

if (existsSync(versionFile)) {
  const originData = require(versionFile);
  for (const pkgName in result) {
    if (!originData[pkgName]) {
      originData[pkgName] = result[pkgName];
    } else if (typeof originData[pkgName] === 'string') {
      // 去重
      if (originData[pkgName] !== result[pkgName]) {
        originData[pkgName] = [originData[pkgName], result[pkgName]];
      }
    } else {
      // array
      if (!originData[pkgName].includes(result[pkgName])) {
        originData[pkgName].push(result[pkgName]);
      }
    }
  }
  writeFileSync(versionFile, JSON.stringify(originData, null, 2));
} else {
  writeFileSync(versionFile, JSON.stringify(result, null, 2));
}
