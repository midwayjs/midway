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
  Pipe,
  PipeTransform,
  Query,
  Session,
} from '../../../src';

@Pipe()
export class TestPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

function Token() {
  return createRequestParamDecorator(ctx => {
    return ctx.request.headers.token;
  }, [TestPipe]);
}

class Test {
  async doget(
    @Param('cc', ) cc: any,
    @Param('aa', [TestPipe]) aa: any,
    @Query('dd') dd: any,
    @Query('bb', [TestPipe]) query: any,
    @Body('body', [TestPipe]) body: any,
    @Headers('tt', [TestPipe]) tt: any,
    @File({ requireFile: true }, [TestPipe]) f: any,
    @Files() files: any,
    @Session(ALL, [TestPipe]) bb: any,
    @Token() token: any
  ) {}
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getClassMetadata(INJECT_CUSTOM_PARAM, Test);
    expect(meta).toMatchSnapshot();
  });
});
