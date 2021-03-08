const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const assert = require('assert');
const router = new Router();
const bodyParser = require('koa-bodyparser');

router.get('/get', (ctx, next) => {
  ctx.type = 'html';
  ctx.body = 'Hello World';
});

router.get('/get/query', (ctx, next) => {
  ctx.body = {
    query: ctx.query,
  };
});

router.post('/post', (ctx, next) => {
  ctx.body = 'Hello World, post';
});

router.post('/post/body', (ctx, next) => {
  ctx.body = {
    body: ctx.request.body,
  };
});

router.post('/post/formBody', (ctx, next) => {
  ctx.body = {
    body: ctx.request.body,
  };
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

// app.listen(3000);

module.exports = async () => {
  return app;
};
