# 课程配置说明

## 🎯 设计原则

### 第一课：项目结构介绍（静态展示）
- ❌ 不需要环境准备
- ❌ 不需要启动应用
- ✅ 只展示文件结构
- ✅ 让学生浏览和阅读代码

### 第二课及以后：实践操作（动态运行）
- ✅ 安装依赖
- ✅ 启动应用
- ✅ 预览效果
- ✅ 实际操作

## 📋 课程对比

### 第一课配置

```yaml
---
type: lesson
title: 项目结构介绍
focus: /README.md
editor:
  fileTree:
    allowEdits: false
---
```

**特点：**
- 无 `prepareCommands`（不安装依赖）
- 无 `mainCommand`（不启动应用）
- 无 `terminal`（不显示终端）
- 无 `previews`（不显示预览）
- 只有 `editor` 和 `fileTree`（只看代码）

**文件内容简化：**
- `bootstrap.ts`: 只有 `Bootstrap.run()`
- `configuration.ts`: 最简配置，无生命周期
- `home.controller.ts`: 只有一个 GET 路由
- `config.default.ts`: 只有 keys

### 第二课配置

```yaml
---
type: lesson
title: 创建第一个 Controller
focus: /src/controller/home.controller.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---
```

**特点：**
- ✅ `prepareCommands`: 安装依赖
- ✅ `mainCommand`: 启动应用
- ✅ `terminal`: 显示终端输出
- ✅ `previews`: 显示应用预览
- ✅ `autoReload`: 自动重载

**文件内容完整：**
- 多个路由方法
- 使用各种装饰器
- 实际可运行

## 📊 课程流程

```
第一课（静态）
├── 展示项目结构
├── 阅读代码
└── 理解架构
    ↓
第二课（动态）
├── 安装依赖 ← 第一次运行
├── 启动应用
├── 查看预览
└── 修改代码测试
    ↓
第三课及以后（动态）
├── 继承之前的环境
├── 添加新功能
└── 实时预览
```

## 🎓 教学效果

### 第一课学生体验

1. **打开课程**
   - 看到文件树
   - 看到 README 说明
   - 无需等待环境准备

2. **浏览文件**
   - 点击各个文件查看代码
   - 理解项目结构
   - 认识各个文件的作用

3. **学习重点**
   - 目录组织方式
   - 文件命名规范
   - 基础代码结构

### 第二课学生体验

1. **打开课程**
   - 看到"Preparing Environment"
   - 等待 `npm install`
   - 应用自动启动

2. **实践操作**
   - 修改控制器代码
   - 看到应用自动重启
   - 在预览窗口测试 API

3. **学习重点**
   - 路由装饰器使用
   - 参数装饰器使用
   - 实际运行效果

## ✅ 文件简化原则

### 第一课的文件（简化版）

```typescript
// bootstrap.ts
import { Bootstrap } from '@midwayjs/bootstrap';
Bootstrap.run();
```

```typescript
// configuration.ts
@Configuration({
  imports: [koa],
})
export class MainConfiguration {
  @App()
  app: koa.Application;
}
```

```typescript
// home.controller.ts
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midway!';
  }
}
```

**原则：**
- 只保留核心代码
- 去掉复杂配置
- 去掉日志输出
- 突出关键概念

### 第二课及以后（完整版）

```typescript
// home.controller.ts
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs! 欢迎来到交互式教程！';
  }

  @Get('/info')
  async info() {
    return {
      name: 'Midway.js',
      version: '4.0',
      description: '一个面向未来的 Node.js 框架'
    };
  }

  @Get('/greet')
  async greet(@Query('name') name: string) {
    return `你好, ${name || '游客'}!`;
  }

  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    return {
      userId: id,
      name: `用户${id}`,
      email: `user${id}@example.com`
    };
  }
}
```

**原则：**
- 展示完整功能
- 包含实际应用场景
- 丰富的注释
- 可运行的示例

## 🎯 总结

| 特性 | 第一课（静态） | 第二课及以后（动态） |
|------|--------------|------------------|
| 环境准备 | ❌ 否 | ✅ 是 |
| 启动应用 | ❌ 否 | ✅ 是 |
| 终端显示 | ❌ 否 | ✅ 是 |
| 预览窗口 | ❌ 否 | ✅ 是 |
| 代码复杂度 | 简化 | 完整 |
| 学习方式 | 阅读理解 | 动手实践 |
| 加载速度 | 快 | 慢（需安装） |

这种设计让：
- ✅ 第一课快速加载，建立基础认知
- ✅ 后续课程实际运行，动手实践
- ✅ 学习曲线平滑，从简单到复杂
