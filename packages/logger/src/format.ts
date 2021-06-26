import { format } from 'winston';
import { IMidwayLogger } from './interface';

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
