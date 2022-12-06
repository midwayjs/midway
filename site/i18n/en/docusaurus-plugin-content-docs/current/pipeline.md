# Pipeline

In some scenarios, we want to split a complete task into different stages, each stage of the execution of the logic is relatively independent, and at the same time can improve the overall execution efficiency through parallel or serial ways. In Midway, we have implemented an optimized Pipeline mode.



## Pipeline


In the Node.js Stream implementation, you can use `a.pipe(b).pipe(c).pipe(d)` to concatenate multiple Streams. however, the implementation of pipe, which can only be executed sequentially, may not meet different business scenarios.


In Midway, we use the `@Pipeline` decorator to create an instance that inherits and `IPipelineHandler` interfaces and can concatenate multiple `IValveHandler` instances for execution.


The `IValveHandler` is the specific task phase execution unit. The whole IPipelineHandler can be executed in parallel, series, concat, Waterfall (familiar, right? We refer to the method capabilities provided by the [async](https://github.com/caolan/async) Library.


The context IPipelineContext of the Pipeline execution period can be used to store Pipeline input parameters, the execution results of the previous IValveHandler instance, the previous intermediate products, etc., providing great flexibility.




## Type definition


### IPipelineHandler

```typescript
interface IPipelineHandler {
  /**
   * Parallel execution, using Promise.all
   * @param opts execution parameters
   */
  parallel<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * Execute in parallel, and the final result is an array.
   * @param opts execution parameters
   */
  concat<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * serial execution, using foreach await
   * @param opts execution parameters
   */
  series<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * serial execution, using foreach await, the final result is an array
	 * @param opts execution parameters
   */
  concatSeries<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
  /**
   * Serially executed, but the former execution result will be taken as an input parameter and passed into the next execution. The valve result of the last execution will be returned
   * @param opts execution parameters
   */
  waterfall<T>(opts: IPipelineOptions): Promise<IPipelineResult<T>>;
}
```



- Whitelist mechanism
   When using the Pipeline decorator, if the array parameters are filled in, the values input parameters in the method execution function can only be items in the decorator array parameters. Of course, valves is optional. If you do not fill in the default, the decorator array parameters shall prevail. For example, if `@Pipeline(['a', 'B', 'c'])`, the `opts. values` array of the optional parameters in the execution function such as series must be `['a', 'B', 'c']` or a subset thereof. If this parameter is not specified, it must be executed in the logical order `['a', 'B', 'c']`.



### Return result


The types of IPipelineResult are as follows.
```typescript
/**
 * pipeline execution returns results
 */
export interface IPipelineResult<T> {
  /**
   * Success
   */
  success: boolean;
  /**
   * Exception information (return if any)
   */
  error ?: {
    /**
     * The anomaly is on that valve.
     */
    valveName?: string;
    /**
     * Abnormal information
     */
    message?: string;
    /**
     * Original Error
     */
    error?: Error;
  };
  /**
   * Return results
   */
  result: T;
}
```


## Use examples

1. Suppose there is such a scenario that we need to obtain the data information on the page, the current user information, and several Tab at one time. Then let's first declare the data type returned
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

2. Implement a TestService to encapsulate the returned data
```typescript

@Provide()
class TestService {
  // Returns the current login user information
  async getAccount(args: any): Promise<AccountDto> {
    return {
      id: 'test_account_id',
      nick: 'test hello',
      isFollow: true
    };
  }
  // Return to the video list
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
// return to the tab page
  async getTab(args: any): Promise<TabDto> {
    return {
      title: 'test tab',
      tabId: 'firstTab',
      index: 0
    };
  }
}

```

3. Split several task packages into different IValveHandler implementations
```typescript
// Returns the video information
@Provide()
class VideoFeeds implements IValveHandler {
  alias = 'videos';

  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<VideoDto[]> {
    return this.service.getVideos(ctx.args);
  }
}
// Return account information
@Provide()
class AccountMap implements IValveHandler {
  alias = 'account';

  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<AccountDto> {

    // Get data execution logic
    return this.service.getAccount(ctx.args);
  }
}
// Returns tab information
@Provide()
class CrowFeeds implements IValveHandler {
  alias = 'tab';
  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<TabDto> {
    // Get data execution logic
    return this.service.getTab(ctx.args);
  }
}
// Catch the entire error exception
@Provide()
class ErrorFeeds implements IValveHandler {
  alias = 'tab';
  @Inject()
  service: TestService;

  async invoke(ctx: IPipelineContext): Promise<TabDto> {
    // Get data execution logic
    throw new Error('this is error feeds');
  }
}
```
### parallel


The result of this method is an object object, and each IValveHandler implements alias as the key of the object return value.
```typescript
class StageTest {
  // Declare a pipeline here
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;

  async runParallel(): Promise<any> {
    // The videoFeeds, accountMap and crowFeeds are executed concurrently here.
    return this.stages.parallel<any>({
      args: {aa: 123}
    });

    // The returned result structure
    /*
    {
      // The key with the accountMap alias account as the return object
      account: {
        id: 'test_account_id',
        nick: 'test hello',
        isFollow: true
      },
      // The videoFeeds alias video is used as the key of the return object.
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
      // The crowFeeds alias tab is used as the key of the return object.
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


The execution method is the same as the parallel, except that the final result is an array.
```typescript
class StageTest {
  // Declare a pipeline here
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;

  async runConcat(): Promise<any> {
    // The videoFeeds, accountMap and crowFeeds are executed concurrently here.
    return this.stages.concat<any>({
      args: {aa: 123}
    });

    // The result returned here is an array
    /*
    [
    	// Take videoFeeds as the first return object
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
      // Take accountMap as the second return object
      {
        id: 'test_account_id',
        nick: 'test hello',
        isFollow: true
      },
      // Take crowFeeds as the third return object
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


Here, series is executed in serial, one by one according to the sequence of Pipeline decorator parameters, and the prev in the IPipelienContext is the previous valve, the current is the current, and next is the next valve to be executed.
```typescript
class StageTest {
  // Declare a pipeline here
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;

  async runSeries(): Promise<any> {
    // Here the serial execution videoFeeds, accountMap, crowFeeds
    return this.stages.series<any>({
      args: {aa: 123}
    });

    // The result returned here is an object, and the result is the same as the object assembly rule returned by the parallel.
  }
}
```


### concatSeries


The principle is the same as series, except that the returned result is an array.
```typescript
class StageTest {
  // Declare a pipeline here
  @Pipeline([VideoFeeds, AccountMap, CrowFeeds])
  stages: IPipelineHandler;

  async runConcatSeries(): Promise<any> {
		// here serially execute videoFeeds, accountMap, crowdFeeds
    return this.stages.concatSeries<any>({
      args: {aa: 123}
    });

    // The result returned here is an array that is assembled with the object returned by concat.
  }
}
```


### waterfall


Serial execution, only the last valve execution result is returned.


```typescript
@Provide()
class StageOne implements IValveHandler {
  async invoke(ctx: IPipelineContext): Promise<any> {
    if (ctx.args.aa! = = 123) {
      throw new Error('args aa is undefined');
    }
    ctx.set('stageone', 'this is stage one');
    ctx.set('stageone_date', Date.now());
    if (ctx.info.current! = = 'stageOne') {
      throw new Error('current stage is not stageOne');
    }
    if (ctx.info.next! = = 'stageTwo') {
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
    if (keys.length! = = 2) {
      throw new Error('keys is not equal');
    }
    ctx.set('stagetwo', ctx.get('stageone') + 1);
    ctx.set('stagetwo_date', Date.now());
    // Verify whether it is the result returned by the execution stageOne
    if (ctx.info.prevValue! = = 'stageone') {
      throw new Error('stageone result empty');
    }
    if (ctx.info.current! = = 'stageTwo') {
      throw new Error('current stage is not stageTwo');
    }
    if (ctx.info.next) {
      throw new Error('stageTwo next stage is not undefined');
    }
    if (ctx.info.prev! = = 'stageOne') {
      throw new Error('prev stage is not stageOne');
    }

    return 'stagetwo';
  }
}

class StageTest {
  // Declare a pipeline here
  @Pipeline([StageOne, StageTwo])
  stages: IPipelineHandler;

  async runStagesWaterfall(): Promise<any> {
    // This is executed in serial mode. You can see that the verification is performed in the stageTwo, and the prevValue is the result of stageOne execution.
    return this.stages.waterfall<any>({
      args: {aa: 123}
    });
  }
}
```
