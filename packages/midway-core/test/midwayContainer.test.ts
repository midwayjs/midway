import * as path from 'path';

import { expect } from 'chai';

import { MidwayContainer, MidwayHandlerKey } from '../src';

import { App } from './fixtures/ts-app-inject/app';
import { UserService } from './fixtures/complex_injection/userService';
import { UserController } from './fixtures/complex_injection/userController';
import { A, B, DbAPI } from './fixtures/complex_injection/dbAPI';


describe('/test/midwayContainer.test.ts', () => {

  it('should scan app dir and inject automatic', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, './fixtures/ts-app-inject'),
    });

    const app = container.get('app') as App;
    expect(app.loader).not.to.be.undefined;
    expect(app.getConfig().a).to.equal(3);
    // 其实这里循环依赖了
    expect(app.easyLoader.getConfig().a).to.equal(1);
  });

  it('should load js dir and inject with $', () => {
    const container = new MidwayContainer(undefined, undefined, false);
    container.load({
      loadDir: path.join(__dirname, './fixtures/js-app-inject'),
    });

    const app = container.get('app') as App;
    expect(app.getConfig().a).to.equal(1);
  });

  it('should load js app with xml', async () => {
    const container = new MidwayContainer(path.join(__dirname, './fixtures/js-app-xml'), undefined, false);
    container.configLocations = ['resources/main.xml'];

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    container.props.putObject(require('./fixtures/js-app-xml/config/config.default'));

    container.registerDataHandler(MidwayHandlerKey.CONFIG, (key) => {
      return container.props.get(key);
    });
    container.registerDataHandler(MidwayHandlerKey.PLUGIN, (key) => {
      return {
        text: 't',
      };
    });
    container.registerDataHandler(MidwayHandlerKey.LOGGER, (key) => {
      return console;
    });

    await container.ready();

    const my: any = container.get('my');
    expect(my).not.null;
    expect(my.$$mytest).not.null;
    expect(my.$$mytest).eq('this is my test');
    expect(my.$plugin2).deep.eq({ text: 't' });
  });

  describe('dependency tree', () => {

    it('should generate dependency dot in requestContainer', async () => {
      const applicationContext = new MidwayContainer();
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
