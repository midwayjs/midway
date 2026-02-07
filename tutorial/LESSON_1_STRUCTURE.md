# ✅ 第一课完整项目结构

## 📋 目的

第一课的目的是让学生了解一个完整的 Midway.js 项目包含哪些文件和目录。

## 📂 完整文件结构

```
1-project-structure/_files/
├── README.md                     # 项目说明文档
├── package.json                  # 项目配置和依赖
├── tsconfig.json                 # TypeScript 编译配置
└── src/                          # 源码目录
    ├── bootstrap.ts              # 应用启动文件
    ├── configuration.ts          # 应用配置入口
    ├── config/                   # 配置目录
    │   └── config.default.ts     # 默认配置文件
    ├── controller/               # 控制器目录
    │   └── home.controller.ts    # 主页控制器（基础路由）
    ├── service/                  # 服务目录（空，展示结构）
    └── middleware/               # 中间件目录（空，展示结构）
```

## 📝 各文件说明

### 根目录配置文件

#### `package.json`
```json
{
  "name": "midway-tutorial",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev": "cross-env NODE_ENV=local mwtsc --watch --run @midwayjs/mock/app.js"
  },
  "dependencies": {
    "@midwayjs/bootstrap": "^3.16.0",
    "@midwayjs/core": "^3.16.0",
    "@midwayjs/decorator": "^3.16.0",
    "@midwayjs/koa": "^3.16.0",
    "@midwayjs/logger": "^3.1.0"
  },
  "devDependencies": {
    "@midwayjs/mock": "^3.16.0",
    "@types/node": "^18.19.0",
    "cross-env": "^7.0.3",
    "mwtsc": "^1.4.0",
    "typescript": "^5.3.0"
  }
}
```

- 定义项目依赖
- 配置开发命令 `npm run dev`
- 使用 `mwtsc` 监听编译，`@midwayjs/mock` 运行应用

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "lib": ["ES2020"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- 启用装饰器支持（`experimentalDecorators`, `emitDecoratorMetadata`）
- 配置编译输出目录
- 指定源码目录

### src/ 目录文件

#### `src/bootstrap.ts` - 启动文件
```typescript
import { Bootstrap } from '@midwayjs/bootstrap';

Bootstrap
  .configure({
    globalConfig: {
      koa: {
        port: 7001,
      },
    },
  })
  .run()
  .then(() => {
    console.log('✅ Midway.js 应用启动成功！');
    console.log('🚀 访问 http://localhost:7001');
  })
  .catch((err) => {
    console.error('❌ 启动失败:', err);
  });
```

- 使用 `@midwayjs/bootstrap` 启动应用
- 配置全局参数（如端口）
- 处理启动成功和失败的情况

#### `src/configuration.ts` - 应用配置
```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: {
        keys: 'midway_tutorial_keys',
        koa: {
          port: 7001,
        },
      },
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    console.log('🎉 Midway 应用配置完成');
  }
}
```

- `@Configuration` 装饰器标记为配置类
- `imports` 导入组件（如 koa）
- `importConfigs` 导入配置文件
- `onReady` 生命周期钩子

#### `src/config/config.default.ts` - 默认配置
```typescript
export default {
  keys: '123456',
  koa: {
    port: 7001,
  },
};
```

- 导出配置对象
- 可以在 `configuration.ts` 中被导入
- 支持多环境配置（default, local, prod 等）

#### `src/controller/home.controller.ts` - 控制器
```typescript
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs! 欢迎来到交互式教程！';
  }
}
```

- `@Controller('/')` 定义路由前缀
- `@Get('/')` 定义 GET 路由
- 返回字符串作为响应

## 🎯 教学重点

### 1. 项目结构认知
学生应该理解：
- 根目录的配置文件（package.json, tsconfig.json）
- src/ 目录是源码目录
- 各个子目录的作用

### 2. 启动流程
学生应该理解：
1. `npm run dev` 执行 `mwtsc --watch --run @midwayjs/mock/app.js`
2. `mwtsc` 监听并编译 TypeScript 代码
3. `@midwayjs/mock` 启动 Midway 应用
4. 应用加载 `configuration.ts` 中的配置
5. 应用监听 7001 端口

### 3. 配置系统
学生应该理解：
- `configuration.ts` 是配置入口
- `config/config.default.ts` 是配置文件
- 配置可以在多个地方定义（bootstrap, configuration, config 文件）

### 4. 控制器基础
学生应该理解：
- 控制器使用装饰器定义
- `@Controller` 定义路由前缀
- `@Get` 定义 GET 请求处理

## 🔄 后续课程

### 第二课：控制器和路由
- 只展示 `src/controller/home.controller.ts`（扩展版）
- 学生看到更多路由装饰器

### 第三课：创建服务
- 只展示 `src/service/user.service.ts`
- 学生看到服务层的代码

### 第四课：依赖注入
- 展示 `src/controller/user.controller.ts` 和 `src/service/user.service.ts`
- 学生看到如何在控制器中注入服务

## ✅ 为什么第一课包含所有文件？

1. **完整性**：让学生看到一个完整的、可运行的 Midway 项目
2. **参考性**：后续课程可以对比第一课的基础结构
3. **理解性**：理解各个文件的作用和相互关系
4. **渐进性**：第一课建立基础，后续课程逐步添加功能

## 🎓 学习目标

完成第一课后，学生应该能够：
- ✅ 识别 Midway 项目的标准目录结构
- ✅ 理解各个配置文件的作用
- ✅ 知道如何启动一个 Midway 应用
- ✅ 理解最基础的控制器和路由
- ✅ 为后续学习打下基础
