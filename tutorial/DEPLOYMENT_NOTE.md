# TutorialKit 与 Midway.js 集成说明

## 问题说明

TutorialKit 设计用于前端教程（React、Vue 等），使用 WebContainer 在浏览器中运行代码。但 Midway.js 是完整的 Node.js 后端框架，需要真实的服务器环境。

## 当前方案

### 方案 A: 纯文档模式（推荐）✅

**优点：**
- 📖 清晰的代码展示
- 🚀 快速加载
- 💡 配合详细说明
- 🎯 用户在本地运行

**实现：**
- 在 Markdown 中直接嵌入代码块
- 使用 `title` 标注文件路径
- 提供完整的项目模板供下载

**示例：**
```typescript title="src/controller/home.controller.ts"
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

### 方案 B: 轻量演示模式

**适用场景：**
- 展示简单的代码片段
- 不需要实际运行
- 只做语法高亮

**实现：**
- 创建 `_files` 目录
- 放入 TypeScript 文件
- 不启用 preview

### 方案 C: 本地服务模式（未来）

**构想：**
- 教程页面展示内容
- 提供 "在本地运行" 按钮
- 下载项目到本地执行

## 推荐架构

```
tutorial/
├── 教程内容（TutorialKit）
│   ├── 理论讲解
│   ├── 代码展示（语法高亮）
│   └── 步骤说明
│
└── 示例项目（独立运行）
    ├── examples/
    │   ├── 01-hello-world/
    │   ├── 02-controller/
    │   ├── 03-service/
    │   └── ...
    └── README.md（运行说明）
```

## 类似项目参考

- **Node.js 官方教程** - 纯文档 + 本地运行
- **NestJS 文档** - 代码展示 + CodeSandbox 链接
- **Express 教程** - Markdown 教程 + GitHub 示例

## 结论

对于 Midway.js 这样的后端框架教程：
- ✅ 使用 TutorialKit 的优秀 UI 和导航
- ✅ 使用 Markdown/MDX 的强大功能
- ✅ 代码展示模式，不强制在浏览器运行
- ✅ 提供完整的本地运行示例

这是目前最实用和可维护的方案。
