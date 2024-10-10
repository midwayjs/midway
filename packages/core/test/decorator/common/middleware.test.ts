import { Middleware, getObjectDefinition } from '../../../src';

@Middleware()
class CustomMiddleware {}

describe('/test/annotation/middleware.test.ts', () => {
  it('test middleware decorator', () => {
    const meta = getObjectDefinition(CustomMiddleware);
    expect(meta).toMatchSnapshot();
  });
});
