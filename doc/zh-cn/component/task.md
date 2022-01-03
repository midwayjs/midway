# 任务调度（Task）

@midwayjs/task 是为了解决任务系列的模块，例如分布式定时任务、延迟任务调度。例如每日定时报表邮件发送、订单2小时后失效等工作。

说明：由于底层是依赖 bull，其通过 redis 进行实现，所以配置中，需要加一个 redis 的配置。


## 安装组件

首先安装 Midway 提供的任务组件：

```bash
$ npm install @midwayjs/task@3 -S
```

在 `configuration.ts` 中，引入这个组件：

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as task from '@midwayjs/task';   // 导入模块
import { join } from 'path';

@Configuration({
  imports: [task],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration{
}
```

## 配置


在 `config.default.ts` 文件中配置对应的模块信息：

```typescript
export const taskConfig = {
  redis: `redis://127.0.0.1:32768`, //任务依赖redis，所以此处需要加一个redis
  prefix: 'midway-task',						// 这些任务存储的key，都是midway-task开头，以便区分用户原有redis里面的配置。
  defaultJobOptions: {
    repeat: {
      tz: "Asia/Shanghai"						// Task等参数里面设置的比如（0 0 0 * * *）本来是为了0点执行，但是由于时区不对，所以国内用户时区设置一下。
    }
  }
}
```

有账号密码情况：

```typescript
export const taskConfig = {
  redis: {
  	port: 6379, host: '127.0.0.1', password: 'foobared'
  }, //此处相当于是ioredis的配置 https://www.npmjs.com/package/ioredis
  prefix: 'midway-task',						// 这些任务存储的key，都是midway-task开头，以便区分用户原有redis里面的配置。
  defaultJobOptions: {
    repeat: {
      tz: "Asia/Shanghai"						// Task等参数里面设置的比如（0 0 0 * * *）本来是为了0点执行，但是由于时区不对，所以国内用户时区设置一下。
    }
  }
}
```

## 业务代码编写方式

### 分布式定时任务

```typescript
import { Provide, Inject, Task } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每分钟执行一次，并且是分布式任务
  @Task({
    repeat: { cron: '* * * * *'}    
  })
  async test(){
    console.log(this.helloService.getName())
  }
}
```

### 本地定时任务

```typescript
import { Provide, Inject, TaskLocal } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每秒钟执行一次
  @TaskLocal('* * * * * *')    
  async test(){
    console.log(this.helloService.getName())
  }
}
```

### 手动触发任务

任务的定义，通过 `@Queue` 装饰器，定义一个任务类，内必须含有 execute 方法，并且是 async 的。为什么需要是 async 的因为，这个代码，是为了分布式，相当于有个内部的任务调度过程。
```typescript
import { Provide, Inject, Queue } from '@midwayjs/decorator';

@Queue()
@Provide()
export class HelloTask{

  @Inject()
  service;

  async execute(params){
    console.log(params);
  }
}
```


触发：
```typescript
import { QueueService } from '@midwayjs/task';
import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class UserTask{

  @Inject()
  service;

  @Inject()
  queueService: QueueService;

  async execute(params){
    // 3秒后触发分布式任务调度。
    const xxx = await this.queueService.execute(HelloTask, params, {delay: 3000});
  }
}
```
这样，就相当于是 3 秒后，触发 HelloTask 这个任务。

#### 设置进度
例如我们在做音视频或者发布这种比较耗时的任务的时候，我们希望能设置进度。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1620884757992-fb18a58f-9e56-4eda-92d9-68965df73e8a.png#clientId=uecb893ec-cfee-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=342&id=ubf7a3918&margin=%5Bobject%20Object%5D&name=image.png&originHeight=454&originWidth=576&originalType=binary&ratio=1&rotation=0&showTitle=false&size=29448&status=done&style=none&taskId=uffac1111-2306-44ac-bd3e-906503e1764&title=&width=434)
相当于第二个参数，将bull的job传递给了用户。用户可以通过job.progress来设置进度。


然后查询进度：
```typescript
import { QueueService } from '@midwayjs/task';
import { Provide, Controller, Get } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HelloController{
  @Inject()
  queueService: QueueService;
  
  @Get("/get-queue")
  async getQueue(@Query() id: string){
    return await this.queueService.getClassQueue(TestJob).getJob(id);
  }
}
```
#### 任务的相关内容
```typescript
let job = await this.queueService.getClassQueue(TestJob).getJob(id)
```
然后 job 上面有类似停止的方法，或者查看进度的方法。


### 启动就触发


有朋友由于只有一台机器，希望重启后立马能执行一下对应的定时任务。
```typescript
import { Context, ILifeCycle, IMidwayBaseApplication, IMidwayContainer } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import { Queue } from 'bull';
import { join } from 'path';
import * as task from '@midwayjs/task';
import { QueueService } from '@midwayjs/task';

