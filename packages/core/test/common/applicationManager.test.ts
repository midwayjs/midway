import { MidwayApplicationManager, BaseFramework, MidwayFrameworkType, MidwayMockService } from '../../src';

describe('test/common/applicationManager.test.ts', () => {
  it('should test application manager', async () => {
    const manager = new MidwayApplicationManager();
    const mockService = new MidwayMockService({} as any);

    class CustomFramework1 extends BaseFramework<any, any, any> {
      applicationInitialize(options): any {
        this.app = {};
      }

      configure(options: any): any {
        return {};
      }

      getFrameworkType() {
        return MidwayFrameworkType.EMPTY;
      }

      run(): Promise<void> {
        return Promise.resolve(undefined);
      }
    }

    const framework = new CustomFramework1({} as any);
    framework.mockService = mockService;
    await framework.initialize();

    manager.addFramework('test', framework);

    expect(manager.getApplication('test')).toBeDefined();
    expect(manager.getApplication(MidwayFrameworkType.EMPTY)).toBeDefined();
    expect(manager.getApplication('xxxx')).toBeUndefined();
    expect(manager.getApplications([MidwayFrameworkType.EMPTY, 'test', 'xxx']).length).toEqual(2);
  });
});
