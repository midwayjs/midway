import * as assert from 'assert';
import { join } from 'path';
import { Application } from 'egg';

module.exports = (app: Application) => {
  assert.ok(app.baseDir === __dirname);
  assert.ok((app as any).appDir === join(__dirname, '..'));
  assert.ok((app as any).applicationContext);
  app.createAnonymousContext().logger.warn('app aaaaa');
}