@Configuration({
  imports: [
    task
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration implements ILifeCycle {
  
  async onReady(container: IMidwayContainer, app?: IMidwayBaseApplication<Context>): Promise<void> {
    
    // Task这块的启动后立马执行
    let result: any = await container.getAsync(QueueService);
    let job: Queue = result.getQueueTask(`HelloTask`, 'task') // 此处第一个是你任务的类名，第二个任务的名字也就是装饰器Task的函数名
    job.add({}, {delay: 0}) // 表示立即执行。
    
    // LocalTask的启动后立马执行
    let result: any = await container.getAsync(QueueService);
    let job = result.getLocalTask(`HelloTask`, 'task'); // 参数1:类名 参数2: 装饰器TaskLocal的函数名
    job(); // 表示立即执行
  }

}

```


## 运维
### 日志
在Midway Task Component上面，增加了两个日志：

- midway-task.log
- midway-task-error.log


分别在task、localTask、queue触发开始和结束的时候会打印对应的日志。


分布式的Task触发日志：
```typescript
logger.info(`task start.`)

// 异常情况：
logger.error(`${e.stack}`)

logger.info(`task end.`)
```
非分布式的LocalTask触发日志：
```typescript
logger.info(`local task start.`)

// 异常情况：
// logger.error(`${e.stack}`)

logger.info(`local task end.`)
```


任务队列的触发日志：
```typescript
logger.info(`queue process start.`)

// 异常情况：
// logger.error(`${e.stack}`)

logger.info(`queue process end.`)
```


### 排查问题链路：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1626926172431-ce41c896-fc64-4c73-8d3b-f2633a916b5f.png#clientId=u62783ce8-4645-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=504&id=viDCK&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1008&originWidth=1992&originalType=binary&ratio=1&rotation=0&showTitle=false&size=2693469&status=done&style=none&taskId=u467a4354-7dc2-49c3-9bb6-3c6dea1903e&title=&width=996)
用户可以搜索这个相同的id，找到同一次请求的日志。
为了方便用户在自己的业务代码中串联对应的日志，我在ctx上面挂了traceId变量。


例如异常情况：
当异常的时候，
**本地 可以在console栏内看到这个错误相关的情况：**
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1626929372403-df50b85d-c71e-4b87-b602-275d10d3dc83.png#clientId=u8f28ddc7-5bc1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=162&id=UlGrO&margin=%5Bobject%20Object%5D&name=image.png&originHeight=324&originWidth=1964&originalType=binary&ratio=1&rotation=0&showTitle=false&size=669523&status=done&style=none&taskId=u4b77719b-978b-4a21-90f8-3ee205dbf9d&title=&width=982)
日志： 可以在midway-task.log文件中查看完整日志：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1626929372403-df50b85d-c71e-4b87-b602-275d10d3dc83.png#clientId=u8f28ddc7-5bc1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=162&id=binL0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=324&originWidth=1964&originalType=binary&ratio=1&rotation=0&showTitle=false&size=669523&status=done&style=none&taskId=u4b77719b-978b-4a21-90f8-3ee205dbf9d&title=&width=982)
如果调用情况比较多的时候，会出现A还没执行完成，B又进来，导致日志区分比较麻烦，所以用户可以搜索调用的traceId，也就是下图红色圈起来的地方：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1626929496543-7d79db19-622f-4f99-a2fd-60b7f00bd57d.png#clientId=u8f28ddc7-5bc1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=163&id=DM3xz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=326&originWidth=2034&originalType=binary&ratio=1&rotation=0&showTitle=false&size=691391&status=done&style=none&taskId=ucd8b1d59-b13d-4fc4-81e2-2d4f43bab7b&title=&width=1017)
相当于ctrl + f搜索相同的traceId即可。


### traceId
localTask则是自己生成了一个uuid的id作为traceId。


task和queue则采用job的id作为traceId。


### 业务内部的代码
在service内可以通过inject注入logger，或者注入ctx拿logger变量
```typescript
import { App, Inject, Provide, Queue } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";

@Queue()
@Provide()
export class QueueTask{

  @App()
  app: Application;

  @Inject()
  logger;

  async execute(params){
    this.logger.info(`====>QueueTask execute`)
    this.app.getApplicationContext().registerObject(`queueConfig`, JSON.stringify(params));
  }
}

```
或者
```typescript
import { App, Inject, Provide, Queue } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";

@Queue()
@Provide()
export class QueueTask{

  @App()
  app: Application;

  @Inject()
  ctx;

  async execute(params){
    this.ctx.logger.info(`====>QueueTask execute`)
    this.app.getApplicationContext().registerObject(`queueConfig`, JSON.stringify(params));
  }
}

```


打印的日志
```typescript
2021-07-30 13:00:13,101 INFO 5577 [Queue][12][QueueTask] queue process start.
2021-07-30 13:00:13,102 INFO 5577 [Queue][12][QueueTask] ====>QueueTask execute
2021-07-30 13:00:13,102 INFO 5577 [Queue][12][QueueTask] queue process end.
```


## 其他


### Cron 表达式


关于 Task 任务的配置：
```typescript
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```
常见表达式：


- 每隔5秒执行一次：*/5 * * * * ?
- 每隔1分钟执行一次：0 */1 * * * ?
- 每小时的20分执行一次：0 20 * * * ?
- 每天 0 点执行一次：0 0 0 * * ?
- 每天的两点35分执行一次：0 35 2 * * ?


可以使用 [在线工具](https://cron.qqe2.com/) 执行确认下一次执行的时间。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/501408/1637042668291-70527b75-bb33-4ad2-adc0-5f0f5dfe8c81.png#clientId=u21d1027f-3ac8-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=340&id=gQnon&margin=%5Bobject%20Object%5D&name=image.png&originHeight=680&originWidth=1868&originalType=binary&ratio=1&rotation=0&showTitle=false&size=98959&status=done&style=none&taskId=u0adb2151-a667-4900-8bba-b13d4aac93c&title=&width=934)


### EVALSHA错误
![image.png](https://cdn.nlark.com/yuque/0/2021/png/187105/1633771728525-1efeb2a6-cefd-4fc3-a16d-0e9a97f371d1.png#clientId=u52b8d912-3ffa-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=51&id=u0c96f70a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=102&originWidth=3540&originalType=binary&ratio=1&rotation=0&showTitle=false&size=164783&status=done&style=none&taskId=uc38084d4-e2cf-435d-a8b9-6a9bec80c9b&title=&width=1770)
这个问题基本明确，问题会出现在redis的集群版本上。原因是redis会对key做hash来确定存储的slot，集群下这一步@midwayjs/task的key命中了不同的slot。临时的解决办法是taskConfig里的prefix配置用{}包括，强制redis只计算{}里的hash，例如 prefix: '{midway-task}'


### 历史日志删除
当每次redis执行完他会有日志，那么如何让其在完成后删除：
```typescript
import { Provide, Task } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';

@Provide()
export class UserService {
  async getUser(options: IUserOptions) {
    return {
      uid: options.uid,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    };
  }

  @Task({
    repeat: { cron: '* * * * * *'},
    removeOnComplete: true    // 加了一行这个
  })
  async test(){
    console.log(`====`)
  }
}

```
目前是否默认删除，需要跟用户沟通