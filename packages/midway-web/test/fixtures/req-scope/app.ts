import KOAApplication from 'koa/lib/application';
import {Container, RequestContainer} from 'injection';
import Router = require('koa-router');
import {UserService} from './userService';
import {UserController} from './userController';

export class Application extends KOAApplication {

  container;

  constructor(props) {
    super(props);
    this.container = new Container();
    this.container.bind(UserService);
    this.container.bind(UserController);
  }

  handleRequest(ctx, fnMiddleware) {
    ctx.requestContext = new RequestContainer(ctx, this.container);
    return super.handleRequest(ctx, fnMiddleware);
  }

  loadRouter() {
    const newRouter = new Router();
    newRouter['get'].call(newRouter, 'hello', '/test', async (ctx, next) => {
      const controller = await ctx.requestContext.getObject('userController');
      controller['index'].bind(controller);
      await next();
    });
    this.use(newRouter.middleware());
  }
}
