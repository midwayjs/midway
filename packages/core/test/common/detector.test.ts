import { CommonJSFileDetector, MidwayDuplicateClassNameError, CustomModuleDetector, MidwayContainer } from '../../src';
import { join } from 'path';

describe('test/common/detector.test.ts', function () {
  it('should test file detector', async () =>  {
    const detector = new CommonJSFileDetector({
      loadDir: join(__dirname, './glob_dir'),
      pattern: '',
      ignore: '',
      namespace: 'test',
      conflictCheck: true,
    });
    const container = new MidwayContainer();
    await detector.run(container);
  });

  it('should test file detector with conflict', async () => {
    const detector = new CommonJSFileDetector({
      loadDir: join(__dirname, './glob_dir_conflict'),
      pattern: '',
      ignore: '',
      namespace: 'test',
    });
    detector.setExtraDetectorOptions({
      conflictCheck: true,
    });
    const container = new MidwayContainer();

    let err;
    try {
      await detector.run(container);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(MidwayDuplicateClassNameError);
  });

  it('should test module detector', function () {
    const detector = new CustomModuleDetector({
      modules: [
        class A {}
      ],
      namespace: 'test',
    });
    const container = new MidwayContainer();
    detector.run(container);
  });
});
