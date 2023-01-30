import { getObjectDefinition, ISimulation, Mock, ScopeEnum } from '../../../src';

describe('test/mock.test.ts', () => {
  it('should test mock decorator', function () {

    @Mock()
    class TestMock implements ISimulation {
      enableCondition() {
        return process.env.NODE_ENV === 'local';
      }

      appSetup(): Promise<void> {
        return Promise.resolve(undefined);
      }
    }

    const def = getObjectDefinition(TestMock);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Singleton,
    });
  });
});
