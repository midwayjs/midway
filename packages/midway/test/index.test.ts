import { expect } from 'chai';
import * as midway from '../src';

import * as path from 'path';
const _ROOT = path.join(__dirname, '../');

describe('/test/index.test.ts', () => {
  it('should get framework version', function () {
    expect(midway.VERSION).to.equal(require(_ROOT + '/package.json').version);
  });

  it('should get framework release name', function () {
    expect(midway.RELEASE).to.exist;
  });

});
