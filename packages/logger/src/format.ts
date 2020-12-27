import { format } from 'winston';
import { inspect, types } from 'util';
const { LEVEL, MESSAGE, SPLAT } = require('triple-beam');

export const displayCommonMessage = format((info, opts: {
  uppercaseLevel?: boolean;
  defaultMeta?: {[key: string]: any};
}) => {
  if (!info.pid) {
    info.pid = process.pid;
  }

  if (!info.LEVEL && opts.uppercaseLevel) {
    info.LEVEL = info.level.toUpperCase();
  }

  if (info instanceof Error) {
    // 参数只是 error 的情况
    return Object.assign({
      level: info.level,
      [LEVEL]: info[LEVEL] || info['level'],
      message: info.stack,
      [MESSAGE]: info[MESSAGE] || info.stack,
      originError: info,
      stack: info.stack,
      pid: info.pid,
      LEVEL: info.LEVEL,
    }, opts.defaultMeta);
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
    // 目前只会有一个 error，只会在最后一个参数
    const err = info[SPLAT][info[SPLAT].length - 1];
    if (err instanceof Error) {
      info.message = info.message.replace(err.message, '') + err.stack;
      info[MESSAGE] = info[MESSAGE] || info.message + err.stack;
      info.originError = err;
      info.stack = err.stack;
    }
  }

  return Object.assign(info, opts.defaultMeta);
});

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
    ...opts.defaultLabels,
    ...[].concat(info.label)
  );
  return info;
});
