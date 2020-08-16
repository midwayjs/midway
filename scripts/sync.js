const { execSync } = require('child_process');
const execa = require('execa');
const { resolve } = require('path');

const originData = execSync('npx lerna ls --json').toString();
const data = JSON.parse(originData);
const finished = [];

async function syncPackage(pkg) {
  await execa('tnpm', ['sync', pkg]);
  finished.push(pkg);
  console.log(`[${finished.length}/${data.length}] ${pkg} sync finished`);
}

async function sync() {
  console.log('\n=== start sync ===\n');
  const packages = data.map((item) => item.name);

  console.log(`sync ${packages.length} packages:\n${packages.join('\n')}\n`);
  const task = packages.map((pkg) => syncPackage(pkg));
  await Promise.all(task);

  console.log('\n=== check sync status ===\n');
  await execa('node', [resolve(__dirname, 'sync_status.js')]);

  console.log('\n=== sync finished ===');
  process.exit(1);
}

sync();
