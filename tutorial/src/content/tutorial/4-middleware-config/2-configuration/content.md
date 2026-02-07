---
type: lesson
title: 应用配置管理
focus: /src/config/config.default.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---

# 应用配置管理

这一节基于 `env_config` 文档，学习 Midway 的多环境配置最小实践。

## 1. 配置文件约定

配置放在 `src/config/`：

```text
src/config/
  config.default.ts
  config.local.ts
  config.prod.ts
```

- `config.default.ts`：所有环境都会加载
- `config.{env}.ts`：只在对应环境加载，并覆盖同名配置

## 2. 推荐写法：对象形式

`env_config` 推荐使用对象形式（更直观，也更不容易误用）：

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    keys: ['123456'],
    port: 7001,
  },
  app: {
    name: 'midway-tutorial',
    version: '1.0.0',
  },
} as MidwayConfig;
```

## 3. 在 configuration.ts 显式加载配置

按文档建议，环境配置需要在 `importConfigs` 中显式声明：

```typescript
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class MainConfiguration {}
```

当前课程 case 只放了 `config.default.ts`，所以重点先掌握默认配置。

## 4. 快速验证

这节不建议改端口（会影响当前预览）。用下面方式验证配置生效：

把 `src/config/config.default.ts` 改成：

```typescript
app: {
  name: 'midway-learning-lab',
  version: '2026.02',
},
```

保存后：
- `output` 会显示服务重启
- 预览仍在 `7001` 正常可访问（说明你没有破坏运行入口）
- 访问默认路由 `GET /` 可以直接看到你刚改的配置值

## 5. 代码里读取配置

可以用 `@Config()` 注入配置项：

```typescript
import { Controller, Get, Config } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Config('app.name')
  appName: string;

  @Config('app.version')
  appVersion: string;

  @Get('/')
  async home() {
    return {
      name: this.appName,
      version: this.appVersion,
    };
  }
}
```

本课 `_files` 已提供可直接使用的默认路由：
- `GET /`

## 小结

✅ 使用 `config.default.ts + config.{env}.ts` 组织多环境配置
✅ 优先使用对象形式导出配置
✅ 在 `importConfigs` 显式声明环境配置
✅ 配置通过覆盖规则合并，后者覆盖前者
