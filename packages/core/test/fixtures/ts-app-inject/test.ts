import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class TestCons {
  @Config() aa: any;
  ts = Date.now();
}
