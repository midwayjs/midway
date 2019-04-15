import * as assert from 'assert';
import { formatOptions } from '../cluster/utils';

describe('/test/utils.test.js', () => {

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
