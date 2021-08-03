import { NAMED_TAG } from '../constant';
import { TagPropsMetadata } from '../interface';

export class Metadata implements TagPropsMetadata {
  public key: string | number | symbol;
  public value: any;
  public args?: any;

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
