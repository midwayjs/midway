import {
  ALL,
  Body,
  createRequestParamDecorator,
  File,
  Files,
  Headers,
  INJECT_CUSTOM_PARAM,
  MetadataManager,
  Param,
  Pipe,
  PipeTransform,
  Query,
  Session
} from '../../../src';

@Pipe()
export class TestPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

@Pipe()
export class ErrorPipe implements PipeTransform {
  transform(value: any) {
    throw new Error('error');
  }
}

function Token() {
  return createRequestParamDecorator(ctx => {
    return ctx.request.headers.token;
  }, [TestPipe]);
}

function ErrorToken() {
  return createRequestParamDecorator(ctx => {
    return ctx.request.headers.token;
  }, {
    pipes: [ErrorPipe],
    throwError: true
  });
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

  async dogetError(@ErrorToken() token: any) {}
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = MetadataManager.getOwnPropertiesWithMetadata(INJECT_CUSTOM_PARAM, Test);
    expect(meta).toMatchSnapshot();
  });
});
