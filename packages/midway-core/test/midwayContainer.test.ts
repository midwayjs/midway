import {expect} from 'chai';
import {MidwayContainer} from '../src/container';
import {App} from './fixtures/ts-app-inject/app';
const path = require('path');

describe('/test/unit/midwayContainer.test.ts', () => {

  it('should scan app dir and inject automatic', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, './fixtures/ts-app-inject')
    });

    const app = <App>container.get('app');
    expect(app.loader).not.to.be.undefined;
    expect(app.getConfig().a).to.equal(3);
    // 其实这里循环依赖了
    expect(app.easyLoader.getConfig().a).to.equal(1);
  });

  it('should load js dir and inject with $', () => {
    const container = new MidwayContainer();
    container.load({
      loadDir: path.join(__dirname, './fixtures/js-app-inject')
    });

    const app = <App>container.get('app');
    expect(app.getConfig().a).to.equal(1);
  });

});
