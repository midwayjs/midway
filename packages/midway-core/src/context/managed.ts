/**
 * 用于抽象描述的属性、json、ref、set、map等内容
 */

import { IManagedInstance } from '@midwayjs/decorator';
import { IObjectDefinition } from '../interface';
import { ObjectProperties } from '../definitions/properties';
import { KEYS, VALUE_TYPE } from '../common/constants';

export class ManagedValue implements IManagedInstance {
  type = KEYS.VALUE_ELEMENT;
  value: any;
  valueType: string;

  constructor(value?: any, valueType?: string) {
    this.value = value;
    this.valueType = valueType || VALUE_TYPE.STRING;
  }
}

export class ManagedReference implements IManagedInstance {
  type = KEYS.REF_ELEMENT;
  name: string;
}

export class ManagedJSON implements IManagedInstance {
  type = KEYS.JSON_ELEMENT;
  value: string;
}

export class ManagedList extends Array implements IManagedInstance {
  type = KEYS.LIST_ELEMENT;
}

export class ManagedSet extends Set implements IManagedInstance {
  type = KEYS.SET_ELEMENT;
}

export class ManagedMap extends Map implements IManagedInstance {
  type = KEYS.MAP_ELEMENT;
}

export class ManagedProperties extends ObjectProperties implements IManagedInstance {
  type = KEYS.PROPS_ELEMENT;
}

export class ManagedProperty implements IManagedInstance {
  type = KEYS.PROPERTY_ELEMENT;
  name: string;
  value: any;
  valueType: string;
}

export class ManagedObject implements IManagedInstance {
  type = KEYS.OBJECT_ELEMENT;
  name: string;
  definition: IObjectDefinition;
}
