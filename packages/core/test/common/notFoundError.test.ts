import { NotFoundError } from '../../src/common/notFoundError';
import { expect } from 'chai';

describe('/test/common/notFoundError.test.ts', () => {
  it('should test not found error', function () {
    const creatNormalError = function(msg) {
      throw new Error(msg);
    };
    const creatNotFoundError = function(msg) {
      throw new NotFoundError(msg);
    };

    try {
      creatNormalError('');
    } catch (error) {
      expect(error).to.instanceOf(Error);
      expect(NotFoundError.isClosePrototypeOf(error)).to.false;
    }

    try {
      creatNotFoundError('');
    } catch (error) {
      expect(error).to.instanceOf(Error);
      expect(error).to.instanceOf(NotFoundError);
      expect(NotFoundError.isClosePrototypeOf(error)).to.true;
      expect(() => {
        throw error;
      }).to.throw(/is not valid in current context/);
    }

    try {
      creatNotFoundError('testKey');
    } catch (error) {
      expect(error).to.instanceOf(Error);
      expect(error).to.instanceOf(NotFoundError);
      expect(NotFoundError.isClosePrototypeOf(error)).to.true;
      error.updateErrorMsg('TestClass');
      expect(() => {
        throw error;
      }).to.throw('testKey in class TestClass is not valid in current context');
    }
  });
});
