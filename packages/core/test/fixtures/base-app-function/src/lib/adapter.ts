import { Autowire, Provide } from '@midwayjs/decorator';

@Provide()
@Autowire(false)
export class GoogleAdapter {
  _hello = null;
}

@Provide()
export class BaiduAdapter {}
