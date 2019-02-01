import { autowire, provide } from 'injection';

@provide()
@autowire(false)
export class GoogleAdapter {
  _hello = null;
}

@provide()
export class BaiduAdapter {
}
