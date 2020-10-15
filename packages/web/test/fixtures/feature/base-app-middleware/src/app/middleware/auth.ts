export default (app) => {
  return async (ctx, next) => {
    ctx.oldData = 'egg_middleware';
    await next();
  }
}
