'use strict';

import { MidwayCustomContextLogger } from '../logger';

export const keys = 'key';

export const hello = {
  a: 1,
  b: 2,
  d: [1, 2, 3],
};

export const midwayFeature = {
  replaceEggLogger: true,
}

export const egg = {
  BaseContextLoggerClass: MidwayCustomContextLogger
}
