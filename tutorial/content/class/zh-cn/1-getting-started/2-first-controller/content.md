---
title: 创建第一个 Controller
focus: /src/controller/home.controller.ts
checks:
  - /info
---

# 创建第一个 Controller

Controller 负责处理 HTTP 请求并返回响应。右侧已经有一个最小的例子：`GET /` 返回字符串。

## 什么是 Controller？

在 Midway 中，Controller 是一个用 `@Controller()` 标记的类，它的方法对应不同的 HTTP 路由。

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

- `@Controller('/')` 定义路由前缀。所有方法的路径都会拼在这个前缀后面。
- `@Get('/')` 声明这是一个 GET 处理函数。完整路径 = 前缀 + 方法路径，这里就是 `/`。
- 方法直接返回字符串或对象即可：字符串按文本返回，对象会序列化成 JSON。

常用的方法装饰器还有 `@Post()`、`@Put()`、`@Del()`、`@Patch()`。

## 练习

在 `HomeController` 里新增一个 `GET /info`，返回 JSON：

```typescript
@Get('/info')
async info() {
  return {
    name: 'Midway.js',
    version: '4.0',
  };
}
```

保存后，把预览地址改成 `/info`，应该能看到这段 JSON。卡住了可以点右上角的「查看答案」。
