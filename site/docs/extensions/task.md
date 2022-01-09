# 任务调度（Task）

@midwayjs/task 是为了解决任务系列的模块，例如分布式定时任务、延迟任务调度。例如每日定时报表邮件发送、订单2小时后失效等工作。

分布式定时任务依赖 bull，其通过 redis 进行实现，所以配置中，需要配置额外的 Redis，本地定时任务基于 Corn 模块，不需要额外配置。



相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ✅    |
| 包含自定义日志       | ✅    |
| 可独立添加中间件     | ❌    |



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



## 分布式定时任务

这是我们最常用的定时任务方式。

分布式定时任务，可以做到分布在多个进程，多台机器去执行单一定时任务方式。

分布式定义任务依赖 Redis 服务，需要提前申请。



### 配置

在 `config.default.ts` 文件中配置对应的模块信息：

```typescript
export const taskConfig = {
  redis: `redis://127.0.0.1:32768`, // 任务依赖redis，所以此处需要加一个redis
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
  prefix: 'midway-task',						// 这些任务存储的 key，都是 midway-task 开头，以便区分用户原有redis 里面的配置。
  defaultJobOptions: {
    repeat: {
      tz: "Asia/Shanghai"						// Task 等参数里面设置的比如（0 0 0 * * *）本来是为了0点执行，但是由于时区不对，所以国内用户时区设置一下。
    }
  }
}
```



### 代码使用

```typescript
import { Provide, Inject, Task, FORMAT } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每分钟执行一次，并且是分布式任务
  @Task({
    repeat: { cron: FORMAT.CRONTAB.EVERY_MINUTE}
  })
  async test() {
    console.log(this.helloService.getName())
  }
}
```

### 设置进度

例如我们在做音视频或者发布这种比较耗时的任务的时候，我们希望能设置进度。

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01WPYaAz21NgV3VNzjV_!!6000000006973-2-tps-576-454.png)

相当于第二个参数，将 bull 的 job 传递给了用户。用户可以通过 `job.progress` 来设置进度。


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

### 任务的相关内容

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
    const result = await container.getAsync(QueueService);
    let job = result.getLocalTask(`HelloTask`, 'task'); // 参数1:类名 参数2: 装饰器TaskLocal的函数名
    job(); // 表示立即执行
  }

}

```



## 

## 常用 Cron 表达式

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


- 每隔5秒执行一次：*/5 * * * * *
- 每隔1分钟执行一次：0 */1 * * * *
- 每小时的20分执行一次：0 20 * * * *
- 每天 0 点执行一次：0 0 0 * * *
- 每天的两点35分执行一次：0 35 2 * * *

可以使用 [在线工具](https://cron.qqe2.com/) 执行确认下一次执行的时间。



Midway 在框架侧提供了一些常用的表达式，放在 `@midwayjs/decorator` 中供大家使用。

```typescript
import { FORMAT } from '@midwayjs/decorator';

// 每分钟执行的 cron 表达式
FORMAT.CRONTAB.EVERY_MINUTE
```

内置的还有一些其他的表达式。

| 表达式                         | 对应时间        |
| ------------------------------ | --------------- |
| CRONTAB.EVERY_SECOND           | 每秒钟          |
| CRONTAB.EVERY_MINUTE           | 每分钟          |
| CRONTAB.EVERY_HOUR             | 每小时整点      |
| CRONTAB.EVERY_DAY              | 每天 0 点       |
| CRONTAB.EVERY_DAY_ZERO_FIFTEEN | 每天 0 点 15 分 |
| CRONTAB.EVERY_DAY_ONE_FIFTEEN  | 每天 1 点 15 分 |
| CRONTAB.EVERY_PER_5_SECOND     | 每隔 5 秒       |
| CRONTAB.EVERY_PER_10_SECOND    | 每隔 10 秒      |
| CRONTAB.EVERY_PER_30_SECOND    | 每隔 30 秒      |
| CRONTAB.EVERY_PER_5_MINUTE     | 每隔 5 分钟     |
| CRONTAB.EVERY_PER_10_MINUTE    | 每隔 10 分钟    |
| CRONTAB.EVERY_PER_30_MINUTE    | 每隔 30 分钟    |



## 手动触发任务

任务的定义，通过 `@Queue` 装饰器，定义一个任务类，必须含有一个 `async execute()` 方法。
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
 3 秒后，会触发 HelloTask 这个任务。



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
![image.png](https://img.alicdn.com/imgextra/i2/O1CN01xL1mQE25kMZnB5ygb_!!6000000007564-2-tps-1614-847.png)
用户可以搜索这个相同的id，找到同一次请求的日志。
为了方便用户在自己的业务代码中串联对应的日志，我在ctx上面挂了traceId变量。

例如异常情况：当异常的时候，**本地可以在控制台和 midway-task.log 栏内看到这个错误相关的情况：**

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01WYBjbL1lGKHmsdSnH_!!6000000004791-2-tps-1964-324.png)



### traceId

localTask 则是自己生成了一个 uuid 的 id 作为 traceId。


task 和 queue 则采用 job 的 id 作为 traceId。



### 业务内部的代码

在 service 内可以通过 inject 注入 logger，或者注入 ctx 拿 logger 变量
```typescript
import { App, Inject, Provide, Queue } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";

@Queue()
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



## 本地定时任务

本地定时任务和分布式任务不同，无需依赖和配置 Redis，只能做到单进程的事情，即每台机器的每个进程都会被执行。

```typescript
import { Provide, Inject, TaskLocal, FORMAT } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每分钟执行一次
  @TaskLocal(FORMAT.CRONTAB.EVERY_MINUTE)    
  async test(){
    console.log(this.helloService.getName())
  }
}
```





## 常见问题



### 1、EVALSHA错误

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01KfjCKT1yypmNPDkIL_!!6000000006648-2-tps-3540-102.png)

这个问题基本明确，问题会出现在 redis 的集群版本上。原因是 redis 会对 key 做 hash 来确定存储的 slot，集群下这一步 @midwayjs/task 的 key 命中了不同的 slot。临时的解决办法是 taskConfig 里的 prefix 配置用 {} 包括，强制 redis 只计算 {} 里的hash，例如 `prefix: '{midway-task}'`。



### 2、历史日志删除

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
目前是否默认删除，需要跟用户沟通。