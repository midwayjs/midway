import { Provide, Inject, Pipeline } from '@midwayjs/decorator';
import { IMidwayContainer, IValveHandler, IPipelineContext, MidwayPipelineService, IPipelineHandler } from '../../src';

class VideoDto {
  videoId: string;
  videoUrl: string;
  videoTitle: string;
}
class AccountDto {
  id: string;
  nick: string;
  isFollow: boolean;
}
class TabDto {
  tabId: string;
  title: string;
  index: number;
}
interface HomepageDto {
  videos: VideoDto[];
  account: AccountDto;
  tab: TabDto;
}

@Provide('service')
class TestService {
  async getAccount(args: any): Promise<AccountDto> {
    return {
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true,
    };
  }

  async getVideos(args: any): Promise<VideoDto[]> {
    return [{
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
    }];
  }

  async getTab(args: any): Promise<TabDto> {
    return {
      title: 'test tab',
      tabId: 'firstTab',
      index: 0
    };
  }
}

@Provide()
class VideoFeeds implements IValveHandler {
  alias = 'videos';

  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<VideoDto[]> {
    return this.service.getVideos(ctx.args);
  }
}

@Provide()
class AccountMap implements IValveHandler {
  alias = 'account';

  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<AccountDto> {

    // 获取数据执行逻辑
    return this.service.getAccount(ctx.args);
  }
}

@Provide()
class CrowFeeds implements IValveHandler {
  alias = 'tab';
  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<TabDto> {
    // 获取数据执行逻辑
    return this.service.getTab(ctx.args);
  }
}

@Provide()
class ErrorFeeds implements IValveHandler {
  alias = 'tab';
  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<TabDto> {
    // 获取数据执行逻辑
    throw new Error('this is error feeds');
  }
}

@Provide()
class StageOne implements IValveHandler {
  async invoke(ctx: IPipelineContext): Promise<any> {
    if (ctx.args.aa !== 123) {
      throw new Error('args aa is undefined');
    }
    ctx.set('stageone', 'this is stage one');
    ctx.set('stageone_date', Date.now());
    if (ctx.info.current !== 'stageOne') {
      throw new Error('current stage is not stageOne');
    }
    if (ctx.info.next !== 'stageTwo') {
      throw new Error('next stage is not stageTwo');
    }
    if (ctx.info.prev) {
      throw new Error('stageOne prev stage is not undefined');
    }

    return 'stageone';
  }
}

@Provide()
class StageTwo implements IValveHandler {
  async invoke(ctx: IPipelineContext): Promise<any> {
    const keys = ctx.keys();
    if (keys.length !== 2) {
      throw new Error('keys is not equal');
    }
    ctx.set('stagetwo', ctx.get('stageone') + 1);
    ctx.set('stagetwo_date', Date.now());
    if (ctx.info.prevValue !== 'stageone') {
      throw new Error('stageone result empty');
    }
    if (ctx.info.current !== 'stageTwo') {
      throw new Error('current stage is not stageTwo');
    }
    if (ctx.info.next) {
      throw new Error('stageTwo next stage is not undefined');
    }
    if (ctx.info.prev !== 'stageOne') {
      throw new Error('prev stage is not stageOne');
    }

    return 'stagetwo';
  }
}

@Provide()
export class DataMainTest {
  @Pipeline([VideoFeeds, CrowFeeds, AccountMap])
  service: MidwayPipelineService;

  @Pipeline([VideoFeeds, ErrorFeeds, AccountMap])
  service1: MidwayPipelineService;

  @Pipeline([StageOne, StageTwo])
  stages: IPipelineHandler;

  async runParallel(): Promise<HomepageDto> {
    // 获取数据执行逻辑
    const rt = await this.service.parallel<HomepageDto>({
      args: {aa: 123}
    });
    return rt.result;
  }

  async runConcat(): Promise<any[]> {
    const rt = await this.service.concat<any[]>({
      args: {aa: 123}
    });
    return rt.result;
  }

  async runSeries(): Promise<HomepageDto> {
    const rt = await this.service.series<HomepageDto>({
      args: {aa: 123}
    });
    return rt.result;
  }

  async runSeriesConcat(): Promise<any[]> {
    const rt = await this.service.concatSeries<any[]>({
      args: {aa: 123}
    });
    return rt.result;
  }

  async runWaterfall(): Promise<any> {
    const rt = await this.service.waterfall<AccountDto>({
      args: {aa: 123},
      valves: [CrowFeeds, AccountMap]
    });
    return rt.result;
  }

  async runParallelError(): Promise<any> {
    return this.service1.parallel<HomepageDto>({
      args: {aa: 123}
    });
  }

  async runError(): Promise<any> {
    const rt = await this.service1.waterfall<AccountDto>({
      args: {aa: 123}
    });
    return rt;
  }

  async runSeriesError(): Promise<any> {
    return this.service1.series<HomepageDto>({
      args: {aa: 123}
    });
  }

  async runStagesWaterfall(): Promise<any> {
    return this.stages.waterfall<any>({
      args: {aa: 123}
    });
  }
}

export default (container: IMidwayContainer) => {
  container.bind(TestService);
  container.bind(VideoFeeds);
  container.bind(AccountMap);
  container.bind(ErrorFeeds);
  container.bind(CrowFeeds);
  container.bind(DataMainTest);
  container.bind(StageOne);
  container.bind(StageTwo);
};
