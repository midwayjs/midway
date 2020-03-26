const { readFileSync, writeFileSync } = require('fs');
const { Script } = require('vm');
const { wrap } = require('module');
const { resolve } = require('path');

const argv = process.argv.slice(2);
const filename = resolve(argv[0]);
const output = resolve(argv[1] || filename + '.cache');

const source = readFileSync(filename, 'utf-8');
const columnOffset = -'(function (exports, require, module, __filename, __dirname) { '.length;

const script = new Script(wrap(source), { filename, columnOffset });
writeFileSync(output, script.createCachedData());
