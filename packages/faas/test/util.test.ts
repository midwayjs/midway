import { createModuleServerlessFramework } from '../src';

describe('test/util.test.ts', () => {
  it('should test createModuleServerlessFramework', async () => {
    class A {}
    class B {}
    const framework = await createModuleServerlessFramework({
      preloadModules: [
        A,
        B
      ],
      configurationModule: {
        Configuration: {}
      }
    });
    expect(framework.getApplicationContext()).toBeDefined();
  });
});
