import { Destroy, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { MidwayContainer, MidwayLoggerService, MidwayConfigService, MidwayEnvironmentService, MidwayInformationService } from '../src';

class Parent {}

@Provide()
@Scope(ScopeEnum.Singleton)
class Test extends Parent {
  @Init()
  async init() {
    console.log('run');
  }

  get() {
    return 'hello world'
  }

  @Destroy()
  destroy() {}
}

describe('/test/init.test.ts', () => {
  it('test init method', async () => {
    const container = new MidwayContainer();
    container.bindClass(Test);
    const t = await container.getAsync(Test);
    // const t = Reflect.construct(Test, []);
    expect(t['init']).toBeDefined();

    container.bindClass(MidwayEnvironmentService);
    container.bindClass(MidwayInformationService);
    container.bindClass(MidwayConfigService);
    container.bindClass(MidwayLoggerService);

    container.registerObject('baseDir', '');
    container.registerObject('appDir', '');

    const loggerService = await container.getAsync(MidwayLoggerService);
    expect(loggerService['init']).toBeDefined();
  });
});
