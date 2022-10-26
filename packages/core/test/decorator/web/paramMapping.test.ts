import {
  ALL,
  Body,
  createRequestParamDecorator,
  File,
  Files,
  getClassMetadata,
  Headers,
  INJECT_CUSTOM_PARAM,
  Param,
  Query,
  Session,
} from '../../../src';

function Token() {
  return createRequestParamDecorator(ctx => {
    return ctx.request.headers.token;
  });
}

class Test {
  async doget(
    @Param('aa') aa: any,
    @Query('bb') query: any,
    @Body('body') body: any,
    @Headers('tt') tt: any,
    @File({ requireFile: true }) f: any,
    @Files() files: any,
    @Session(ALL) bb: any,
    @Token() token: any
  ) {}
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getClassMetadata(INJECT_CUSTOM_PARAM, Test);
    expect(meta).toMatchSnapshot();
  });
});
