# 代码流程控制

有些场景下，我们希望把一个完整的任务拆分成不同的阶段，每个阶段执行的逻辑相对独立，同时又可以通过并行或者串行的方式提升整体的执行效率。在 Midway 中我们实现了一个优化的 Pipeline 模式。



## Pipeline


在 Node.js 的 Stream 实现中，可以使用 `a.pipe(b).pipe(c).pipe(d)` 这样，把多个 Stream 串连起来。但是这样只能顺序执行的 pipe 实现不一定能够满足不同的业务场景。


在 Midway 中我们使用 `@Pipeline`  装饰器，可以创建一个继承与 `IPipelineHandler`  接口的实例，可以将多个 `IValveHandler`   实例串联起来执行。


 `IValveHandler`  就是具体的任务阶段执行单位。整个 IPipelineHandler 执行方式可以是 parallel、series、concat、waterfall (很熟悉是吧？我们参考了 [async](https://github.com/caolan/async) 库提供的方法能力命名)。


Pipeline 执行时期的上下文 IPipelineContext 可以用来存储 Pipeline 入参、上一次 IValveHandler 实例的执行结果、上一次的中间产物等等，提供了非常大的灵活性。




## 类型定义


### IPipelineHandler

```typescript
interface IPipelineHandler {
  /**
   * 并行执行，使用 Promise.all
   * @param opts 执行参数
   */
  parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 并行执行，最终 result 为数组
   * @param opts 执行参数
   */
  concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，使用 foreach await
   * @param opts 执行参数
   */
  series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，使用 foreach await，最终 result 为数组
   * @param opts 执行参数
   */
  concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * 串行执行，但是会把前者执行结果当成入参，传入到下一个执行中去，最后一个执行的 valve 结果会被返回
   * @param opts 执行参数
   */
  waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
}
```



- 白名单机制
使用 Pipeline 装饰器时，如果填写了数组参数，那么方法执行函数中的 valves 入参只能是装饰器数组参数中的项。当然，valves 是可选项，不填默认就以装饰器数组参数为准。例如，`@Pipeline(['a', 'b', 'c'])` 那么 series 等执行函数中可选参数 `opts.valves` 数组必须是 `['a', 'b', 'c']` 或者其子集，如果不填则以 `['a', 'b', 'c']`  逻辑顺序来执行。



### 返回结果


IPipelineResult 的类型如下。
```typescript
/**
 * pipeline 执行返回结果
 */
export interface IPipelineResult<T> {
  /**
   * 是否成功
   */
  success: boolean;
  /**
   * 异常信息(如果有则返回)
   */
  error?: {
    /**
     * 异常出在那个 valve 上
     */
    valveName?: string;
    /**
     * 异常信息
     */
    message?: string;
    /**
     * 原始 Error
     */
    error?: Error;
  };
  /**
   * 返回结果
   */
  result: T;
}
```


## 使用举例

1. 假设有这样一个场景，我们需要一次性获取页面上的数据信息、当前用户信息以及有几个 Tab。那么我们先声明返回的数据类型
```typescript
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

```

2. 实现一个 TestService 来封装一下返回的这些数据
```typescript

@Provide()
class TestService {
  // 返回当前登录用户信息
  async getAccount(args: any): Promise<AccountDto> {
    return {
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true,
    };
  }
  // 返回视屏列表
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
  // 返回tab页面
  async getTab(args: any): Promise<TabDto> {
    return {
      title: 'test tab',
      tabId: 'firstTab',
      index: 0
    };
  }
}

```

3. 将几个任务封装拆分成不同的 IValveHandler 实现
```typescript
// 返回视屏信息的
@Provide()
class VideoFeeds implements IValveHandler {
  alias = 'videos';

  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<VideoDto[]> {
    return this.service.getVideos(ctx.args);
  }
}
// 返回账户信息的
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
// 返回tab信息的
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
// 捕捉整个错误异常的
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
```
### parallel


通过该方法执行的结果，最终返回的是一个 object 对象，且每个 IValveHandler 实现 alias 作为对象返回值的 key
```typescript
class StageTest {
  // 这里声明一个 pipeline
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;
  
  async runParallel(): Promise<any> {
    // 这里并发执行 videoFeeds、accountMap、crowFeeds
    return this.stages.parallel<any>({
      args: {aa: 123}
    });
    
    // 返回的 result 结构
    /*
    {
      // 以 accountMap 的 alias account 作为返回对象的 key
      account: {
        id: 'test_account_id',
        nick: 'test hello',
        isFollow: true,
      },
      // 以 videoFeeds 的 alias video 作为返回对象的 key
      video: [
        {
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
        }
      ],
      // 以 crowFeeds 的 alias tab 作为返回对象的 key
      tab: {
        title: 'test tab',
        tabId: 'firstTab',
        index: 0
      }
    }
    */
  }
}
```


### concat


执行方式同 parallel 只不过最终返回结果 result 是一个数组
```typescript
class StageTest {
  // 这里声明一个 pipeline
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;
  
  async runConcat(): Promise<any> {
    // 这里并发执行 videoFeeds、accountMap、crowFeeds
    return this.stages.concat<any>({
      args: {aa: 123}
    });
    
    // 这里返回的 result 是一个数组
    /*
    [
    	// 以 videoFeeds 作为第一个返回对象
      [
        {
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
        }
      ],
      // 以 accountMap 作为第二个返回对象
      {
        id: 'test_account_id',
        nick: 'test hello',
        isFollow: true,
      },
      // 以 crowFeeds 作为第三个返回对象
      {
        title: 'test tab',
        tabId: 'firstTab',
        index: 0
      }
    ]
    */
  }
}
```


### series


这里 series 是串行执行，按照 Pipeline 装饰器参数顺序，一个一个执行下去，且 IPipelienContext 中的 prev 就是前一个 valve，current 是当前，next 即下一个即将执行的 valve
```typescript
class StageTest {
  // 这里声明一个 pipeline
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;
  
  async runSeries(): Promise<any> {
    // 这里串行执行 videoFeeds、accountMap、crowFeeds
    return this.stages.series<any>({
      args: {aa: 123}
    });
    
    // 这里返回的 result 是一个对象，结果同 parallel 返回的对象拼装规则
  }
}
```


### concatSeries


原理同 series，只不过返回结果是一个数组
```typescript
class StageTest {
  // 这里声明一个 pipeline
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;
  
  async runConcatSeries(): Promise<any> {
    // 这里串行执行 videoFeeds、accountMap、crowFeeds
    return this.stages.concatSeries<any>({
      args: {aa: 123}
    });
    
    // 这里返回的 result 是一个数组，同 concat 返回对象拼装
  }
}
```


### waterfall


串行执行，最终只返回最后一个 valve 执行结果


```typescript
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
    // 验证是否是执行 stageOne 返回的结果
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

class StageTest {
  // 这里声明一个 pipeline
  @Pipeline([StageOne, StageTwo])
  stages: IPipelineHandler;
  
  async runStagesWaterfall(): Promise<any> {
    // 这里通过串行方式执行，可以看到 stageTwo 中做了校验，prevValue 即 stageOne 执行的结果
    return this.stages.waterfall<any>({
      args: {aa: 123}
    });
  }
}
```