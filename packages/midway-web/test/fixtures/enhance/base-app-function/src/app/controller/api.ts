'use strict';

import * as assert from 'assert';

exports.index = async (ctx, next) => {
  const b = ctx.proxy.baseService;
  assert(b);
  const context = ctx.requestContext;
  const baseService = await context.getAsync('baseService');

  assert(b.config.c === baseService.config.c);
  assert(b.config.d === baseService.config.d);
  assert(b.plugin2.text === baseService.plugin2.text);

  ctx.body = baseService.config.c + baseService.config.d + baseService.plugin2.text;
};
