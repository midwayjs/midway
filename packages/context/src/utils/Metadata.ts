import {NAMED_TAG} from './metaKeys';
import {TagPropsMetadata as DecoratorMeta} from '../interfaces';

class Metadata implements DecoratorMeta {

  public key: string | number | symbol;
  public value: any;

  public constructor(key: string | number | symbol, value: any) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === NAMED_TAG) {
      return `named: ${this.value.toString()} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${this.value} }`;
    }
  }
}

export { Metadata };
