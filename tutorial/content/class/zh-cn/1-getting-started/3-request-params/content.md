---
title: 获取请求参数
preview: /greet?name=Midway
focus: /src/controller/home.controller.ts
routes:
  - /
  - /greet?name=Midway
  - /user/1
checks:
  - /calc/add?a=1&b=2
---

# 获取请求参数

HTTP 请求里的数据通常来自查询串、路径参数或请求体。这一课先看 GET：`@Query()` 和 `@Param()`。

## 查询参数 `@Query`

`/greet?name=harry` 里的 `name` 用 `@Query('name')` 取出：

```typescript
@Get('/greet')
async greet(@Query('name') name: string) {
  return `你好, ${name || '游客'}!`;
}
```

右侧已经有这个接口，把预览地址改成 `/greet?name=harry` 试一下。

## 路径参数 `@Param`

`/user/42` 里的 `42` 对应路由里的 `:id`：

```typescript
@Get('/user/:id')
async getUserById(@Param('id') id: string) {
  return { userId: id };
}
```

路径参数拿到的一律是字符串。需要数字时自己转换，例如 `parseInt(id, 10)`。

## 练习

补一个计算器接口 `GET /calc/:operation`，从 query 读取 `a` 和 `b`：

- `/calc/add?a=1&b=2` 返回 `{ operation, a, b, result: 3 }`
- `operation` 支持 `add` / `subtract` / `multiply` / `divide`

右侧起点代码里还没有这个方法。写完后把预览指到 `/calc/add?a=1&b=2`。需要对照时点「查看答案」。
