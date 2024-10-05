import { MetadataManager, ISimulation, Mock, ScopeEnum, SCOPE_KEY } from '../../../src';

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

    const def = MetadataManager.getOwnMetadata(SCOPE_KEY, TestMock);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Singleton,
    });
  });
});
