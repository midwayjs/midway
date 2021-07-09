import { createModuleServerlessFramework } from '../src';

describe('test/util.test.ts', () => {
  it('should test createModuleServerlessFramework', async () => {
    class A {}
    class B {}
    const framework = await createModuleServerlessFramework({
      modules: [
        A,
        B
      ],
      entry: {
        Configuration: {}
      }
    });
    expect(framework.getApplicationContext()).toBeDefined();
  });
});
