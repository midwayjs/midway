exports.index = async (ctx) => {
  const context = ctx.requestContext
  const baseService = await context.getAsync('baseService')
  ctx.body = baseService.config.c + baseService.plugin2.text
}
