import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as os from 'os';
import * as fs from 'fs';

export default appInfo => {
  const exports = {} as any;

  exports.rundir = path.join(appInfo.appDir, 'run');

  // 修改默认的日志名
  exports.midwayLogger = {
    clients: {
      appLogger: {
        fileLogName: 'midway-web.log',
        aliasName: 'logger',
      },
      agentLogger: {
        fileLogName: 'midway-agent.log',
      },
    },
  };

  exports.egg = {
    dumpConfig: true,
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
      const userId = ctx.userId || '-';
      const traceId = ctx.traceId ?? ctx.tracer?.traceId ?? '-';
      const use = Date.now() - ctx.startTime;
      const label =
        userId +
        '/' +
        ctx.ip +
        '/' +
        traceId +
        '/' +
        use +
        'ms ' +
        ctx.method +
        ' ' +
        ctx.url;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${label}] ${info.message}`;
    },
    queryParseMode: 'extended',
  };

  exports.pluginOverwrite = false;

  exports.security = {
    csrf: {
      ignoreJSON: false,
    },
  };

  // alinode runtime 写入的日志策略是: 如果 NODE_LOG_DIR 有设置，写入 NODE_LOG_DIR 设置的目录；否则为 /tmp
  let alinodeLogdir = fs.existsSync('/tmp') ? '/tmp' : os.tmpdir();
  // try to use NODE_LOG_DIR first
  if (process.env.NODE_LOG_DIR) {
    alinodeLogdir = process.env.NODE_LOG_DIR;
  }
  mkdirp.sync(alinodeLogdir);

  exports.alinode = {
    logdir: alinodeLogdir,
    error_log: [
      path.join(appInfo.root, `logs/${appInfo.pkg.name}/common-error.log`),
      path.join(appInfo.root, 'logs/stderr.log'),
    ],
    packages: [path.join(appInfo.appDir, 'package.json')],
  };

  return exports;
};
