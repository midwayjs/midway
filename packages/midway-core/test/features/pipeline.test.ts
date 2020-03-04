import bindClass, { DataMainTest } from '../fixtures/pipeline';
import { MidwayContainer } from '../../src';
import { expect } from 'chai';

describe('/test/features/pipeline.test.ts', () => {
  const container = new MidwayContainer();

  it('pipeline should be ok', async () => {
    await container.ready();

    bindClass(container);

    const dataMainTest: DataMainTest = await container.getAsync<DataMainTest>('dataMainTest');

    expect(dataMainTest.ss).not.null;
    expect(dataMainTest.ss).not.undefined;

    let r = await dataMainTest.runParallel();
    expect(r).is.not.null;
    expect(r).is.not.undefined;
    expect(r.account).deep.eq({
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true
    });

    r = await dataMainTest.runSeries();
    expect(r.tab).deep.eq({
      title: 'test tab',
      tabId: 'firstTab',
      index: 0
    });

    let rArr = await dataMainTest.runConcat();
    expect(rArr[0]).deep.eq([{
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
    expect(rArr[0]).deep.eq([{
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
    expect(r).deep.eq({
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true
    });

    let rr = await dataMainTest.runError();
    expect(rr.success).false;
    expect(rr.error).not.null;
    expect(rr.error).not.undefined;
    expect(rr.error.message).eq('this is error feeds');
    expect(rr.error.valveName).eq('errorFeeds');

    rr = await dataMainTest.runParallelError();
    expect(rr.success).false;
    expect(rr.error).not.null;
    expect(rr.error).not.undefined;
    expect(rr.error.message).eq('this is error feeds');
    expect(rr.error.valveName).eq('errorFeeds');

    rr = await dataMainTest.runSeriesError();
    expect(rr.success).false;
    expect(rr.error).not.null;
    expect(rr.error).not.undefined;
    expect(rr.error.message).eq('this is error feeds');
    expect(rr.error.valveName).eq('errorFeeds');

    const rw = await dataMainTest.runStagesWaterfall();
    expect(!rw.error).true;
    expect(rw.result).eq('stagetwo');
  });

});
