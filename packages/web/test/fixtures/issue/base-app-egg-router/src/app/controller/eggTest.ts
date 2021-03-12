import { Controller } from 'egg';

export default class EggTestController extends Controller {
  public test() {
    this.ctx.body = {
      data: '中间件运行结果：' + this.ctx.test,
    };
  }
}
