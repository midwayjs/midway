import { Application } from 'egg';
import * as assert from 'assert';
import { join } from 'path';

module.exports = (app: Application) => {
  assert(app.baseDir === __dirname);
  assert((app as any).appDir === join(__dirname, '..'));
  assert((app as any).applicationContext);
  app.createAnonymousContext().logger.warn('aaaaa');
}
