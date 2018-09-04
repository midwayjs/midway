import { BaseService } from './fixtures/base-app-decorator/src/lib/service';
import { mm } from '../src';

const path = require('path');
const assert = require('assert');
const fixtures = path.join(__dirname, 'fixtures');

describe('test/mock_container.test.ts', () => {
  describe('test base app decorator', () => {
    let container;
    before(() => {
      container = mm.container({
        baseDir: path.join(fixtures, 'base-app-decorator'),
        typescript: true
      });
    });
    after(() => container.stop());
    afterEach(mm.restore);

    it('should mock service success', async () => {
      const service = await container.getAsync(BaseService);
      mm.default(service, 'getData', async name => {
        return await new Promise(resolve => {
          setTimeout(() => {
            resolve(`hello ${name}`);
          }, 100);
        });
      });

      assert(await service.getData('nihao') === 'hello nihao');
      mm.restore();

      assert(service.getData() === 't10');
    });
  });

  describe('test js app xml', () => {
    let container;
    before(() => {
      container = mm.container({
        baseDir: path.join(fixtures, 'js-app-xml'),
        typescript: false,
        container: {
          disableAutoLoad: true
        }
      });

      return container.ready();
    });
    after(() => container.stop());
    afterEach(mm.restore);

    it('should test js app load success', async () => {
      const my: any = await container.getAsync('my');
      assert(my);
      assert(my.$$mytest);
      assert(my.$$mytest === 'this is my test');
      assert(my.$plugin2.text === 't');
    });
  });
});
