import { invoke as InvokeFun } from '@midwayjs/faas-cli';
export const invoke = (options: {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string;       // debug 端口
  data?: any[];         // 函数入参
  nolog?: boolean;      // 是否不进行console输出
  trigger?: string;     // 触发器
  runtime?: string;     // 运行时环境
}) => {
  const { runtime, trigger } = options;

  let starter;
  let eventPath;
  let eventName;

  if (runtime === 'aliyun') {
    starter = require.resolve('@midwayjs/serverless-fc-starter');
    eventPath = require.resolve('@midwayjs/serverless-fc-trigger');
    if (trigger === 'http') {
      eventName = 'HTTPTrigger';
    } else if (trigger === 'apiGateway') {
      eventName = 'ApiGatewayTrigger';
    }
  } else if (runtime === 'tencent') {
    starter = require.resolve('@midwayjs/serverless-scf-starter');
  }

  return InvokeFun({
    ...options,
    starter,
    eventPath,
    eventName
  });
};
// import { join } from 'path';
// import { fork } from 'child_process';
// import { get, getWssUrl } from './utils';
// const getTsPath = () => {
//   try {
//     return join(require.resolve('ts-node'), '../../register');
//   } catch (err) {
//     return join(__dirname, '../node_modules/ts-node/register');
//   }
// };

// const makeDebugPort = debug => {
//   if (debug) {
//     if (/^\d+$/.test(debug + '')) {
//       return debug + '';
//     }
//     return '9229';
//   }
//   return '';
// };

// export const invoke = (options: {
//   functionDir?: string; // 函数所在目录
//   functionName: string; // 函数名
//   debug?: string;       // debug 端口
//   data?: any[];         // 函数入参
//   nolog?: boolean;      // 是否不进行console输出
//   trigger?: string;     // 触发器
// }) => {
//   const { functionName, debug, data, nolog, functionDir, trigger } = options;

//   process.env.TS_NODE_FILES = 'true';
//   process.env.TS_NODE_TYPE_CHECK = 'false';
//   process.env.TS_NODE_TRANSPILE_ONLY = 'true';

//   return new Promise((resolve, reject) => {
//     const execArgv = [
//       '-r',
//       getTsPath()
//     ];

//     const debugPort = makeDebugPort(debug);
//     if (debugPort) {
//       execArgv.unshift('--inspect=' + debugPort);
//     }

//     let arg = data;
//     try {
//       if (typeof arg === 'string') {
//         arg = JSON.parse(arg);
//       }
//     } catch (e) { }

//     const child = fork(join(__dirname, './invoke'), [
//       functionName,
//       JSON.stringify([].concat(arg || [])),
//       debugPort,
//       trigger
//     ], {
//       cwd: functionDir || process.env.PWD,
//       env: process.env,
//       silent: true,
//       execArgv
//     });

//     if (debugPort) {
//       getWssUrl(debugPort, 'devtoolsFrontendUrl', true).then(debugUrl => {
//         console.log('[local invoke] debug at 127.0.0.1:' + debugPort);
//         console.log('[local invoke] devtools at ' +  debugUrl);
//       });
//     }

//     get(child, 'faastest').then(data => {
//       resolve(data);
//     });

//     let err = '';
//     child.stdout.on('data', (buf) => {
//       if (!nolog) {
//         console.log('[local invoke log]', buf.toString());
//       }
//     });

//     child.stderr.on('data', (buf) => {
//       err += buf.toString();
//     });

//     child.on('close', () => {
//       if (err) {
//         reject(err);
//       }
//     });
//   });
// };
