import { DataListener, MidwayContainer } from '../../src';
import { Provide, Scope, ScopeEnum, sleep } from '@midwayjs/decorator';

describe('test/common/dataListener.test.ts', () => {

  @Provide()
  @Scope(ScopeEnum.Singleton)
  class TestDataListener extends DataListener<string> {
    initData() {
      return 'hello';
    }

    onData(setData) {
      setTimeout(() => {
        setData('hello1');
      }, 1000);
    }
  }

  it('should test service factory', async () => {
    const container = new MidwayContainer();
    container.bind(TestDataListener);
    const instance = await container.getAsync(TestDataListener);
    expect(instance.getData()).toEqual('hello');

    await sleep();
    expect(instance.getData()).toEqual('hello1');

    await container.stop();
  });

});
