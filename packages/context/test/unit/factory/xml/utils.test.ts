import * as utils from '../../../../src/factory/xml/utils';
import { KEYS } from '../../../../src/factory/common/constants';
import { DOMParser } from 'xmldom';
import { expect } from 'chai';

const dom = `
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
</object>
`;

let doc = null;

describe('/test/unit/factory/xml/utils', () => {
  before(() => {
    doc = new DOMParser().parseFromString(dom);
  });
  it('utils test should ok', async () => {
    const ele = utils.firstSubElement(doc);
    expect(utils.nodeName(doc)).eq('');
    expect(ele).not.null;

    expect(utils.nodeAttr(ele, KEYS.PATH_ATTRIBUTE)).eq('obj1');
    expect(utils.nodeName(ele)).eq(KEYS.OBJECT_ELEMENT);
    expect(utils.nodeNameEq(ele, KEYS.OBJECT_ELEMENT)).true;
    expect(utils.nodeHasAttr(ele, KEYS.PATH_ATTRIBUTE)).true;
    expect(utils.nodeHasAttr(ele, KEYS.TYPE_ATTRIBUTE)).false;

    utils.eachSubElementSync(ele, (node: Element) => {
      expect(utils.nodeNameEq(node, KEYS.CONSTRUCTORARG_ELEMENT));
    });

    const cele = utils.firstSubElement(ele);

    await utils.eachSubElement(cele, async (node: Element) => {
      expect(utils.nodeText(node)).not.null;
    });
    expect(utils.firstCDATAText(cele)).eq('');

    const jsonele = utils.firstSubElement(cele);
    expect(utils.nodeNameEq(jsonele, KEYS.JSON_ELEMENT)).true;
    expect(utils.firstCDATAText(jsonele)).eq('{"foo": "{{foo.bar}}"}');
  });
});
