import { format } from 'util';
import * as _ from 'lodash';
import { ObjectIdentifier,
  IConfiguration
} from '../interfaces';

export class BaseConfiguration implements IConfiguration {
  get size(): number {
    return 0;
  }

  keys(): ObjectIdentifier[] {
    return null;
  }

  get(key: ObjectIdentifier, ...args: any[]): any {
    return null;
  }

  dup(key: ObjectIdentifier): any {
    return null;
  }

  has(key: ObjectIdentifier): boolean {
    return false;
  }

  set(key: ObjectIdentifier, value: any): any {
    return null;
  }

  putAll(props: IConfiguration): void {

  }

  stringPropertyNames(): ObjectIdentifier[] {
    return this.keys();
  }

  getProperty(key: ObjectIdentifier, defaultValue?: any): any {
    if (this.has(key)) {
      return this.get(key);
    }

    return defaultValue;
  }

  addProperty(key: ObjectIdentifier, value: any): void {
    this.set(key, value);
  }

  setProperty(key: ObjectIdentifier, value: any): any {
    return this.set(key, value);
  }

  clear(): void { }

  toJSON(): Object {
    return null;
  }

  clone(): IConfiguration {
    return null;
  }
}

export class BasicConfiguration extends BaseConfiguration {
  private _config = new Map();
  get size(): number {
    return this._config.size;
  }

  keys(): ObjectIdentifier[] {
    const keys = [];
    const iter = this._config.keys();
    for (let key of iter) {
      keys.push(key);
    }
    return keys;
  }

  get(key: ObjectIdentifier, ...args: any[]): any {
    if (args && args.length > 0) {
      args.unshift(this._config.get(key));
      return format.apply(null, args);
    }
    return this._config.get(key);
  }

  dup(key: ObjectIdentifier): any {
    if (!this.has(key)) {
      return null;
    }
    return JSON.parse(JSON.stringify(this._config.get(key)));
  }

  has(key: ObjectIdentifier): boolean {
    return this._config.has(key);
  }

  set(key: ObjectIdentifier, value: any): any {
    const origin = this._config.get(key);
    this._config.set(key, value);
    return origin;
  }

  putAll(props: IConfiguration): void {
    const keys = props.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof this._config.get(key) === 'object') {
        this._config.set(key,
          _.defaultsDeep(props.get(key), this._config.get(key)));
      } else {
        this._config.set(key, props.get(key));
      }
    }
  }

  clear(): void {
    this._config.clear();
  }

  toJSON(): Object {
    const oo = {};
    for (let key of this._config.keys()) {
      oo[key] = JSON.parse(JSON.stringify(this._config.get(key)));
    }
    return oo;
  }
}

export class ObjectConfiguration extends BaseConfiguration {
  private _config = {};

  get size(): number {
    return this.keys().length;
  }

  keys(): ObjectIdentifier[] {
    return _.keys(this._config);
  }

  get(key: ObjectIdentifier, ...args: any[]): any {
    if (args && args.length > 0) {
      args.unshift(_.get(this._config, key));
      return format.apply(null, args);
    }
    return _.get(this._config, key);
  }

  dup(key: ObjectIdentifier): any {
    if (!this.has(key)) {
      return null;
    }
    return JSON.parse(JSON.stringify(_.get(this._config, key)));
  }

  has(key: ObjectIdentifier): boolean {
    return _.has(this._config, key);
  }

  set(key: ObjectIdentifier, value: any): any {
    const origin = this.get(key);
    _.set(this._config, key, value);
    return origin;
  }

  putAll(props: IConfiguration): void {
    const keys = props.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof this._config[key] === 'object') {
        this.set(key,
          _.defaultsDeep(props.get(key), this._config[key]));
      } else {
        this.set(key, props.get(key));
      }
    }
  }

  putObject(props: Object, needClone = false) {
    if (needClone) {
      const tmp = _.cloneDeep(props);
      _.defaultsDeep(tmp, this._config);
      this._config = tmp;
    } else {
      _.defaultsDeep(props, this._config);
      this._config = props;
    }
  }

  clear(): void {
    this._config = {};
  }

  toJSON(): Object {
    return JSON.parse(JSON.stringify(this._config));
  }

  clone(): IConfiguration {
    const cfg = new ObjectConfiguration();
    cfg.putObject(this.toJSON());
    return cfg;
  }
}
