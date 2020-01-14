import { Invoke } from './invoke';
import { InvokeOptions } from './interface';
import { fork } from 'child_process';
import { get, getWssUrl } from './utils';
export const getInvoke = (Invoke, debugPath) => {
  return async (options: InvokeOptions) => {
    if (!options.data || !options.data.length) {
      options.data = [{}];
    }

    if (options.debug) {
      if (typeof options.debug !== 'string' || !/^\d+^/.test(options.debug)) {
        options.debug = '9229';
      }
      options.isDebug = true;
      const child = fork(
        require.resolve(debugPath),
        [
          JSON.stringify(options),
          options.debug
        ],
        {
          cwd: options.functionDir || process.env.PWD,
          execArgv: [
            '--inspect=' + options.debug
          ],
          silent: true
        }
      );
      getWssUrl(options.debug, 'devtoolsFrontendUrl', true).then(debugUrl => {
        console.log('[local invoke] debug at 127.0.0.1:' + options.debug);
        console.log('[local invoke] devtools at ' + debugUrl);
        if (options.debugCb) {
          options.debugCb({
            port: options.debug,
            info: debugUrl,
          });
        }
      });

      return new Promise((resolve, reject) => {
        get(child, 'faastest').then(data => {
          child.kill();
          resolve(data);
        });
        let err = '';
        child.stdout.on('data', buf => {
          console.log('[local invoke log]', buf.toString());
        });
        child.stderr.on('data', buf => {
          err += buf.toString();
        });
        child.on('close', () => {
          if (err) {
            reject(err);
          }
        });
      });
    }
    const invokeFun = new Invoke({
      baseDir: options.functionDir,
      functionName: options.functionName,
      handler: options.handler,
      trigger: options.trigger,
      isDebug: options.isDebug
    });
    return invokeFun.invoke([].concat(options.data));
  };
};

export const invoke = getInvoke(Invoke, './debug');
