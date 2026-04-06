#!/usr/bin/env node

import { runCli } from './app';

void runCli().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
