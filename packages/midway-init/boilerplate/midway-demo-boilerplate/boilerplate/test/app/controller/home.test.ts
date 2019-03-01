const { app, assert } = require('midway-mock/bootstrap');

describe('test/app/controller/home.test.ts', () => {

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('Welcome to midwayjs!')
      .expect(200);
  });
});
