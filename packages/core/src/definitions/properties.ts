import { ObjectIdentifier } from '@midwayjs/decorator';
import * as _ from '../common/lodashWrap';
import { format } from 'util';
import { IProperties } from '../interface';

export class ObjectProperties implements IProperties {
  private innerConfig: Map<ObjectIdentifier, any> = new Map();

  keys(): ObjectIdentifier[] {
    return Object.keys(this.innerConfig);
  }

  get(key: ObjectIdentifier, ...args: any[]): any {
    if (args && args.length > 0) {
      args.unshift(_.get(this.innerConfig, key));
      // eslint-disable-next-line prefer-spread
      return format.apply(null, args);
    }
    return _.get(this.innerConfig, key);
  }

  has(key: ObjectIdentifier): boolean {
    return this.innerConfig.has(key);
  }

  set(key: ObjectIdentifier, value: any): any {
    const origin = this.get(key);
    _.set(this.innerConfig, key, value);
    return origin;
  }

  clear(): void {
    this.innerConfig.clear();
  }

  toJSON(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(this.innerConfig));
  }
}
