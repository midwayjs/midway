import {
  ALL,
  Body,
  File,
  Files,
  Headers,
  Param,
  Query,
  Session,
  getClassMetadata,
  INJECT_CUSTOM_PARAM
} from '../../src';

class Test {
  async doget(
    @Param('aa') aa: any,
    @Query('bb') query: any,
    @Body('body') body: any,
    @Headers('tt') tt: any,
    @File({ requireFile: true }) f: any,
    @Files() files: any,
    @Session(ALL) bb: any
  ) {}
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getClassMetadata(INJECT_CUSTOM_PARAM, Test);
    expect(meta).toMatchSnapshot();
  });
});
