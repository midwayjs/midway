# Midway.js 项目

一个标准的 Midway.js 项目结构。

## 项目结构

```
.
├── src/                          # 源码目录
│   ├── controller/               # 控制器目录
│   │   └── home.controller.ts    # 主页控制器
│   ├── service/                  # 服务目录
│   ├── config/                   # 配置目录
│   │   └── config.default.ts     # 默认配置
│   └── configuration.ts          # 应用配置
├── bootstrap.js                  # 启动文件
├── package.json                  # 项目配置
└── tsconfig.json                 # TypeScript 配置
```

## 各目录说明

- **controller/** - 控制器，处理 HTTP 请求
- **service/** - 服务，业务逻辑
- **config/** - 配置文件
- **configuration.ts** - 应用配置入口
- **bootstrap.js** - 应用启动文件





