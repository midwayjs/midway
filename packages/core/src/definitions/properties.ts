import { IProperties, ObjectIdentifier } from '../interface';

export class ObjectProperties
  extends Map<ObjectIdentifier, any>
  implements IProperties
{
  propertyKeys(): ObjectIdentifier[] {
    return Array.from(this.keys());
  }

  getProperty(key: ObjectIdentifier, defaultValue?: any): any {
    if (this.has(key)) {
      return this.get(key);
    }

    return defaultValue;
  }

  setProperty(key: ObjectIdentifier, value: any): any {
    return this.set(key, value);
  }
}
