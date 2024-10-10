import { Catch, getClassMetadata, Match, CATCH_KEY, MATCH_KEY } from '../../../src';

class CustomError extends Error {}

@Catch(CustomError)
class Test {}

@Catch()
class TestGlobal {}

@Catch([CustomError], {
  matchPrototype: true,
})
class Test1 {}

@Match()
class Test2 {}

describe('/test/annotation/filter.test.ts', () => {
  it('test catch decorator', () => {
    const meta = getClassMetadata(CATCH_KEY, Test);
    expect(meta).toMatchSnapshot();

    const meta2 = getClassMetadata(CATCH_KEY, Test1);
    expect(meta2).toMatchSnapshot();
  });

  it('should test catch global', function () {
    const meta = getClassMetadata(CATCH_KEY, TestGlobal);
    expect(meta).toMatchSnapshot();
  });

  it('test match decorator', () => {
    const meta = getClassMetadata(MATCH_KEY, Test2);
    expect(meta).toMatchSnapshot();
  });
});
