import {
  MidwayFrameworkService,
  MidwayContainer,
  MidwayDecoratorService,
  Framework, MidwayApplicationManager, MidwayAspectService
} from '../../src';

describe('test/service/frameworkService.test.ts', () => {
  it('should register framework and get with namespace', async () => {
    @Framework()
    class CustomFramework {
      getFrameworkName() {
        return 'customFramework';
      }

      isEnable() {
        return false;
      }

      setNamespace(namespace: string) {
        console.log(namespace);
      }

      getApplication() {
        return 'app';
      }
    }

    @Framework()
    class CustomFramework2 {
      getFrameworkName() {
        return 'customFramework2';
      }

      isEnable() {
        return false;
      }

      setNamespace(namespace: string) {
        console.log(namespace);
      }
    }

    const container = new MidwayContainer();
    container.bind(CustomFramework, {
      namespace: 'customNamespace',
    });
    container.bind(CustomFramework2, {
      namespace: 'customNamespace2',
    });
    const frameworkService = new MidwayFrameworkService(container, {});
    frameworkService.decoratorService = new MidwayDecoratorService(container);
    frameworkService.applicationManager = new MidwayApplicationManager();
    frameworkService.aspectService = new MidwayAspectService(container);
    await frameworkService['init']();


    // get framework by name
    const framework = frameworkService.getFramework('customFramework');
    expect(framework).toBeInstanceOf(CustomFramework);
    const framework2 = frameworkService.getFramework('customFramework2');
    expect(framework2).toBeInstanceOf(CustomFramework2);

    // get framework by namespace
    const framework3 = frameworkService.getFramework('customNamespace');
    expect(framework3).toBeInstanceOf(CustomFramework);
    const framework4 = frameworkService.getFramework('customNamespace2');
    expect(framework4).toBeInstanceOf(CustomFramework2);

    expect(framework).toBe(framework3);
    expect(framework2).toBe(framework4);

    // main app
    const mainApp = frameworkService.getMainApp();
    expect(mainApp).toBe('app');
  });
});
