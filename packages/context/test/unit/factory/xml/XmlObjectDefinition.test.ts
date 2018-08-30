import { XmlObjectDefinition }  from '../../../../src';
import * as utils from '../../../../src/factory/xml/utils';
import { DOMParser } from 'xmldom';
import { expect } from 'chai';

function parseStr(str: string): Element {
  const doc = new DOMParser().parseFromString(str);
  const ele = utils.firstSubElement(doc);
  return ele;
}

describe('/test/unit/factory/xml/XmlObjectDefinition.test.ts', () => {
  it('xml object should ok', () => {
    const s = `
    <object id="ctor:obj2" path="obj2" init-method="getInstance" destroy-method="close">
    </object>
    `;

    const ele = parseStr(s);
    const oo = new XmlObjectDefinition(ele);

    expect(oo.id).eq('ctor:obj2');
    expect(oo.path).eq('obj2');
    expect(oo.initMethod).eq('getInstance');
    expect(oo.destroyMethod).eq('close');
    expect(oo.isDirect()).false;
    expect(oo.isAsync()).false;
    expect(oo.isAutowire()).true;
    expect(oo.isExternal()).false;
    expect(oo.isSingletonScope()).true;


    const s1 = `
    <object id="ctor:obj1" path="obj1" external="true" construct-method="getInstance" destroy-method="close" scope="request" autowire="false">
    </object>
    `;

    const ele1 = parseStr(s1);
    const oo1 = new XmlObjectDefinition(ele1);

    expect(oo1.id).eq('ctor:obj1');
    expect(oo1.path).eq('obj1');
    expect(oo1.constructMethod).eq('getInstance');
    expect(oo1.initMethod).is.null;
    expect(oo1.destroyMethod).eq('close');
    expect(oo1.hasDependsOn()).false;
    expect(oo1.hasConstructorArgs()).false;
    expect(oo1.isDirect()).false;
    expect(oo1.isAsync()).false;
    expect(oo1.isAutowire()).false;
    expect(oo1.isExternal()).true;
    expect(oo1.isSingletonScope()).false;
    expect(oo1.isRequestScope()).true;

    const s2 = `
    <object id="ctor:obj2" path="obj1" export="hello" construct-method="getInstance" destroy-method="close" scope="prototype" autowire="true">
    </object>
    `;

    const ele2 = parseStr(s2);
    const oo2 = new XmlObjectDefinition(ele2);

    expect(oo2.id).eq('ctor:obj2');
    expect(oo2.path).eq('obj1');
    expect(oo2.constructMethod).eq('getInstance');
    expect(oo2.initMethod).is.null;
    expect(oo2.destroyMethod).eq('close');
    expect(oo2.hasDependsOn()).false;
    expect(oo2.hasConstructorArgs()).false;
    expect(oo2.export).eq('hello');
    expect(oo2.isDirect()).false;
    expect(oo2.isAsync()).false;
    expect(oo2.isAutowire()).true;
    expect(oo2.isExternal()).false;
    expect(oo2.isSingletonScope()).false;
    expect(oo2.isRequestScope()).false;
    oo2.setAttr('nihaoma', 'this is a test');
    expect(oo2.getAttr('nihaoma')).eq('this is a test');
  });
});
