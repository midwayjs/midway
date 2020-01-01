import { join } from 'path';
import { fork } from 'child_process';
import { get, getWssUrl } from './utils';
const getTsPath = () => {
  try {
    return join(require.resolve('ts-node'), '../../register');
  } catch (err) {
    return join(__dirname, '../../../node_modules/ts-node/register');
  }
};

const makeDebugPort = debug => {
  if (debug) {
    if (/^\d+$/.test(debug + '')) {
      return debug + '';
    }
    return '9229';
  }
  return '';
};

export const invoke = (options: {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string;       // debug 端口
  data?: any[];         // 函数入参
  nolog?: boolean;      // 是否不进行console输出
  starter?: string;     // starter包名或路径
  eventPath?: string;   // trigger包名或路径
  eventName?: string;   // 触发器名称
  layers?: any;         // layer配置 , 不填会从yml中获取
  handler?: string;     // handler, 不填会从yml中获取
  midwayModuleName?: string; // midway module name e.g. @midwayjs/faas
  debugCb?: any;        // debug 回调
}) => {
  const {
    functionName,
    debug,
    data,
    nolog,
    functionDir,
    starter,
    eventPath,
    eventName,
    layers,
    handler,
    midwayModuleName,
    debugCb
  } = options;

  process.env.TS_NODE_FILES = 'true';
  process.env.TS_NODE_TYPE_CHECK = 'false';
  process.env.TS_NODE_TRANSPILE_ONLY = 'true';

  return new Promise((resolve, reject) => {
    const execArgv = [
      '-r',
      getTsPath()
    ];

    const debugPort = makeDebugPort(debug);
    if (debugPort) {
      execArgv.unshift('--inspect=' + debugPort);
    }

    let arg = data;
    try {
      if (typeof arg === 'string') {
        arg = JSON.parse(arg);
      }
    } catch (e) { }

    const child = fork(join(__dirname, './invoke'), [
      functionName,
      JSON.stringify([].concat(arg || [])),
      debugPort,
      starter || '',
      eventPath || '',
      eventName || '',
      handler || '',
      layers ? JSON.stringify(layers) : ''
    ], {
      cwd: functionDir || process.env.PWD,
      env: {
        MidwayModuleName: midwayModuleName || '',
        ...process.env
      },
      silent: true,
      execArgv
    });

    if (debugPort) {
      getWssUrl(debugPort, 'devtoolsFrontendUrl', true).then(debugUrl => {
        console.log('[local invoke] debug at 127.0.0.1:' + debugPort);
        console.log('[local invoke] devtools at ' +  debugUrl);

        if (debugCb) {
          debugCb({
            port: debugPort,
            info: debugUrl
          });
        }
      });
    }

    get(child, 'faastest').then(data => {
      resolve(data);
    });

    let err = '';
    child.stdout.on('data', (buf) => {
      if (!nolog) {
        console.log('[local invoke log]', buf.toString());
      }
    });

    child.stderr.on('data', (buf) => {
      err += buf.toString();
    });

    child.on('close', () => {
      if (err) {
        reject(err);
      }
    });
  });
};
