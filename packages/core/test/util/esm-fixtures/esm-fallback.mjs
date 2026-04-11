import { createRequire } from 'module';
import assert from 'assert';

const require = createRequire(import.meta.url);
const { loadModule } = require('../../../dist/');

const mod = await loadModule(
  new URL('./reexport-ts-entry.ts', import.meta.url).pathname,
  {
    loadMode: 'esm',
  }
);

assert(mod.User.name === 'User');

const packageMod = await loadModule(
  new URL('./package-import-entry.ts', import.meta.url).pathname,
  {
    loadMode: 'esm',
  }
);

assert(typeof packageMod.version === 'string');
process.send('ready');
