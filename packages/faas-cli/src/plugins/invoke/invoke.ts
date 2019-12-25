import { send, waitDebug, Debug_Tag } from './utils';
import { Local } from './local';

(async () => {
  const [
    functionName,
    argsData,
    isDebug,
    starter,
    eventPath,
    eventName,
    handler,
    layers
  ] = process.argv.slice(2);

  if (isDebug) {
    await waitDebug(isDebug);
  }

  let layersObj: any = null;
  if (layers) {
    try {
      layersObj = JSON.parse(layers);
    } catch (E) {}
  }

  try {
    const local = new Local({
      functionName,
      // trigger: trigger === 'undefined' ? undefined : trigger,
      starter,
      event: {
        path: eventPath,
        name: eventName
      },
      handler,
      layers: layersObj
    });

    const args = argsData ? [].concat(JSON.parse(argsData)) : [];

    if (isDebug) {
      args.push(Debug_Tag);
    }

    const resultData = await local.invoke.apply(local, args);
    send('faastest', resultData);
  } catch (e) {
    console.log(e);
    send('faastest', 'error: ' + e.message);
  }
  // 结束进程
  process.exit();
})();
