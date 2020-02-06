
import { Resource } from '../../src/definitions/resource';
import { expect } from 'chai';
import sinon = require('sinon');

describe('/test/definitions/resource.test.ts', () => {
  it('resource test ok', async () => {
    const res = new Resource(__dirname, 'properties.test.ts');
    expect(res.isFile()).true;
    expect(res.name).eq('properties.test');

    const c = await res.getContent();
    expect(c).not.null;
    const relres = res.createRelative('resource.test.ts');
    expect(relres.isFile()).true;
    expect(relres.name).eq('resource.test');

    const res1 = new Resource(__dirname, '../common');
    expect(res1.isDir()).true;
    const reses = await res1.getSubResources();
    expect(reses.length).greaterThan(1);
    expect(reses[0].isFile()).true;
    const buf1 = await reses[0].getContent();
    expect(buf1).not.null;
  });

  it('dir resource test should ok', async () => {
    const res = new Resource(process.cwd(), '.');
    expect(res.getPath()).eq(process.cwd());
    expect(res.isDir()).true;
    const reses = await res.getSubResources();
    expect(reses.length).greaterThan(1);

    const callback = sinon.spy();
    try {
      await res.getContent();
    } catch (e) {
      callback(e.message);
    }
    try {
      await res.getContentAsJSON();
    } catch (e) {
      callback(e.message);
    }
    expect(callback.called).true;
    expect(callback.callCount).eq(2);
    expect(callback.lastCall.args[0]).eq(`${res.getPath()} is not a file!`);

    const rlres = res.createRelative('package.json');
    const c = await rlres.getContent();
    expect(c).not.null;
    expect(rlres.isFile());
    expect(rlres.getURL()).null;
    expect(await rlres.getContentAsJSON()).not.null;
    expect(await rlres.getSubResources()).deep.eq([]);
    expect(rlres.contentLength).greaterThan(0);
    expect(rlres.lastModified).greaterThan(0);
  });
  it('file resource not exist', async () => {
    const res = new Resource(null, 'http://www.hello.com/hhh/111');
    expect(res.getPath()).eq('http://www.hello.com/hhh/111');
    expect(res.isURL()).true;
    expect(res.getURL()).not.null;
    expect(res.contentLength).eq(0);
    expect(res.lastModified).eq(0);
    expect(res.name).null;
    // expect(await res.getContent()).null;
    // expect(await res.getContentAsJSON()).deep.eq({});
    // expect(await res.getSubResources()).deep.eq([]);
  });
});
