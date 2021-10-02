import { NotFoundError } from '../../src/common/notFoundError';

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
      expect(error instanceof Error).toBeTruthy();
      expect(NotFoundError.isClosePrototypeOf(error)).toBeFalsy();
    }

    try {
      creatNotFoundError('');
    } catch (error) {
      expect(error instanceof Error).toBeTruthy();
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(NotFoundError.isClosePrototypeOf(error)).toBeTruthy();
      expect(() => {
        throw error;
      }).toThrow(/is not valid in current context/);
    }

    try {
      creatNotFoundError('testKey');
    } catch (error) {
      expect(error instanceof Error).toBeTruthy();
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(NotFoundError.isClosePrototypeOf(error)).toBeTruthy();
      error.updateErrorMsg('TestClass');
      expect(() => {
        throw error;
      }).toThrow('testKey in class TestClass is not valid in current context');
    }
  });
});
