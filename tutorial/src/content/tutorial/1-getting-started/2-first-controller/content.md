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

# 创建第一个 Controller

Controller（控制器）负责处理 HTTP 请求并返回响应。让我们创建一个简单的 API 接口。

## 什么是 Controller？

在 Midway 中，Controller 是一个使用 `@Controller()` 装饰器标记的类，它的方法对应不同的 HTTP 路由。

## 查看示例代码

👉 打开右侧的 `src/controller/home.controller.ts` 文件。

您会看到一个基本的 Controller：

```typescript
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

## 代码解析

### 1. `@Controller('/')` 装饰器
- 定义这是一个控制器类
- 参数 `'/'` 是路由前缀，所有方法的路由都会加上这个前缀

### 2. `@Get('/')` 装饰器
- 定义这是一个 GET 请求的处理方法
- 参数 `'/'` 是具体的路由路径
- 完整路径 = 控制器前缀 + 方法路径 = `'/' + '/'` = `'/'`

### 3. 方法返回值
- 直接返回字符串，Midway 会自动处理响应
- 也可以返回对象，会自动转换为 JSON

## 动手实践：修改返回内容

尝试修改 `home()` 方法的返回值：

```typescript
async home() {
  return 'Hello Midwayjs! 欢迎来到交互式教程！';
}
```

保存后，您应该能在预览窗口看到新的内容。

## 添加更多路由

让我们添加一个新的路由，返回 JSON 数据：

```typescript
@Get('/info')
async info() {
  return {
    name: 'Midway.js',
    version: '4.0',
    description: '一个面向未来的 Node.js 框架'
  };
}
```

这个接口会返回 JSON 格式的数据。

## 常用的 HTTP 方法装饰器

- `@Get()` - 处理 GET 请求
- `@Post()` - 处理 POST 请求
- `@Put()` - 处理 PUT 请求
- `@Del()` - 处理 DELETE 请求
- `@Patch()` - 处理 PATCH 请求

## 小结

✅ Controller 使用 `@Controller()` 装饰器定义
✅ 路由使用 `@Get()`, `@Post()` 等装饰器声明
✅ 返回值自动处理为 HTTP 响应
✅ 支持返回字符串、对象等多种类型

下一节，我们将学习如何获取请求参数！
