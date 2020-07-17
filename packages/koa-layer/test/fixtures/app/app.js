const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const assert = require('assert');
const router = new Router();

router.get('/get', (ctx, next) => {
  ctx.body = 'Hello World';
});

router.post('/post', (ctx, next) => {
  ctx.body = 'Hello World, post';
});

app.use(router.routes()).use(router.allowedMethods());

// app.listen(3000);

module.exports = app;
