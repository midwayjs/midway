const { execSync } = require('child_process');
const execa = require('execa');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const cnpmFailed = [];
const finished = [];

async function checkSyncStatus(pkg) {
  const npmVersion = await execa('npm', ['show', pkg, 'version']);
  const cnpmVersion = await execa('cnpm', ['show', pkg, 'version']);

  finished.push(pkg);
  console.log(`[${finished.length}/${data.length}] ---->`, pkg);
  if (npmVersion.stdout !== cnpmVersion.stdout) {
    console.log(`===> npm: ${npmVersion.stdout}, cnpm: ${cnpmVersion.stdout}`);
    cnpmFailed.push(pkg);
  }
}

async function start() {
  const packages = data
    .filter((item) => item.private === false)
    .map((item) => item.name);

  const task = packages.map((pkg) => checkSyncStatus(pkg));
  await Promise.all(task);

  if (cnpmFailed.length) {
    console.log(`output command => cnpm sync ${cnpmFailed.join(' ')}`);
  }
}

start();
