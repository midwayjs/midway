import { fork, execSync } from 'child_process';
import * as minimist from 'minimist';
export const debug = async (options) => {
  const { callback, debugFile, debug } = options;
  let argv: any = {};
  if (process.argv[2] === 'isDebuging' && process.argv[3]) {
    argv = JSON.parse(process.argv[3]);
    if (argv.debugInspectPort) {
      // debug模式
      await waitDebug(argv.debugInspectPort);
    }
  } else {
    argv = minimist(process.argv.slice(2));
  }

  if (argv.debug && debugFile) {
    delete argv.debug;
    argv.debugInspectPort = debug || '9229';
    const child = fork(
      debugFile,
      [
        'isDebuging',
        JSON.stringify(argv)
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        execArgv: [
          '--inspect=' + argv.debugInspectPort
        ]
      }
    );
    const exit = () => {
      execSync('kill -9 ' + child.pid);
      child.kill();
      process.exit();
    };
    child.on('message', (m) => {
      if (m === 'childExit') {
        exit();
      }
    });
    process.on('SIGINT', exit);
    return;
  }
  if (argv.debugInspectPort) {
    process.on('exit', () => {
        process.send('childExit');
    });
  }
  if (callback) {
    callback(argv);
  }
};

export function getWssUrl(port, type?: string, isThrowErr?: boolean) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const urllib = require('urllib');
      urllib.request('http://127.0.0.1:' + port + '/json/list', (err, data) => {
        if (err) {
          if (isThrowErr) {
            reject(err);
          } else {
            getWssUrl(port, type, isThrowErr).then(resolve);
          }
        } else {
          const debugInfo = JSON.parse(data.toString());
          const url = debugInfo[0][type || 'webSocketDebuggerUrl'] || '';
          resolve(
            url.replace('js_app.html?experiments=true&', 'inspector.html?')
          );
        }
      });
    }, 100);
  });
}

function debugWs(addr) {
  return new Promise(resolve => {
    const WebSocket = require('ws');
    const ws = new WebSocket(addr);
    let currentId = 0;
    const cbMap = {};
    ws.on('open', () => {
      ws.on('message', message => {
        try {
          message = JSON.parse(message);
        } catch (e) {}
        if (message.params) {
          const id = message.params.scriptId;
          if (id) {
            if (id > currentId) {
              currentId = id - 0;
            }
            if (cbMap[id]) {
              cbMap[id](message.params);
            }
          }
        }
      });
      const send = (method, params?: any) => {
        return new Promise(resolve => {
          const curId = currentId + 1;
          currentId = curId;
          cbMap[curId] = data => {
            resolve(data);
          };
          const param: any = { id: curId, method };
          if (params) {
            param.params = params;
          }
          ws.send(JSON.stringify(param));
        });
      };
      send('Profiler.enable');
      send('Runtime.enable');
      send('Debugger.enable', { maxScriptsCacheSize: 10000000 });
      send('Debugger.setBlackboxPatterns', { patterns: ['internal'] });
      resolve(send);
    });
  });
}

export async function waitDebug(port) {
  const wssUrl = await getWssUrl(port);
  return debugWs(wssUrl);
}
