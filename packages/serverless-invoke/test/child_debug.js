
const { send, waitDebug } = require('../dist/utils');
(async () => {
  console.log('debug');
  try {
    await waitDebug(9229);
    send('faastest', { name: 123 });
  } catch (e) {
    send('faastest', { name: 123 });
  }
  process.exit();
})();