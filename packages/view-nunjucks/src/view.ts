export class NunjucksView {

  ctx;
  app;

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    // this.viewHelper = new this.app.nunjucks.ViewHelper(ctx);
  }

  render(name, locals) {
    // locals.helper = this.viewHelper;
    return new Promise((resolve, reject) => {
      this.app.nunjucks.render(name, locals, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  renderString(tpl, locals, opts) {
    // locals.helper = this.viewHelper;
    return new Promise((resolve, reject) => {
      this.app.nunjucks.renderString(tpl, locals, opts, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}
