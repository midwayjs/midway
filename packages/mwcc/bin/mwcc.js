#!/usr/bin/env node

const { mwcc } = require('../dist');
const { resolveTsConfigFile } = require('../dist/config');

(async () => {
  const cli = resolveTsConfigFile(process.cwd());
  const summary = await mwcc(process.cwd(), 'dist', { compilerOptions: cli.options });
  if (summary.diagnostics.length > 0) {
    process.exitCode = 1;
  }
})();
