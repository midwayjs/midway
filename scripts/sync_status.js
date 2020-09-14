const { execSync } = require('child_process');
const execa = require('execa');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);

const failed = [];
const finished = [];

async function checkSyncStatus(pkg) {
  const npmVersion = await execa('npm', ['show', pkg, 'version']);
  const tnpmVersion = await execa('tnpm', ['show', pkg, 'version']);

  finished.push(pkg);
  console.log(`[${finished.length}/${data.length}] ---->`, pkg);
  if (npmVersion.stdout !== tnpmVersion.stdout) {
    console.log(`===> npm: ${npmVersion.stdout}, tnpm: ${tnpmVersion.stdout}`);
    failed.push(item.name);
  }
}

async function start() {
  const packages = data
    .filter((item) => item.private === false)
    .map((item) => item.name);

  const task = packages.map((pkg) => checkSyncStatus(pkg));
  await Promise.all(task);

  if (failed.length) {
    console.log(`output command => tnpm sync ${failed.join(' ')}`);
  }
}

start();
