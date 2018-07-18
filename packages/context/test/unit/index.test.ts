import {expect} from 'chai';
import {UserClass} from '../fixtures/UserClass';
const is = require('is-type-of');

class Textclass {

}

describe('/test/unit/index.test.ts', () => {
  it('should test is-type-of is.class method', () => {
    expect(is.class(Textclass)).to.be.true;
    expect(is.class(UserClass)).to.be.true;
  });
});
