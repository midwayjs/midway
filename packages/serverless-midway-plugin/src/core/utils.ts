const fs = require('fs');
const urllib = require('urllib');
const os = require('os');
const path = require('path');
const WebSocketClient = require('websocket').client;
// 传输大数据
const maxSize = 0xf00;
import { Ilayer } from '../interface/midwayServerless';

export function send(key, data) {
  const stringifyData = data && JSON.stringify(data);
  if (stringifyData && stringifyData.length >= maxSize) {
    const pathId = path.resolve(os.tmpdir(), 'trsd_' + key + (Date.now() + '' + Math.random()).replace(/[^0-9]/, '_'));
    fs.writeFileSync(pathId, stringifyData);
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
          if (fs.existsSync(pathId)) {
            const temData = fs.readFileSync(pathId).toString();
            fs.unlinkSync(pathId);
            data = JSON.parse(temData);
          }
          resolve(data);
        }
      }
    });
  });
}

function getWssUrl(port) {
  return new Promise(resolve => {
    setTimeout(() => {
      urllib.request('http://127.0.0.1:' + port + '/json/list', (err, data) => {
        if (err) {
          getWssUrl(port).then(resolve);
        } else {
          const debugInfo = JSON.parse(data.toString());
          resolve(debugInfo[0].webSocketDebuggerUrl);
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

      // send('Debugger.setPauseOnExceptions', { state: 'none' });
      // send('Debugger.setAsyncCallStackDepth', { maxDepth: 32 });
      // send('Runtime.getIsolateId');
      // send('Runtime.runIfWaitingForDebugger');

      send('Debugger.setBlackboxPatterns', { patterns: ['internal', 'startMocker'] });
      send('Debugger.setBreakpointsActive', { active: true });
      send('Debugger.setBreakpointByUrl', {
        lineNumber: 3,
        columnNumber: 0,
        urlRegex: 'faas\-local/dist/faasDebug\.js'
      });
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

export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach(layerName => {
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}
