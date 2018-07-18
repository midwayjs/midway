import * as path from 'path';
import * as fs from 'fs';
import { DOMParser } from 'xmldom';

let doc = null;

describe('xmltest', () => {
  before(() => {
    const buf = fs.readFileSync(path.resolve(__dirname, '../../../fixtures/resources/construction.xml'));
    doc = new DOMParser().parseFromString(buf.toString());
  });

  it('#xml test should ok', () => {
    console.log(doc.localName, doc.nodeName, doc.documentElement.childNodes.item(5).nodeName, doc.documentElement.childNodes.item(5).localName, doc.documentElement.childNodes.item(5).textContent);


    const tt = `
    <value type="date">
      llll
    </value>
    `;

    const dd = new DOMParser().parseFromString(tt);
    for (let i = 0; i < dd.childNodes.length; i++) {
      const ele = dd.childNodes.item(i);
      if (ele.nodeType === 1) {
        console.log(ele.textContent);
        for (let j = 0; j < ele.childNodes.length; j++) {
          console.log(ele.childNodes.item(j).nodeName, ele.childNodes.item(j).nodeType, ele.childNodes.item(j).textContent);
        }
      }
    }
  });
});
