const { execSync } = require('child_process');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const arr = [];

for (const item of data) {
  console.log('---->', item.name);
  if (item.private === false) {
    const npmVersion = execSync(`npm show ${item.name} version`)
      .toString()
      .replace('\n', '');
    const tnpmVersion = execSync(`tnpm show ${item.name} version`)
      .toString()
      .replace('\n', '');
    if (npmVersion !== tnpmVersion) {
      console.log(`===> npm: ${npmVersion}, tnpm: ${tnpmVersion}`);
      arr.push(item.name);
    }
  }
}

if (arr.length) {
  console.log(`output command => tnpm sync ${arr.join(' ')}`);
}
