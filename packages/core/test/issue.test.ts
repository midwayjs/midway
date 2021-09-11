import { join } from 'path';
import { HomeController } from 'midway-test-component';
import { LightFramework } from '../src';

describe('/test/issue.test.ts', () => {
  it('should fix issue 1277', async () => {
    const framework = new LightFramework();
    framework.configure({});
    await framework.initialize({
      baseDir: join(
        __dirname,
        './fixtures/issue-1277/src'
      ),
    });
    const app = framework.getApplication();
    const homeController = await app.createAnonymousContext().requestContext.getAsync(HomeController);
    expect(homeController.bookService.ctx).toBeDefined();
  });
});
