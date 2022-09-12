# @midwayjs/bull

## 简介

midwayjs/bull 是为了能解决任务系列的模块，例如分布式定时任务、延迟任务调度。例如订单2小时后失效、每日定时的数据处理等工作。

## 安装方法

```bash
tnpm install @midwayjs/bull -S
```

## 使用方法

在Configuration.ts 导入组件

```typescript

import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [bull],
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
export const bull = {
  defaultQueueOptions: {
    redis: `redis://127.0.0.1:6379`,
    prefix: 'midway-task',
  }
  defaultJobOptions: {
    repeat: {
      tz: "Asia/Shanghai"
    }
  }
}
```

## 业务代码编写方式

定义一个任务处理器

```typescript
@Processor('test')
export class UserServiceProcessor {
  @Inject()
  helloService: HelloService;

  async execute(data: any) {
    console.log(this.helloService.getName());

    // console data
    console.log(data);
  }
}
```

在需要的地方手动执行

```typescript
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [bull],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class AutoConfiguration {
  @Inject()
  bullFramework: bull.BullFramework;

  async onServerReady() {
    bullFramework.getQueue('test').runJob({
      name: 'test'
    });
  }
}
```


定时执行任务：

```typescript
@Processor('test', {
  repeat: {
    cron: '0 0 0 * * *'
  }
})
export class UserServiceProcessor {
  @Inject()
  helloService: HelloService;

  async execute(data: any) {
    console.log(this.helloService.getName());

    // console data
    console.log(data);
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
