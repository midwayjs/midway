const { execSync } = require('child_process');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);
console.log();

for (const item of data) {

  if (item.private === false) {
    const remoteVersion = execSync(
      `npm show ${item.name} version`
    ).toString().replace('\n', '');

    const localVersion = item.version;
    if (localVersion === remoteVersion) {
      console.log(`----> ${item.name.padEnd(40)} equal(${localVersion})`);
    } else {
      console.log(`----> ${item.name.padEnd(40)} diff(local=${localVersion},remote=${remoteVersion})`);
    }
  }
}
