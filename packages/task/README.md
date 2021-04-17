# @midwayjs/task

## 简介
midwayjs/task是为了能解决任务系列的模块，例如分布式定时任务、延迟任务调度。例如订单2小时后失效、每日定时的数据处理等工作。

## 安装方法

```bash
tnpm install @midwayjs/task -S
```

## 使用方法

在Configuration.ts导入子组件

```typescript

import * as task from '@midwayjs/task';

@Configuration({
  imports: [task],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class AutoConfiguration{
}
```

配置：

在 config.default.ts 文件中配置对应的模块信息：

```typescript
export const taskConfig = {
  redis: `redis://127.0.0.1:32768`,
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: "Asia/Shanghai"
    }
  }
}
```

## 业务代码编写方式

分布式定时任务：

```typescript
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

本地定时任务：

```typescript
@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每分钟执行一次
  @TaskLocal('* * * * * *')
  async test(){
    console.log(this.helloService.getName())
  }
}
```

定时执行任务：

```typescript
@Provide()
export class UserService {
  @Inject()
  helloService: HelloService;

  // 例如下面是每分钟执行一次
  @TaskLocal('* * * * * *')
  async test(){
    console.log(this.helloService.getName())
  }
}
```

让用户定义任务

```typescript

@Queue()
@Provide()
export class HelloTask{

  @Inject()
  service;

  async excute(params){
    console.log(params);
  }
}
```

```typescript
import { QueueService } from '@midwayjs/task';
@Provide()
export class UserTask{

  @Inject()
  service;

  @Inject()
  queueService: QueueService;

  async excute(params){
    // 3秒后触发分布式任务调度。
    const xxx = this.queueService.excute(HelloTask, params, {delay: 3000});
  }
}

```
## 其他

关于task任务的配置：
```
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
