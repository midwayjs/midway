import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import api, { post } from '.';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`
      Object {
        "message": "Hello World",
        "method": "GET",
      }
    `);
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot(`
      Object {
        "method": "POST",
        "name": "Jake",
      }
    `);
  });

  it('request', async () => {
    const response = await app.request(api).expect(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "Hello World",
        "method": "GET",
      }
    `);
  });
});
