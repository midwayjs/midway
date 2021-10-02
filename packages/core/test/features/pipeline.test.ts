import bindClass, { DataMainTest } from '../fixtures/pipeline';
import { MidwayContainer } from '../../src';

describe('/test/features/pipeline.test.ts', () => {
  const container = new MidwayContainer();

  it('pipeline should be ok', async () => {
    await container.ready();

    bindClass(container);

    const dataMainTest: DataMainTest = await container.getAsync<DataMainTest>('dataMainTest');

    expect(dataMainTest.ss).toBeDefined();

    let r = await dataMainTest.runParallel();
    expect(r).toBeDefined();
    expect(r).toBeDefined();
    expect(r.account).toStrictEqual({
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true
    });

    r = await dataMainTest.runSeries();
    expect(r.tab).toStrictEqual({
      title: 'test tab',
      tabId: 'firstTab',
      index: 0
    });

    let rArr = await dataMainTest.runConcat();
    expect(rArr[0]).toStrictEqual([{
      videoId: '123',
      videoUrl: 'https://www.taobao.com/xxx.mp4',
      videoTitle: 'test 1 video'
    }, {
      videoId: '234',
      videoUrl: 'https://www.taobao.com/xxx234.mp4',
      videoTitle: 'test 2 video'
    }, {
      videoId: '456',
      videoUrl: 'https://www.taobao.com/xxx456.mp4',
      videoTitle: 'test 3 video'
    }]);

    rArr = await dataMainTest.runSeriesConcat();
    expect(rArr[0]).toStrictEqual([{
      videoId: '123',
      videoUrl: 'https://www.taobao.com/xxx.mp4',
      videoTitle: 'test 1 video'
    }, {
      videoId: '234',
      videoUrl: 'https://www.taobao.com/xxx234.mp4',
      videoTitle: 'test 2 video'
    }, {
      videoId: '456',
      videoUrl: 'https://www.taobao.com/xxx456.mp4',
      videoTitle: 'test 3 video'
    }]);

    r = await dataMainTest.runWaterfall();
    expect(r).toStrictEqual({
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true
    });

    let rr = await dataMainTest.runError();
    expect(rr.success).toBeFalsy();
    expect(rr.error).toBeDefined();
    expect(rr.error.message).toEqual('this is error feeds');
    expect(rr.error.valveName).toEqual('errorFeeds');

    rr = await dataMainTest.runParallelError();
    expect(rr.success).toBeFalsy();
    expect(rr.error).toBeDefined();
    expect(rr.error.message).toEqual('this is error feeds');
    expect(rr.error.valveName).toEqual('errorFeeds');

    rr = await dataMainTest.runSeriesError();
    expect(rr.success).toBeFalsy();
    expect(rr.error).toBeDefined();
    expect(rr.error.message).toEqual('this is error feeds');
    expect(rr.error.valveName).toEqual('errorFeeds');

    const rw = await dataMainTest.runStagesWaterfall();
    expect(!rw.error).toBeTruthy();
    expect(rw.result).toEqual('stagetwo');
  });

});
