# One-shot

`@midwayjs/one-shot` 是一个只提供 Framework 的一次性脚本执行组件，适合用 IoC 容器组织依赖，并在应用内触发一次性的任务逻辑。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ❌    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ❌   |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |

## 安装依赖

在现有项目中安装 one-shot 组件依赖。

```bash
$ npm i @midwayjs/one-shot@4  --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/one-shot": "^4.0.0"
  }
}
```

## 开启组件

在入口配置中引入组件。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {}
```

## 在生命周期执行

该组件不要求编写额外 Runner，推荐在 `onServerReady` 生命周期里直接执行一次性脚本逻辑。

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';
import { ScriptService } from './service/script';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {
  @Inject()
  scriptService: ScriptService;

  async onServerReady() {
    await this.scriptService.runOnce();
  }
}
```

## 需要请求作用域时

如果脚本逻辑需要依赖请求作用域（request scope），可以通过 framework 的 `runScript` 执行一个固定格式的 service 类，框架会为本次执行创建上下文并走中间件/过滤器链。

```typescript
// src/script/syncUser.ts
import { Provide } from '@midwayjs/core';
import { OneShotRunner, Context } from '@midwayjs/one-shot';

@Provide()
export class SyncUserScript implements OneShotRunner<{ id: number }, void> {
  async run(payload?: { id: number }, ctx?: Context) {
    // use payload / ctx
    void payload;
    void ctx;
  }
}
```

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';
import { Framework } from '@midwayjs/one-shot';
import { SyncUserScript } from './script/syncUser';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {
  @Inject()
  framework: Framework;

  async onServerReady() {
    await this.framework.runScript(SyncUserScript, { id: 42 });
  }
}
```

## 日志

组件默认会注册一个名为 `oneShotLogger` 的 logger，默认写入 `midway-one-shot.log`。

你可以在脚本服务里通过 `@Logger('oneShotLogger')` 注入使用，例如：

```typescript
import { Logger, ILogger } from '@midwayjs/core';
export class ScriptService {
  @Logger('oneShotLogger')
  logger: ILogger;

  async runOnce() {
    this.logger.info('run one-shot task');
  }
}
```

如果希望自定义日志文件名或级别，可以在应用配置中覆盖 `midwayLogger.clients.oneShotLogger`：

```typescript
// src/config/config.default.ts
export default {
  midwayLogger: {
    clients: {
      oneShotLogger: {
        fileLogName: 'my-one-shot.log',
        level: 'info',
      },
    },
  },
};
```
