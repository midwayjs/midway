'use strict'

exports.index = async (ctx, next) => {
  const context = ctx.requestContext
  const baseService = await context.getAsync('baseService')
  ctx.body = baseService.config.c + baseService.config.d + baseService.plugin2.text
}
