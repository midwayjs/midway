import { join } from 'path';
import { MidwayInformationService, MidwayContainer } from '../../src';
import { getUserHome } from '../../src/util';

describe('/test/services/informationService.test.ts', () => {
  it('informationService should be ok', async() => {
    process.env.NODE_ENV = 'local';
    const container = new MidwayContainer();
    container.bindClass(MidwayInformationService);

    container.registerObject('baseDir', join(__dirname, 'fixtures/default_case'));
    container.registerObject('appDir', join(__dirname, 'fixtures/default_case'));

    const informationService = await container.getAsync(MidwayInformationService);
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

  it('should find appDir with dirname', async () => {
    process.env.NODE_ENV = 'prod';
    const container = new MidwayContainer();
    container.bindClass(MidwayInformationService);

    container.registerObject('baseDir', join(__dirname, 'fixtures/default_case/src'));
    container.registerObject('appDir', '');
    const informationService = await container.getAsync(MidwayInformationService);
    expect(informationService.getAppDir()).toEqual(join(__dirname, 'fixtures/default_case'));
    expect(informationService.getBaseDir()).toEqual(join(__dirname, 'fixtures/default_case/src'));
    expect(informationService.getRoot()).toEqual(informationService.getHome());
    process.env.NODE_ENV = undefined;
  });
});
