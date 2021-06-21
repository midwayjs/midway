import { format } from 'winston';
import { inspect, types } from 'util';
import { IMidwayLogger } from './interface';
const { LEVEL, MESSAGE, SPLAT } = require('triple-beam');

export const displayCommonMessage = format(
  (
    info,
    opts: {
      defaultLabel?: string;
      defaultMeta?: Record<string, unknown>;
      target?: IMidwayLogger;
    }
  ) => {
    if (!info.pid) {
      info.pid = process.pid;
    }

    if (!info.ignoreFormat) {
      info.ignoreFormat = false;
    }

    if (!info.ctx) {
      info.ctx = null;
    }

    if (!info.LEVEL) {
      info.LEVEL = info.level.toUpperCase();
    }

    if (!info.defaultLabel) {
      info.defaultLabel =
        opts.defaultLabel || opts.target?.getDefaultLabel() || '';
    }

    if (info instanceof Error) {
      // 参数只是 error 的情况
      return Object.assign(
        {
          level: info.level,
          [LEVEL]: info[LEVEL] || info['level'],
          message: info.stack,
          [MESSAGE]: info[MESSAGE] || info.stack,
          originError: info,
          stack: info.stack,
          pid: info.pid,
          LEVEL: info.LEVEL,
          defaultLabel: info.defaultLabel,
          ignoreFormat: info.ignoreFormat,
          ctx: null,
        },
        opts.defaultMeta || opts.target?.getDefaultMeta() || {}
      );
    }

    // error(new Error(''), {label: 1}) 的情况
    if (info.message['stack'] && info.message['message']) {
      const err = new Error(info.message['message']);
      err.name = info.message['name'];
      err.stack = info.message['stack'];
      info.originError = err;
      info.stack = info.message['stack'];
      info.message = err.stack;
      info[MESSAGE] = info[MESSAGE] || info.message;
    }

    // 处理数组，Map，Set 的 message
    if (
      Array.isArray(info.message) ||
      types.isSet(info.message) ||
      types.isMap(info.message)
    ) {
      info.message = inspect(info.message);
    }

    // error 参数在最后的情况
    if (info[SPLAT] && info[SPLAT].length > 0) {
      // err 位置不定
      const err = info[SPLAT].find(el => {
        return el instanceof Error;
      });
      if (err) {
        info.message = info.message.replace(err.message, '') + ' ' + err.stack;
        info[MESSAGE] = info[MESSAGE] || info.message + err.stack;
        info.originError = err;
        info.stack = err.stack;
      }
    }

    return Object.assign(
      info,
      opts.defaultMeta || opts.target?.getDefaultMeta() || {}
    );
  }
);

function joinLoggerLabel(labelSplit, ...labels) {
  if (labels.length === 0) {
    return '';
  } else {
    const newLabels = labels.filter(label => {
      return !!label;
    });
    if (newLabels.length === 0) {
      return '';
    } else {
      return `[${newLabels.join(labelSplit)}] `;
    }
  }
}

export const displayLabels = format((info, opts) => {
  opts.labelSplit = opts.labelSplit || ':';
  info.labelText = joinLoggerLabel(
    opts.labelSplit,
    info.defaultLabel,
    ...[].concat(info.label)
  );
  return info;
});
