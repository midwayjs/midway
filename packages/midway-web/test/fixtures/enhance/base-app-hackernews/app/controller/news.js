'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async list() {
    const { ctx, app } = this;
    const pageSize = app.config.news.pageSize;
    const page = parseInt(ctx.query.page) || 1;

    const idList = await ctx.service.hackerNews.getTopStories(page);

    // get itemInfo parallel
    const newsList = await Promise.all(idList.map(id => ctx.service.hackerNews.getItem(id)));
    await ctx.render('news/list.tpl', { list: newsList, page, pageSize });
  }

  async detail() {
    const { ctx } = this;
    const id = ctx.params.id;
    const newsInfo = await ctx.service.hackerNews.getItem(id);
    // get comment parallel
    const commentList = await Promise.all(newsInfo.kids.map(id => ctx.service.hackerNews.getItem(id)));
    await ctx.render('news/detail.tpl', { item: newsInfo, comments: commentList });
  }

  async user() {
    const { ctx } = this;
    const id = ctx.params.id;
    const userInfo = await ctx.service.hackerNews.getUser(id);
    await ctx.render('news/user.tpl', { user: userInfo });
  }
}

module.exports = NewsController;
