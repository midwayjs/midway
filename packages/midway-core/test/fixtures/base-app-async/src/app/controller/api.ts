'use strict'

exports.index = async (ctx, next) => {
  const context = ctx.app.applicationContext
  const baseService = await context.getAsync('baseService')
  ctx.body = baseService.config.c + baseService.plugin2.text
}
