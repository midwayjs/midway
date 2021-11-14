import { Provide } from '@midwayjs/decorator';

@Provide()
export class GoogleAdapter {
  _hello = null;
}

@Provide()
export class BaiduAdapter {}
