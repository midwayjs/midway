import { IValveHandler, IPipelineContext, IPipelineHandler } from '../../src/features/pipeline';
import { Provide, Inject, Pipeline } from '@midwayjs/decorator';
import { IContainer } from '../../src/interface';

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

export class DataMainTest {
  @Pipeline(['videoFeeds', 'crowFeeds', 'accountMap'])
  service: IPipelineHandler;

  @Pipeline(['videoFeeds', 'errorFeeds', 'accountMap'])
  service1: IPipelineHandler;

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
      valves: ['crowFeeds', 'accountMap']
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
}

export default (container: IContainer) => {
  container.bind(TestService);
  container.bind(VideoFeeds);
  container.bind(AccountMap);
  container.bind(ErrorFeeds);
  container.bind(CrowFeeds);
  container.bind(DataMainTest);
};
