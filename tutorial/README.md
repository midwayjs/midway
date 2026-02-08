# Midway.js 交互式教程

这是一个基于 TutorialKit 构建的 Midway.js 交互式教程，帮助开发者从零开始学习 Midway.js 框架。

## 教程内容

### 第一部分：创建应用
1. **项目结构介绍** - 了解 Midway 应用的基本结构
2. **创建第一个 Controller** - 学习如何处理 HTTP 请求
3. **获取请求参数** - 掌握各种参数获取方式

### 第二部分：依赖注入与 Service
1. **创建第一个 Service** - 学习如何组织业务逻辑
2. **依赖注入的使用** - 理解 IoC 容器和依赖注入

### 第三部分：处理请求与响应
1. **处理 POST 请求** - 学习 RESTful API 开发
2. **错误处理** - 掌握异常处理和错误响应

### 第四部分：中间件与配置
1. **理解中间件** - 学习中间件的概念和使用
2. **应用配置管理** - 掌握多环境配置

### 第五部分：数据验证与最佳实践
1. **数据验证** - 学习如何验证请求数据
2. **最佳实践总结** - 了解开发规范和最佳实践

## 特点

✅ **交互式学习** - 边学边练，实时查看效果
✅ **循序渐进** - 从基础到进阶，逐步深入
✅ **代码示例** - 丰富的可运行代码示例
✅ **最佳实践** - 学习业界认可的开发规范

## 本地运行

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:4321 开始学习。

### 构建生产版本

```bash
pnpm build
```

### 多教程 + 多语言构建

当前支持通过“构建矩阵”产出四套静态站点：

- `class/zh-cn`
- `class/en`
- `function/zh-cn`
- `function/en`

内容来源目录：

```text
sources/
  class/zh-cn/tutorial
  class/en/tutorial
  function/zh-cn/tutorial
  function/en/tutorial
```

执行构建：

```bash
npm run build:matrix
```

产物目录：

```text
dist-matrix/
  index.html
  class/zh-cn
  class/en
  function/zh-cn
  function/en
```

默认会按 `midwayjs.org/tutorial/...` 路径生成路由前缀，例如：

- `/tutorial/class/zh-cn/`
- `/tutorial/class/en/`
- `/tutorial/function/zh-cn/`
- `/tutorial/function/en/`

可通过环境变量覆盖前缀：

```bash
TUTORIAL_PATH_PREFIX=/custom npm run build:matrix
```

## 技术栈

- [Astro](https://astro.build/) - 现代静态站点生成器
- [TutorialKit](https://tutorialkit.dev/) - 交互式教程框架
- [Midway.js](https://midwayjs.org/) - Node.js 框架

## 反馈

如果您在学习过程中遇到问题或有改进建议，欢迎提交 Issue。

## 相关链接

- [Midway.js 官方文档](https://midwayjs.org/)
- [Midway.js GitHub](https://github.com/midwayjs/midway)
- [TutorialKit 官网](https://tutorialkit.dev/)

## 许可证

MIT
