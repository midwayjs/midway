import * as assert from 'assert';
import { isDev, formatOptions } from '../cluster/utils';

describe('/test/utils.test.js', () => {
  it('#isDev', (done) => {
    const bak = process.env.NODE_ENV;
    process.env.NODE_ENV = 'unittest';
    const res = isDev();
    assert(res);
    process.env.NODE_ENV = bak;
    done();
  });

  it('#formatOptions', (done) => {
    const res = formatOptions({});
    assert.deepEqual(res, {
      framework: 'midway',
      baseDir: require('path').join(__dirname, '..'),
      typescript: true,
    });
    done();
  });

  it('#formatOptions', (done) => {
    const res = formatOptions({});
    assert.deepEqual(res, {
      framework: 'midway',
      baseDir: require('path').join(__dirname, '..'),
      typescript: true,
    });
    done();
  });

  it('#formatOptions, no typescript specify', (done) => {
    const res = formatOptions({});
    assert.deepEqual(res, {
      framework: 'midway',
      baseDir: require('path').join(__dirname, '..'),
      typescript: true,
    });
    done();
  });

  it('#formatOptions, get typescript with package.json', (done) => {
    const bak = require.extensions['.ts'];
    require.extensions['.ts'] = null;
    const res = formatOptions({
      baseDir: require('path').join(__dirname, '../../..'),
    });
    assert.equal(res.typescript, true);
    require.extensions['.ts'] = bak;
    done();
  });
});
