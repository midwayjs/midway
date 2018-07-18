import { KEYS, VALUE_TYPE } from '../../../../src/factory/common/constants';
import { XmlObjectElementParser } from '../../../../src/factory/xml/XmlObjectElementParser';
import { ParserContext, XmlObjectDefinitionParser } from '../../../../src/factory/xml/XmlObjectDefinitionParser';
import * as utils from '../../../../src/factory/xml/utils';
import { DOMParser } from 'xmldom';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  ManagedJSON,
  ManagedReference,
  ManagedSet,
  ManagedValue,
  ManagedList,
  ManagedMap,
  ManagedObject,
  ManagedProperty,
  ManagedProperties
} from '../../../../src/factory/common/managed';
import { IManagedInstance } from '../../../../src/interfaces';

let parser: XmlObjectElementParser;

function parseStr(str: string): IManagedInstance {
  const doc = new DOMParser().parseFromString(str);
  const ele = utils.firstSubElement(doc);
  return parser.parseElement(ele, new ParserContext(null,
    new XmlObjectDefinitionParser(process.cwd(), null)));
}

describe('/test/unit/factory/xml/XmlObjectElementParser', () => {
  before(() => {
    parser = new XmlObjectElementParser();
  });
  it('json parser should be ok', () => {
    const json = `
    <json>
      <![CDATA[
      {"foo": "{{foo.bar}}"}
      ]]>
    </json>
    `;
    const managed = parseStr(json);
    expect(managed.type).eq(KEYS.JSON_ELEMENT);
    const mj = <ManagedJSON>managed;
    expect(mj.value).not.null;
    expect(mj.value).eq('{"foo": "{{foo.bar}}"}');
  });
  it('ref parser should be ok', () => {
    const ref = `
    <ref object="ctor:obj4"></ref>
    `;
    const managed = parseStr(ref);
    expect(managed.type).eq(KEYS.REF_ELEMENT);
    const mj = <ManagedReference>managed;
    expect(mj.name).not.null;
    expect(mj.name).eq('ctor:obj4');
  });
  it('set parser should be ok', () => {
    const set = `
      <set>
        <value type="int">10</value>
        <value>10i</value>
        <value type="date">1523678271683</value>
        <ref object="obj:foo"></ref>
        <ref object="obj:bar"></ref>
      </set>
    `;
    const managed = parseStr(set);
    expect(managed.type).eq(KEYS.SET_ELEMENT);
    const ms = <ManagedSet>managed;
    expect(ms.size).greaterThan(1);
    const arr = Array.from(ms);

    const one = <ManagedValue>arr[0];
    expect(one.type).eq(KEYS.VALUE_ELEMENT);
    expect(one.valueType).eq(VALUE_TYPE.INTEGER);
    expect(one.value).eq('10');

    const three = <ManagedValue>arr[2];
    expect(three.type).eq(KEYS.VALUE_ELEMENT);
    expect(three.valueType).eq(VALUE_TYPE.DATE);

    const four = <ManagedReference>arr[3];
    expect(four.type).eq(KEYS.REF_ELEMENT);
    expect(four.name).eq('obj:foo');
  });
  it('list parser should be ok', () => {
    const list = `
    <list>
      <value type="int">10</value>
      <value>10i</value>
      <value type="date">1523678271683</value>
      <ref object="obj:foo"></ref>
      <ref object="obj:bar"></ref>
    </list>
    `;
    const managed = parseStr(list);
    expect(managed.type).eq(KEYS.LIST_ELEMENT);
    const ms = <ManagedList>managed;
    expect(ms.length).greaterThan(1);
    const arr = ms;

    const one = <ManagedValue>arr[0];
    expect(one.type).eq(KEYS.VALUE_ELEMENT);
    expect(one.valueType).eq(VALUE_TYPE.INTEGER);
    expect(one.value).eq('10');

    const three = <ManagedValue>arr[2];
    expect(three.type).eq(KEYS.VALUE_ELEMENT);
    expect(three.valueType).eq(VALUE_TYPE.DATE);

    const four = <ManagedReference>arr[3];
    expect(four.type).eq(KEYS.REF_ELEMENT);
    expect(four.name).eq('obj:foo');
  });
  it('map parser should ok', () => {
    const map = `
    <map>
      <entry key="foo" value="bar" />
      <entry key="foo1" value="10" type="int" />
      <entry key="foo2">
        <object>
          <property name="a" value="b" />
        </object>
      </entry>
    </map>
    `;
    const managed = parseStr(map);
    expect(managed.type).eq(KEYS.MAP_ELEMENT);
    const mp = <ManagedMap>managed;
    expect(mp.get('foo').type).eq(KEYS.VALUE_ELEMENT);
    expect(mp.get('foo2').type).eq(KEYS.OBJECT_ELEMENT);

    const mo = <ManagedObject>mp.get('foo2');
    expect(mo.name).eq('');
    expect(mo.definition.id).eq('');
    expect(mo.definition.properties.size).greaterThan(0);
    expect(mo.definition.properties.getProperty('a').type).eq(KEYS.PROPERTY_ELEMENT);
    const mpt = <ManagedProperty>mo.definition.properties.getProperty('a');
    expect(mpt.value.type).eq(KEYS.VALUE_ELEMENT);
    expect(mpt.valueType).eq(VALUE_TYPE.MANAGED);

    const mpv = <ManagedValue>mpt.value;
    expect(mpv.valueType).eq(VALUE_TYPE.STRING);
  });
  it('value parser should ok', () => {
    const v1 = `
    <value type="int">123</value>
    `;

    const managed1 = <ManagedValue>parseStr(v1);
    expect(managed1.valueType).eq(VALUE_TYPE.INTEGER);

    const v2 = `<value>
      <json>
        <![CDATA[
        {"foo": "{{foo.bar}}"}
        ]]>
      </json>
    </value>`;
    const managed2 = <ManagedValue>parseStr(v2);
    expect(managed2.valueType).eq(VALUE_TYPE.MANAGED);
    expect(managed2.value.type).eq(KEYS.JSON_ELEMENT);
  });
  it('property parser should ok', () => {
    const s1 = `
    <property name="a" value="b" />
    `;
    const mp1 = <ManagedProperty>parseStr(s1);
    expect(mp1.value.type).eq(KEYS.VALUE_ELEMENT);
    expect(mp1.value.value).eq('b');

    const s2 = `
    <property name="a" ref="foo" />
    `;
    const mp2 = <ManagedProperty>parseStr(s2);
    expect(mp2.value.type).eq(KEYS.REF_ELEMENT);
    expect(mp2.value.name).eq('foo');

    const s3 = `
    <property name="a">
      <value type="int">10</value>
    </property>
    `;
    const mp3 = <ManagedProperty>parseStr(s3);
    expect(mp3.value.type).eq(KEYS.VALUE_ELEMENT);
    expect(mp3.value.value).eq('10');
    expect(mp3.value.valueType).eq('int');
  });
  it('props parser should ok', () => {
    const s = `
    <property name="addressProp">
      <props>
        <prop key="one">INDIA</prop>
        <prop key="two">Pakistan</prop>
        <prop key="three">USA</prop>
        <prop key="four">USA</prop>
      </props>
    </property>
    `;

    const prop = <ManagedProperty>parseStr(s);
    expect(prop.value.type).eq(KEYS.PROPS_ELEMENT);

    const props = <ManagedProperties>prop.value;
    const p1 = <ManagedValue>props.getProperty('one');
    expect(p1.value).eq('INDIA');

    const p2 = <ManagedValue>props.getProperty('two');
    expect(p2.value).eq('Pakistan');

    const p3 = <ManagedValue>props.getProperty('three');
    expect(p3.value).eq('USA');
  });
  it('object parser should ok', () => {
    const s = `
    <object id="ctor:obj1" path="obj1">
      <constructor-arg>
        <json>
          <![CDATA[
          {"foo": "{{foo.bar}}"}
          ]]>
        </json>
        <!-- object as ref -->
        <ref object="ctor:obj4"></ref>
        <!-- new object as param -->
        <object id="ctor:obj5" path="obj5"></object>
      </constructor-arg>
      <property name="k1" value="v1"></property>
      <property name="num" value="1" type="number" />
      <property name="things">
        <list>
          <value>asdfa</value>
          <value>123</value>
        </list>
      </property>
    </object>
    `;

    const managed = <ManagedObject>parseStr(s);
    expect(managed.name).eq('ctor:obj1');
    expect(managed.definition.id).eq('ctor:obj1');
    expect(managed.definition.constructorArgs.length).eq(3);
    expect(managed.definition.properties.size).eq(3);
    const json = <ManagedJSON>managed.definition.constructorArgs[0];
    expect(json.value).eq('{"foo": "{{foo.bar}}"}');

    const ref = <ManagedReference>managed.definition.constructorArgs[1];
    expect(ref.name).eq('ctor:obj4');
    const p = <ManagedProperty>managed.definition.properties.getProperty('k1');
    expect(p.value.type).eq(KEYS.VALUE_ELEMENT);
    expect(p.value.value).eq('v1');

    const pl = <ManagedProperty>managed.definition.properties.getProperty('things');
    const plv = <ManagedList>pl.value;
    expect(plv.type).eq(KEYS.LIST_ELEMENT);
    expect(plv[0].value).eq('asdfa');
    expect(plv[1].value).eq('123');


    const se1 = `
    <object id="ctor:obj1" path="obj1" direct="true">
      <constructor-arg>
        <json>
          <![CDATA[
          {"foo": "{{foo.bar}}"}
          ]]>
        </json>
        <!-- object as ref -->
        <ref object="ctor:obj4"></ref>
        <!-- new object as param -->
        <object id="ctor:obj5" path="obj5"></object>
      </constructor-arg>
    </object>
    `;
    const call1 = sinon.spy();
    try {
      parseStr(se1);
    } catch(e) {
      call1(e.message);
    }
    expect(call1.calledOnce).true;
    expect(call1.calledWith('ctor:obj1: direct object has no constructor-args element')).true;

    const se2 = `
    <object id="ctor:obj1" path="obj1" direct="true" construct-method="test1">
    </object>
    `;

    const call2 = sinon.spy();
    try {
      parseStr(se2);
    } catch(e) {
      call2(e.message);
    }
    expect(call2.calledOnce).true;
    expect(call2.calledWith('ctor:obj1: direct object has no construct-method or init-method attribute')).true;

    const se3 = `
    <object id="ctor:obj1" path="obj1" async="true" init-method="test1">
    </object>
    `;

    const call3 = sinon.spy();
    try {
      parseStr(se3);
    } catch(e) {
      call3(e.message);
    }
    expect(call3.calledOnce).true;
    expect(call3.calledWith('ctor:obj1: async object has no construct-method attribute')).true;

    const se4 = `
    <object id="ctor:obj1" path="obj1" init-method="test2" construct-method="test1">
    </object>
    `;

    const call4 = sinon.spy();
    try {
      parseStr(se4);
    } catch(e) {
      call4(e.message);
    }
    expect(call4.calledOnce).true;
    expect(call4.calledWith('ctor:obj1: object construct-method conflict with init-method attribute')).true;
  });
});
