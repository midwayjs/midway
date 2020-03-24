#!/usr/bin/env node

const { mwcc } = require('../dist');
const { resolveTsConfigFile } = require('../dist/config');

const cli = resolveTsConfigFile(process.cwd());
const summary = mwcc(process.cwd(), 'dist', { compilerOptions: cli.options });
if (summary.diagnostics.length > 0) {
  process.exitCode = 1;
}
