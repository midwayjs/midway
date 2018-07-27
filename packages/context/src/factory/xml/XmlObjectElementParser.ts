import { join } from 'path';
import * as utils from './utils';
import { KEYS, VALUE_TYPE } from '../common/constants';
import { ManagedValue,
  ManagedReference,
  ManagedJSON,
  ManagedObject,
  ManagedSet,
  ManagedMap,
  ManagedList,
  ManagedProperty,
  ManagedProperties} from '../common/managed';
import { ScopeEnum } from '../../base/Scope';
import {
  IObjectDefinition,
  IManagedInstance
} from '../../interfaces';
import { XmlObjectDefinition } from './XmlObjectDefinition';
import { IParserContext, IManagedParser } from './interface';

export class ManagedParser implements IManagedParser {
  protected factory: XmlObjectElementParser;

  constructor(factory: XmlObjectElementParser) {
    this.factory = factory;
  }

  get name(): string {
    throw new Error('ManagedParser not implement');
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    throw new Error('ManagedParser not implement');
  }
}

class JSONParser implements IManagedParser {
  get name(): string {
    return KEYS.JSON_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mjson = new ManagedJSON();
    mjson.value = utils.firstCDATAText(ele);
    return mjson;
  }
}

class RefParser implements IManagedParser {
  get name(): string {
    return KEYS.REF_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const ref = new ManagedReference();
    ref.name = utils.nodeAttr(ele, KEYS.OBJECT_ATTRIBUTE);
    return ref;
  }
}

class SetParser extends ManagedParser {
  get name(): string {
    return KEYS.SET_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const ms = new ManagedSet();
    utils.eachSubElementSync(ele, (node: Element) => {
      const vv = this.factory.parseElement(node, context);
      if (vv) {
        ms.add(vv);
      }
    });
    return ms;
  }
}

class ListParser extends ManagedParser {
  get name(): string {
    return KEYS.LIST_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const ml = new ManagedList();
    utils.eachSubElementSync(ele, (node: Element) => {
      const v = this.factory.parseElement(node, context);
      if (v) {
        ml.push(v);
      }
    });
    return ml;
  }
}

class MapParser extends ManagedParser {
  get name(): string {
    return KEYS.MAP_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mm = new ManagedMap();
    utils.eachSubElementSync(ele, (node: Element) => {
      if (!utils.nodeNameEq(node, KEYS.ENTRY_ELEMENT)) {
        return;
      }
      const key = utils.nodeAttr(node, KEYS.KEY_ATTRIBUTE);

      if (utils.nodeHasAttr(node, KEYS.VALUE_ATTRIBUTE)) {
        const v = new ManagedValue(utils.nodeAttr(node, KEYS.VALUE_ATTRIBUTE),
          utils.nodeAttr(node, KEYS.TYPE_ATTRIBUTE));
        mm.set(key, v);
      } else {
        const subEle = utils.firstSubElement(node);
        if (!subEle) {
          return;
        }
        const vv = this.factory.parseElement(subEle, context);
        if (vv) {
          mm.set(key, vv);
        }
      }
    });
    return mm;
  }
}

class ValueParser extends ManagedParser {
  get name(): string {
    return KEYS.VALUE_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mv = new ManagedValue(utils.nodeText(ele),
      utils.nodeAttr(ele, KEYS.TYPE_ATTRIBUTE));
    const vele = utils.firstSubElement(ele);
    if (vele) {
      mv.value = this.factory.parseElement(vele, context);
      mv.valueType = VALUE_TYPE.MANAGED;
    }
    return mv;
  }
}

class PropertyParser extends ManagedParser {
  get name(): string {
    return KEYS.PROPERTY_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mp = new ManagedProperty();
    mp.name = utils.nodeAttr(ele, KEYS.NAME_ATTRIBUTE);
    mp.valueType = VALUE_TYPE.MANAGED;

    if (utils.nodeHasAttr(ele, KEYS.VALUE_ATTRIBUTE)) {
      const mv = new ManagedValue(utils.nodeAttr(ele, KEYS.VALUE_ATTRIBUTE),
        utils.nodeAttr(ele, KEYS.TYPE_ATTRIBUTE));
      mp.value = mv;
    } else if (utils.nodeHasAttr(ele, KEYS.REF_ATTRIBUTE)) {
      const ref = new ManagedReference();
      ref.name = utils.nodeAttr(ele, KEYS.REF_ATTRIBUTE);
      mp.value = ref;
    } else {
      const subEle = utils.firstSubElement(ele);
      if (subEle) {
        mp.value = this.factory.parseElement(subEle, context);
      }
    }

    return mp;
  }
}

