# 进程 Agent（ProcessAgent）

midway 封装了 `@midwayjs/process-agent` 用来解决 node 场景中，多进程部分场景数据进程间数据不一致，或者无法指定master进程执行某个方法。


举例：

- 如果使用 pm2、cluster、多进程进行部署方式，使用内存的 cache，那这个 cache 在自己的进程内。
- prometheus，获取 `/metrics` 的时候，需要把所有进程的数据收集上来，而不是某个进程的
- 健康检查，如果有4个进程，如果有一个进程不正常了，健康检查应该检查失败。

## 安装方法

使用方法：

```bash
$ npm install @midwayjs/process-agent@3 -S
```

`configuration.ts` 使用方法：
```typescript
import * as processAgent from '@midwayjs/process-agent';

@Configuration({
  imports: [processAgent],
})
export class ContainerLifeCycle {
}

```
## 使用方法

业务代码 UserService：

```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { TestService } from './test';

@Provide()
export class UserService {

  @Inject()
  testService: TestService;

  async getUser() {
    let result = await this.testService.setData(1);
    return result;
  }
}

```
然后调用 testService 的时候，希望只在主进程执行：

```typescript
import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { RunInPrimary } from '@midwayjs/process-agent';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService {

  data: any = 0;

  @RunInPrimary()
  async setData(b){
    this.data = b;
    return this.data;
  }

  @RunInPrimary()
  async getData(){
    return this.data;
  }
}

```
注意，执行返回的数据只限于可序列化的数据，比如普通 JSON，不支持包含方法等无法序列化的数据。


## 效果描述
假设采用pm2 或者 egg-script 等多进程方式启动，假设这是个请求

首先：

- 1、设置 setData
- 2、然后获取 getData


如果没有 RunInPrimary 这个装饰器，那请求可能落在进程2，或者进程3，那可能没有获取更新的data。

所以 RunInPrimary 能确保这个函数执行能落到主进程去。


## 功能征集
如果有其他类似相关功能，觉得可以放在这个包里面的，欢迎在评论区，或者 [issue](https://github.com/midwayjs/midway/issues) 里面帮忙提一下，我们会跟大家一起讨论和实现。

