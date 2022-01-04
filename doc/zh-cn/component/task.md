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
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01L1RjoZ1muSbgxL27G_!!6000000005014-2-tps-860-299.png)


### EVALSHA错误
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01KfjCKT1yypmNPDkIL_!!6000000006648-2-tps-3540-102.png)

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
目前是否默认删除，需要跟用户沟通。