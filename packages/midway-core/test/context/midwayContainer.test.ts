import { expect } from 'chai';

import * as path from 'path';
import { MidwayContainer } from '../../src';
import { App } from '../fixtures/ts-app-inject/app';
import { TestCons } from '../fixtures/ts-app-inject/test';

import { TestBinding, LifeCycleTest, LifeCycleTest1 } from '../fixtures/lifecycle';
import sinon = require('sinon');
import mm = require('mm');
import * as decs from '@midwayjs/decorator';
const { LIFECYCLE_IDENTIFIER_PREFIX } = decs;

describe('/test/context/midwayContainer.test.ts', () => {

  it('should scan app dir and inject automatic', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/ts-app-inject')
    });

    const origin = decs.getClassMetadata;

    mm(decs, 'getClassMetadata', (key, target) => {
      if (key === decs.CLASS_KEY_CONSTRUCTOR) {
        throw new Error('mock error');
      }
      return origin(key, target);
    });

    const tt = container.get<TestCons>('testCons');
    expect(tt.ts).gt(0);
    mm.restore();

    const app = container.get('app') as App;
    expect(app.loader).not.to.be.undefined;
    expect(app.getConfig().a).to.equal(3);
    // 其实这里循环依赖了
    expect(app.easyLoader.getConfig().a).to.equal(1);

    expect(container.getEnvironmentService()).is.not.undefined;
    expect(container.getEnvironmentService().getCurrentEnvironment()).eq('test');

    const subContainer = container.createChild();
    const sapp = subContainer.get('app') as App;
    expect(sapp.loader).not.to.be.undefined;
    expect(sapp.getConfig().a).to.equal(3);
  });

  describe('lifecycle case', () => {
    const container = new MidwayContainer();

    it('lifecycle should be ok', async () => {
      const cfg = container.createConfiguration();
      container.bind(TestBinding);
      cfg.bindConfigurationClass(LifeCycleTest);
      cfg.bindConfigurationClass(LifeCycleTest1);

      expect(container.isReady).false;
      await container.ready();
      expect(container.isReady).true;

      const aa = await container.getAsync<LifeCycleTest>(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest');
      expect(aa.ts).eq('hello');
      expect(aa.ready).true;
      // container.registerObject('hellotest111', '12312312');
      expect(container.get('hellotest111')).eq('12312312');

      const aa1 = await container.getAsync<LifeCycleTest1>(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest1');
      expect(aa1.tts).eq('hello');
      expect(aa1.ready).true;

      const callback = sinon.spy();
      mm(console, 'log', (m) => {
        callback(m);
      });

      expect(container.registry.hasObject(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest')).true;
      await container.stop();
      expect(container.registry.hasObject(LIFECYCLE_IDENTIFIER_PREFIX + 'lifeCycleTest')).false;
      expect(callback.withArgs('on stop').calledOnce).true;

      mm.restore();
    });
  });
});
