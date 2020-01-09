import { invoke } from './main';
import { send, waitDebug } from './utils';
const [parentOptions, debugPort] = process.argv.slice(2);
let options: any = {};
try {
  options = JSON.parse(parentOptions);
  delete options.debug;
} catch (e) {}
(async () => {
  try {
    await waitDebug(debugPort);
    const resultData = await invoke(options);
    send('faastest', resultData);
  } catch (e) {
    send('faastest', 'error: ' + e.message);
  }
  process.exit();
})();
