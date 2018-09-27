exports.error = async (ctx, next) => {
  const context = ctx.app.applicationContext;
  const baseService = await context.getAsync('baseService');
  try {
    await baseService.sayError();
  } catch (e) {
    ctx.body = e.message;
    console.log('----', e);
    return;
  }

  ctx.body = 'error';
};