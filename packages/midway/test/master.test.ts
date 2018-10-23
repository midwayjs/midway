import { cluster } from './utils';

describe('/test/master.test.js', () => {
  let app;

  it('should start cluster', (done) => {
    const bak = process.env.PLUGIN_PATH;
    process.env.PLUGIN_PATH = require('path').join(__dirname, '../../../../');
    app = cluster('apps/master-worker-started');
    app
      .expect('stdout', /midway start/)
      .expect('stdout', /midway started/)
      .expect('code', 0)
      .end(() => {
        process.env.PLUGIN_PATH = bak;
        done();
      });
  });
});
