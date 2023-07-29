import { createRequire } from 'module';
import assert from 'assert';

// console.log(import.meta.url);
const require = createRequire(import.meta.url);
// 这里要用 dist，因为 esm 会找最近的 pkg，而 src 目录最近的 pkg 是 commonjs，会报错
const { loadModule } = require('../../../dist/');

// console.log(url);
const clzDefault = await loadModule(new URL('./clz-default.mts', import.meta.url).pathname, { loadMode: 'esm' });
assert(clzDefault.default.User.name === 'User');

const clz = await loadModule(new URL('./clz.mts', import.meta.url).pathname, { loadMode: 'esm' });
assert(clz.User.name === 'User');

const data = await loadModule(new URL('./data.json', import.meta.url).pathname, { loadMode: 'esm'});
assert(data.test === 1);

const dataNoCache = await loadModule(new URL('./data.json', import.meta.url).pathname, { loadMode: 'esm', enableCache: false});
assert(dataNoCache.test === 1);
process.send('ready');
