import { expect } from 'chai';

import * as path from 'path';
import { MidwayContainer } from '../../src';
import { App } from '../fixtures/ts-app-inject/app';

import { UserService } from '../fixtures/complex_injection/userService';
import { UserController } from '../fixtures/complex_injection/userController';
import { A, B, DbAPI } from '../fixtures/complex_injection/dbAPI';
import sinon = require('sinon');
import mm = require('mm');
// import * as decs from '@midwayjs/decorator';

describe('/test/midwayContainer.test.ts', () => {

  it('should scan app dir and inject automatic', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, '../fixtures/ts-app-inject')
    });

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

  describe('dependency tree', () => {

    it('should generate dependency dot in requestContainer', async () => {
      const callback = sinon.spy();
      const Graph: any = require('graphviz/lib/deps/graph').Graph;
      mm(Graph.prototype, 'to_dot', () => {
        throw new Error('mock to_dot error');
      });
      mm(console, 'error', (msg, err) => {
        callback(msg + err);
      });

      const applicationContext = new MidwayContainer();
      await applicationContext.dumpDependency();

      expect(callback.withArgs('generate injection dependency tree fail, err = mock to_dot error').calledOnce).true;
      mm.restore();

      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      const newTree = await applicationContext.dumpDependency();
      expect(/userController/.test(newTree)).to.be.true;
      expect(/newKey\(DbAPI\)/.test(newTree)).to.be.true;
    });

    it('should skip empty properties', async () => {
      const applicationContext = new MidwayContainer();
      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      applicationContext.bind(A);
      applicationContext.bind(B);
      const newTree = await applicationContext.dumpDependency();
      expect(/userController/.test(newTree)).to.be.true;
      expect(/newKey\(DbAPI\)/.test(newTree)).to.be.true;
      expect(/"newKey" -> "b"/.test(newTree)).to.be.true;
    });

  });
});
