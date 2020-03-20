const urllib = require('urllib');
const WebSocket = require('ws');
import { tmpdir } from 'os';
import {
  existsSync,
  readFileSync,
  remove,
  unlinkSync,
  writeFileSync,
} from 'fs-extra';
import { join, resolve } from 'path';
// 传输大数据
const maxSize = 0xf00;
export function send(key, data) {
  const stringifyData = data && JSON.stringify(data);
  if (stringifyData && stringifyData.length >= maxSize) {
    const pathId = resolve(
      tmpdir(),
      'trsd_' + key + (Date.now() + '' + Math.random()).replace(/[^0-9]/, '_')
    );
    writeFileSync(pathId, stringifyData);
    process.send({
      type: 'file',
      key,
      id: pathId,
    });
  } else {
    process.send({
      type: 'data',
      key,
      data,
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
    const ws = new WebSocket(addr);
    let currentId = 0;
    const cbMap = {};
    ws.on('open', () => {
      ws.on('message', message => {
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

export const exportMidwayFaaS = (() => {
  const midwayModuleName = process.env.MidwayModuleName || '@midwayjs/faas';
  const faasPath = join(process.cwd(), './node_modules/', midwayModuleName);
  if (existsSync(faasPath)) {
    return require(faasPath);
  } else {
    try {
      return require(midwayModuleName);
    } catch (e) {
      return { FaaSStarter: class DefaulltMidwayFaasStarter {} };
    }
  }
})();

export const FaaSStarterClass = exportMidwayFaaS.FaaSStarter;

export const cleanTarget = async (p: string) => {
  if (existsSync(p)) {
    await remove(p);
  }
};
