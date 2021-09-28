import { HomeController } from 'midway-test-component';
import { createLightFramework } from './util';
import { join } from 'path';

describe('/test/issue.test.ts', () => {
  it('should fix issue 1277', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/issue-1277/src'
    ));
    const app = framework.getApplication();
    const homeController = await app.createAnonymousContext().requestContext.getAsync(HomeController);
    expect(homeController.bookService.ctx).toBeDefined();
  });
});
