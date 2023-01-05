import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import { CookieOptions } from 'express';

export const express = {
  contextLoggerFormat: info => {
    const req = info.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = req?.['session']?.['userId'] || '-';
    const traceId = req.traceId ?? '-';
    const use = Date.now() - info.ctx.startTime;
    const label =
      userId +
      '/' +
      req.ip +
      '/' +
      traceId +
      '/' +
      use +
      'ms ' +
      req.method +
      ' ' +
      req.url;
    return `${info.timestamp} ${info.LEVEL} ${info.pid} [${label}] ${info.message}`;
  },
};

export const cookieParser: {
  enable?: boolean;
  secret?: string | string[];
  options?: CookieOptions;
} = {
  enable: true,
};

export const bodyParser: {
  enable?: boolean;
  json?: OptionsJson & {
    enable?: boolean;
  };
  raw?: Options & {
    enable?: boolean;
  };
  text?: OptionsText & {
    enable?: boolean;
  };
  urlencoded?: OptionsUrlencoded & {
    enable?: boolean;
  };
} = {
  enable: true,
  json: {
    enable: true,
    limit: '1mb',
    strict: true,
  },
  raw: {
    enable: false,
    limit: '1mb',
  },
  text: {
    enable: true,
    limit: '1mb',
  },
  urlencoded: {
    enable: true,
    extended: false,
    limit: '1mb',
    parameterLimit: 1000,
  },
};
