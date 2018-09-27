import {provide} from 'injection';
import { autowire } from 'injection';

@provide()
@autowire(false)
export class GoogleAdapter {
  _hello = null;
}

@provide()
export class BaiduAdapter {
}

