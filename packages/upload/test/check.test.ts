import { UploadMiddleware } from '../src';

describe('checkout white list', () => {

  describe('checkout ext white list', () => {
    let uploadMiddleware;

    beforeEach(() => {
      uploadMiddleware = new UploadMiddleware();
      uploadMiddleware.uploadConfig = {
        whitelist: ['.jpg', '.png', '.gif']
      };
      uploadMiddleware.init();
    });

    it('should return true and the extension if the file extension is in the whitelist', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test.jpg');
      expect(isPassed).toBe(true);
      expect(ext).toBe('.jpg');
    });

    it('should return false if the file extension is not in the whitelist', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test.pdf');
      expect(isPassed).toBe(false);
      expect(ext).toBeUndefined();
    });

    it('should return false if the filename has no extension', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test');
      expect(isPassed).toBe(false);
      expect(ext).toBeUndefined();
    });
  });

  describe('checkout ext white list with function', () => {
    let uploadMiddleware;

    beforeEach(() => {
      uploadMiddleware = new UploadMiddleware();
      uploadMiddleware.uploadConfig = {
        whitelist: (reqOrCtx) => ['.jpg', '.png', '.gif']
      };
      uploadMiddleware.init();
    });

    it('should return true and the extension if the file extension is in the whitelist', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test.jpg');
      expect(isPassed).toBe(true);
      expect(ext).toBe('.jpg');
    });

    it('should return false if the file extension is not in the whitelist', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test.pdf');
      expect(isPassed).toBe(false);
      expect(ext).toBeUndefined();
    });

    it('should return false if the filename has no extension', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test');
      expect(isPassed).toBe(false);
      expect(ext).toBeUndefined();
    });
  });

  describe('checkout ext white list with null', () => {
    let uploadMiddleware;

    beforeEach(() => {
      uploadMiddleware = new UploadMiddleware();
      uploadMiddleware.uploadConfig = {
        whitelist: null
      };
      uploadMiddleware.init();
    });

    it('should return true and the extension if the file has an extension', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test.jpg');
      expect(isPassed).toBe(true);
      expect(ext).toBe('.jpg');
    });

    it('should return true if the filename has no extension when set null', () => {
      const [isPassed, ext] = uploadMiddleware.checkAndGetExt({}, 'test');
      expect(isPassed).toBe(true);
      expect(ext).toBe('.');
    });
  });
});
