import {
  prepareGlobalApplicationContext,
  isTypeScriptEnvironment,
} from '@midwayjs/core';
import { join } from 'path';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

function runInAgent() {
  return (
    process.title.indexOf('agent') !== -1 ||
    (process.argv[1] && process.argv[1].indexOf('agent_worker') !== -1)
  );
}

// 多进程模式，从 egg-scripts 启动的
process.env['EGG_CLUSTER_MODE'] = 'true';
const isAgent = runInAgent();

debug(
  '[egg]: run with egg-scripts in worker and init midway container in cluster mode'
);
const appDir = JSON.parse(process.argv[2])?.baseDir ?? process.cwd();
let baseDir;

if (isTypeScriptEnvironment()) {
  baseDir = join(appDir, 'src');
} else {
  baseDir = join(appDir, 'dist');
}

prepareGlobalApplicationContext({
  appDir,
  baseDir,
  // ignore: ['**/app/extend/**', '**/app/public/**'],
});

if (!isAgent) {
  debug(
    '[egg]: run with egg-scripts in worker and init midway container complete'
  );
} else {
  debug(
    '[egg]: run with egg-scripts in agent and init midway container complete'
  );
}
