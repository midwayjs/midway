import { expect } from 'chai';
import {
  ALL_VALUE,
  Body,
  File,
  Files,
  getPropertyDataFromClass,
  Headers,
  Param,
  Query,
  Session,
  WEB_ROUTER_PARAM_KEY,
} from '../../src';

class Test {
  async doget(
    @Param('aa') aa: any,
    @Query('bb') query: any,
    @Body('body') body: any,
    @Headers('tt') tt: any,
    @File({ requireFile: true }) f: any,
    @Files() files: any,
    @Session(ALL_VALUE) bb: any
  ) {}
}

describe('/test/web/paramMapping.test.ts', () => {
  it('paramMapping decorator should be ok', () => {
    const meta = getPropertyDataFromClass(WEB_ROUTER_PARAM_KEY, Test, 'doget');
    expect(meta.length).eq(7);
  });
});
