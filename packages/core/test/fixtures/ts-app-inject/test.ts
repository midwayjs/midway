import { Config, Provide } from '../../../src';

@Provide()
export class TestCons {
  @Config() aa: any;
  ts = Date.now();
}
