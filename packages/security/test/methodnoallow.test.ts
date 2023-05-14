import { createApp, createHttpRequest } from '@midwayjs/mock';

describe('test/methodnoallow.test.ts', () => {
  it('should test helper', async () => {
    const app = await createApp('methodnoallow');
    let result = await createHttpRequest(app).get('/ok');
    expect(result.status).toEqual(200);

    result = await createHttpRequest(app).trace('/ok');
    expect(result.status).toEqual(200);

    result = await createHttpRequest(app).trace('/notok');
    expect(result.status).toEqual(405);
  });
});
