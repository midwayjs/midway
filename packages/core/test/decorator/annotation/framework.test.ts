import { Framework, FRAMEWORK_KEY, getObjectDefinition, listModule } from '../../../src';

@Framework()
class CustomFramework {}

describe('/test/annotation/framework.test.ts', () => {
  it('test framework decorator', () => {
    const meta = getObjectDefinition(CustomFramework);
    expect(meta).toMatchSnapshot();

    const modules = listModule(FRAMEWORK_KEY);
    expect(modules.length).toEqual(1);
    expect(modules[0]).toEqual(CustomFramework);
  });
});
