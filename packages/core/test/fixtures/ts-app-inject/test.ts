import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class TestCons {
  constructor(@Config() aa: any) {
    // ignore
  }

  ts = Date.now();
}
