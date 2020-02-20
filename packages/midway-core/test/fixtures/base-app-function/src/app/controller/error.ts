exports.error = async (ctx, next) => {
  const context = ctx.app.applicationContext
  const baseService = await context.getAsync('baseService')
  try {
    await baseService.sayAuto()
  }
  catch (e) {
    ctx.body = e.message
    return
  }

  ctx.body = 'error'
}
