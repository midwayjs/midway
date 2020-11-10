import * as mm from 'mm';
import { join } from 'path';
mm(process.env, 'MIDWAY_PROJECT_APPDIR', join(__dirname, './fixtures/feature/base-app-use-custom-egg'));
import { closeApp, creatApp, createHttpRequest } from './utils';

describe('/test/custom.test.ts', () => {

  it('should run with custom egg framework', async () => {
    const app = await creatApp('feature/base-app-use-custom-egg');
    const result = await createHttpRequest(app)
      .get('/')
      .query({ name: 'harry' });
    expect(result.text).toEqual('hello world harry');
    await closeApp(app);
    mm.restore();
  });
});
