import { listPreloadModule, Autoload } from '../../src';

describe('/test/annotation/autoload.test.ts', () => {
  it('test preload key in module', () => {

    @Autoload()
    class LoadA {
    }
    @Autoload()
    class LoadB {
    }

    const modules = listPreloadModule();
    expect(modules.length).toEqual(2);
    expect(modules[0]).toEqual(LoadA);
    expect(modules[1]).toEqual(LoadB);
  });
});
