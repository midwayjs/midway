import { getObjectDefinition, Pipe } from '../../../src';

describe('test/pipe.test.ts', () => {

  @Pipe()
  class TestPipe {}

  it('should test pipe decorator', function () {
    const meta = getObjectDefinition(TestPipe);
    expect(meta).toMatchSnapshot();
  });
});
