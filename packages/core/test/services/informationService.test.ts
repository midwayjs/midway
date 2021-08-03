import { join } from 'path';
import { MidwayInformationService } from '../../src';
import { getUserHome } from '../../src/util';

describe('/test/services/informationService.test.ts', () => {
  it('informationService should be ok', () => {
    process.env.NODE_ENV = 'local';
    const informationService = new MidwayInformationService({
      baseDir: join(__dirname, 'fixtures/default_case'),
      appDir: join(__dirname, 'fixtures/default_case'),
    });
    expect(informationService.getAppDir()).toEqual(join(__dirname, 'fixtures/default_case'));
    expect(informationService.getBaseDir()).toEqual(join(__dirname, 'fixtures/default_case'));
    expect(informationService.getHome()).toEqual(getUserHome());
    expect(informationService.getProjectName()).toEqual('test-demo');
    expect(informationService.getPkg()).toEqual({
      name: 'test-demo'
    });
    expect(informationService.getRoot()).toEqual(informationService.getAppDir());
    process.env.NODE_ENV = undefined;
  });

  it('should find appDir with dirname', () => {
    process.env.NODE_ENV = 'prod';
    const informationService = new MidwayInformationService({
      baseDir: join(__dirname, 'fixtures/default_case/src'),
    });
    expect(informationService.getAppDir()).toEqual(join(__dirname, 'fixtures/default_case'));
    expect(informationService.getBaseDir()).toEqual(join(__dirname, 'fixtures/default_case/src'));
    expect(informationService.getRoot()).toEqual(informationService.getHome());
    process.env.NODE_ENV = undefined;
  });
});
