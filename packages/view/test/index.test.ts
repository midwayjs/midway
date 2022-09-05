import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { join } from 'path';
import { ContextView, ViewManager } from '../src';

describe('/test/index.test.ts', () => {

  it('should test create viewManager', async () => {
    let app = await createApp<Framework>(join(__dirname, 'fixtures', 'base-app'), {});
    let result = await createHttpRequest(app)
      .get('/render');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ejs');
    result = await createHttpRequest(app)
      .get('/renderString');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ejs');
    await close(app);
  });

  it('should test defaultExtension', async () => {
    let app = await createApp<Framework>(join(__dirname, 'fixtures', 'base-app-default'), {});
    let result = await createHttpRequest(app)
      .get('/render');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual(join(__dirname, 'fixtures', 'base-app-default/view/a.html'));
    await close(app);
  });

  it('should test context view', async () => {
    class CustomView {
      async render(name: string,
                   locals?: Record<string, any>,
                   options?: any) {
        return name;
      }
      async renderString(tpl: string,
                         locals?: Record<string, any>,
                         options?: any) {
        const text = locals.b();
        return tpl.replace('{{b}}', text);
      }
    }
    const manager = new ViewManager();
    manager.use('custom', CustomView);
    manager.addLocals('b', () => {
      return 'harry';
    });

    const view = new ContextView();
    view.viewManager = manager;
    view.ctx = {
      requestContext: {
        async getAsync() {
          return new CustomView();
        }
      }
    };

    const result = await view.renderString('hello {{b}}', {}, {
      viewEngine: 'custom'
    });

    expect(result).toEqual('hello harry');
  });
});
