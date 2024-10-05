import { MetadataManager, Pipe, SCOPE_KEY } from '../../../src';

describe('test/pipe.test.ts', () => {

  @Pipe()
  class TestPipe {}

  it('should test pipe decorator', function () {
    const meta = MetadataManager.getOwnMetadata(SCOPE_KEY, TestPipe);
    expect(meta).toMatchSnapshot();
  });
});