class PropsParser extends ManagedParser {
  get name(): string {
    return KEYS.PROPS_ELEMENT;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mprops = new ManagedProperties();
    utils.eachSubElementSync(ele, (node: Element) => {
      if (!utils.nodeNameEq(node, KEYS.PROP_ELEMENT)) {
        return;
      }
      const key = utils.nodeAttr(node, KEYS.KEY_ATTRIBUTE);

      if (utils.nodeHasAttr(node, KEYS.VALUE_ATTRIBUTE)) {
        const mv = new ManagedValue(utils.nodeAttr(node, KEYS.VALUE_ATTRIBUTE),
          utils.nodeAttr(node, KEYS.TYPE_ATTRIBUTE));
        mprops.set(key, mv);
        return;
      }

      const subEle = utils.firstSubElement(node);
      if (subEle) {
        const managed = this.factory.parseElement(subEle, context);
        if (managed) {
          mprops.set(key, managed);
        }
      } else {
        const mv = new ManagedValue(utils.nodeText(node),
          utils.nodeAttr(node, KEYS.TYPE_ATTRIBUTE));
        mprops.set(key, mv);
      }
    });
    return mprops;
  }
}

class ObjectParser extends ManagedParser {
  get name(): string {
    return KEYS.OBJECT_ELEMENT;
  }

  overwriteByContext(target: XmlObjectDefinition, ele: Element, context: IParserContext) {
    if (context.defaults) {
      if (target.path) {
        // 路径处理，外部依赖包要拼上node_modules
        if (!target.isExternal()) {
          // 拼上全路径
          target.path = join(context.defaults.path, target.path);
        } else {
          target.path = join(context.parser.baseDir, 'node_modules', target.path);
        }
      }
      if (!context.defaults.isAutowire() && !utils.nodeHasAttr(ele, KEYS.AUTOWIRE_ATTRIBUTE)) {
        target.autowire = context.defaults.isAutowire();
      }
      if (utils.nodeHasAttr(ele, KEYS.SCOPE_ATTRIBUTE)) {
        if (context.defaults.isSingletonScope()) {
          target.scope = ScopeEnum.Singleton;
        }
        if (context.defaults.isRequestScope()) {
          target.scope = ScopeEnum.Request;
        }
      }
    }
  }

  parseDefinition(ele: Element, context: IParserContext): IObjectDefinition {
    const definition = new XmlObjectDefinition(ele);
    // 属性重写
    this.overwriteByContext(definition, ele, context);

    utils.eachSubElementSync(ele, (node: Element) => {

      if (utils.nodeNameEq(node, KEYS.CONSTRUCTORARG_ELEMENT)) {
        // constructor-arg
        utils.eachSubElementSync(node, (snode: Element) => {
          const managed = this.factory.parseElement(snode, context);
          definition.constructorArgs.push(managed);
        });

      } else if (utils.nodeNameEq(node, KEYS.PROPERTY_ELEMENT)) {

        const name = utils.nodeAttr(node, KEYS.NAME_ATTRIBUTE);
        const managed = this.factory.parseElement(node, context);
        definition.properties.addProperty(name, managed);
      }
    });

    this._validDefinition(definition);

    return definition;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const mo = new ManagedObject();
    mo.name = utils.nodeAttr(ele, KEYS.ID_ATTRIBUTE);
    mo.definition = this.parseDefinition(ele, context);
    return mo;
  }

  private _validDefinition(definition: IObjectDefinition) {
    if (definition.isDirect()) {
      if (definition.hasConstructorArgs()) {
        throw new Error(`${definition.id}: direct object has no constructor-args element`);
      }
      if (definition.constructMethod || definition.initMethod) {
        throw new Error(`${definition.id}: direct object has no construct-method or init-method attribute`);
      }
    }
    if (definition.isAsync() && !definition.constructMethod) {
      throw new Error(`${definition.id}: async object has no construct-method attribute`);
    }
    if (definition.constructMethod && definition.initMethod) {
      throw new Error(`${definition.id}: object construct-method conflict with init-method attribute`);
    }
  }
}

export class XmlObjectElementParser {
  private parsers = new Map<string, IManagedParser>();

  constructor() {
    this.registerParser(new JSONParser());
    this.registerParser(new RefParser());
    this.registerParser(new ListParser(this));
    this.registerParser(new SetParser(this));
    this.registerParser(new MapParser(this));
    this.registerParser(new ValueParser(this));
    this.registerParser(new PropertyParser(this));
    this.registerParser(new PropsParser(this));
    this.registerParser(new ObjectParser(this));
  }

  registerParser(parser: IManagedParser) {
    this.parsers.set(parser.name, parser);
  }

  parseElement(ele: Element, context: IParserContext): IManagedInstance {
    const nodeName = utils.nodeName(ele);
    if (this.parsers.has(nodeName)) {
      return this.parsers.get(nodeName).parse(ele, context);
    }

    return null;
  }

  parse(ele: Element, context: IParserContext): IObjectDefinition {
    const managed = this.parseElement(ele, context);
    if (managed && managed.type === KEYS.OBJECT_ELEMENT) {
      return (<ManagedObject> managed).definition;
    }
    return null;
  }
}
