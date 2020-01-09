const urllib = require('urllib');
const WebSocketClient = require('websocket').client;
import { tmpdir } from 'os';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { MidwayContainer, IFaaSStarter } from './interface';
// 传输大数据
const maxSize = 0xf00;
export function send(key, data) {
  const stringifyData = data && JSON.stringify(data);
  if (stringifyData && stringifyData.length >= maxSize) {
    const pathId = resolve(tmpdir(), 'trsd_' + key + (Date.now() + '' + Math.random()).replace(/[^0-9]/, '_'));
    writeFileSync(pathId, stringifyData);
    process.send({
      type: 'file',
      key,
      id: pathId
    });
  } else {
    process.send({
      type: 'data',
      key,
      data
    });
  }
}

export function get(child, key) {
  return new Promise(resolve => {
    child.on('message', m => {
      if (m && m.key === key) {
        if (m.type === 'data') {
          resolve(m.data);
        } else {
          const pathId = m.id;
          let data = {};
          if (existsSync(pathId)) {
            const temData = readFileSync(pathId).toString();
            unlinkSync(pathId);
            data = JSON.parse(temData);
          }
          resolve(data);
        }
      }
    });
  });
}

export function getWssUrl(port, type?: string, isThrowErr?: boolean) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
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
          resolve(url.replace('js_app.html?experiments=true&', 'inspector.html?'));
        }
      });
    }, 300);
  });
}

function debugWs(addr) {
  let currentId = 0;
  const cbMap = {};
  return new Promise(resolve => {
    const client = new WebSocketClient();
    client.on('connect', function (connection) {
      connection.on('message', message => {
        if (message.utf8Data) {
          const data = JSON.parse(message.utf8Data);
          if (data.id) {
            if (data.id > currentId) {
              currentId = data.id - 0;
            }
            if (cbMap[data.id]) {
              cbMap[data.id](data);
            }
          }
        }
      });

      const send = (method, params?) => {
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
          connection.sendUTF(JSON.stringify(param));
        });
      };

      send('Profiler.enable');
      send('Runtime.enable');
      send('Debugger.enable', { maxScriptsCacheSize: 10000000 });
      send('Debugger.setBlackboxPatterns', { patterns: ['internal'] });
      resolve(send);
    });
    client.connect(addr);
  });
}

export async function waitDebug(port) {
  const wssUrl = await getWssUrl(port);
  const sendDebug = await debugWs(wssUrl);
  return sendDebug;
}

export const Debug_Tag = 'midway-faas-local::debug::0x90906';

export const exportMidwayFaaS = (() => {
  const midwayModuleName = process.env.MidwayModuleName || '@midwayjs/faas';
  const faasPath = join(process.cwd(), './node_modules/', midwayModuleName);
  if (existsSync(faasPath)) {
    return require(faasPath);
  } else {
    return require(midwayModuleName);
  }
})();

export class FaaSStarterClass extends exportMidwayFaaS.FaaSStarter implements IFaaSStarter {
  constructor(opts) {
    super(opts);
  }

  handleInvokeWrapper(handlerMapping: string, debug?: boolean) {
    const funModule = this.funMappingStore.get(handlerMapping);
    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }
      const context: any = this.getContext(args.shift() || {});
      if (funModule) {
        const funModuleIns = await context.requestContext.getAsync(funModule);
        return this.invokeHandler(funModuleIns, this.getFunctionHandler(context, args, funModuleIns), args, debug);
      }
      throw new Error(`function handler = ${handlerMapping} not found`);
    };
  }

  async invokeHandler(funModule, handlerName, args, debug) {
    handlerName = handlerName || this.defaultHandlerMethod;
    if (funModule[ handlerName ]) {
      // invoke real method
      if (debug) {
        return funModule[ handlerName ].bind(funModule, ...args);
      } else {
        return funModule[ handlerName ].apply(funModule, args);
      }
    }
  }

  getApplicationContext(): MidwayContainer {
    return this.loader.getApplicationContext();
  }

  async start(opts?: any) {
    return super.start(opts);
  }

  getContext(context) {
    return super.getContext(context);
  }
}
