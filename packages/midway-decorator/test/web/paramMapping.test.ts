
import { expect } from 'chai';
import { Param, Session, Query, Body, Headers, File, Files, WEB_ROUTER_PARAM_KEY, getPropertyDataFromClass } from '../../src';

class Test {
  async doget(@Param('aa')aa: any,
              @Query('bb') query: any,
              @Body('body') body: any,
              @Headers('tt') tt: any,
              @File({requireFile: true}) f: any,
              @Files() files: any,
              @Session() bb: any) {

  }
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getPropertyDataFromClass(WEB_ROUTER_PARAM_KEY, Test, 'doget');
    expect(meta.length).eq(7);
  });
});
