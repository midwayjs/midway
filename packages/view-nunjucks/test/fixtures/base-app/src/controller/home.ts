import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import * as fs from 'fs';
import * as path from 'path';

@Provide()
@Controller()
export class HomeController {

  @Inject()
  appDir: string;

  @Get('/')
  async render(ctx) {
    await ctx.render('home.tpl', { user: 'egg' });
  }

  @Get('/string')
  async renderString(ctx) {
    return ctx.renderString('hi, {{ user }}', { user: 'egg' });
  }

  @Get('/string_options')
  async string_options(ctx) {
    return ctx.renderString(
      fs.readFileSync(path.resolve(this.appDir, './view/layout.tpl')).toString(),
      { user: 'egg' },
      { path: path.resolve(this.appDir, './view/layout.tpl') }
    );
  }

  @Get('/inject')
  async inject(ctx) {
    await ctx.render('inject.tpl', { user: 'egg' });
  }

  @Get('/filter')
  async filter(ctx) {
    return ctx.renderString('{{ user | hello }}', { user: 'egg' });
  }

  @Get('/filter/include')
  async filter_include(ctx) {
    await ctx.render('include-test.tpl', { list: [ 'egg', 'yadan' ] });
  }

  @Get('/not_found')
  async not_found(ctx) {
    try {
      await ctx.render('not_found.tpl', {
        user: 'egg',
      });
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.toString();
    }
  }

  @Get('/locals')
  async locals(ctx) {
    ctx.locals = { b: 'ctx' };
    ctx.body = await ctx.renderString('{{ a }}, {{ b }}, {{ c }}', { c: 'locals' });
  }

  @Get('/error_string')
  async error_string(ctx) {
    try {
      ctx.body = await ctx.renderString('{{a');
    } catch (err) {
      ctx.status = 500;
      ctx.body = err;
    }
  }
}
