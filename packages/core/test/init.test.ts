import { Destroy, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { MidwayContainer, MidwayLoggerService, MidwayConfigService, MidwayEnvironmentService, MidwayInformationService } from '../src';
import { MidwayAspectService } from '../src/service/aspectService';

class Parent {}

@Provide()
@Scope(ScopeEnum.Singleton)
class Test extends Parent {
  @Init()
  async init() {
    console.log('run');
  }

  @Destroy()
  destroy() {}
}

describe('/test/index.test.ts', () => {
  it('test init method', async () => {
    const container = new MidwayContainer();
    container.bindClass(Test);
    const t = await container.getAsync(Test);
    console.log(t['init']);

    container.bindClass(MidwayEnvironmentService);
    container.bindClass(MidwayInformationService);
    container.bindClass(MidwayConfigService);
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayLoggerService);

    container.registerObject('baseDir', '');
    container.registerObject('appDir', '');

    const loggerService = await container.getAsync(MidwayLoggerService);
    console.log(loggerService['init']);
  });
});
