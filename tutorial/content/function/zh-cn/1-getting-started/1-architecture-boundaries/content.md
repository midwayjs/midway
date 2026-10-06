---
title: 目录与模块边界
focus: /README.md
---

# 目录与模块边界

Functional 教程按「契约先行」组织代码：`src/server/api/*.api.ts` 既是服务端路由，也是前端可以引用的类型来源。

```txt
src
├── configuration.ts     # mock 启动入口，转发给 server/index.ts
├── server
│   ├── index.ts         # defineConfiguration
│   ├── api/             # defineApi 契约
│   ├── service/         # 业务，仍然可以是 @Provide() 类
│   └── config/
└── web
    └── api/client.ts    # createClient，复用同一份契约
```

## 和 Class 写法的对应关系

| Class | Functional |
| --- | --- |
| `@Configuration` | `defineConfiguration` |
| `@Controller` + `@Get` | `defineApi` + `api.get` |
| `@Inject()` | `useInject()` |
| `@Config()` / `ctx` | `useConfig()` / `useContext()` |

函数式不是另一套框架，而是同一套 IoC 和路由能力的另一种表达。需要和前端同仓协作时优先用 `defineApi`。

## 规则

- 接口定义文件统一为 `*.api.ts`，放在 `src/server/api`
- 前端只导入这份契约，不要手写 URL 字符串
- 前端不要引用 `fs`、数据库客户端、handler 内部实现
- v4 必须在 `defineConfiguration` 里声明 `detector: new CommonJSFileDetector()`，否则这些 api 模块不会被加载

右侧预览已经能打开 `/`，返回 `Hello Midway Functional!`。下一课写出第一个 `defineApi`。
