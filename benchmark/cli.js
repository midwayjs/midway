const { Suite } = require('benchmark');
const { resolve } = require('path');
const cp = require('child_process');
const cli = resolve(__dirname, '../packages/faas-cli/bin/fun.js');
const baseApp = resolve(
  __dirname,
  '../packages/serverless-invoke/test/fixtures/baseApp'
);

const func = () => {
  cp.execSync(`cd ${baseApp};${cli} invoke -f http --clean=false`);
};
const funcHelp = () => {
  cp.execSync(`${cli} -h`);
};
const funcTest = () => {
  cp.execSync(`${cli} test -f ${resolve(__dirname, './bc.test.ts')}`);
};

const contenders = {
  'faas-cli invoke': func,
  'faas-cli help': funcHelp,
  'faas-cli test': funcTest,
};

console.log('\nBenchmark:');
const bench = new Suite().on('cycle', e => {
  console.log('  ' + e.target);
});

Object.keys(contenders).forEach(name => {
  bench.add(name.padEnd(22, ' '), () => contenders[name]());
});

bench.run();
