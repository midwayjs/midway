---
type: lesson
title: 获取请求参数
focus: /src/controller/home.controller.ts
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

# 获取请求参数

在真实的应用中，我们经常需要获取用户提交的数据。Midway 提供了多种装饰器来方便地获取不同类型的参数。

## 常用参数装饰器

| 装饰器 | 说明 | 示例 URL |
|--------|------|----------|
| `@Query()` | 获取 URL 查询参数 | `/user?name=tom` |
| `@Param()` | 获取路由参数 | `/user/:id` |
| `@Body()` | 获取请求体 | POST 请求的 JSON 数据 |
| `@Headers()` | 获取请求头 | `Authorization` 等 |

## 1. 获取查询参数 @Query

最常见的参数类型，通过 URL `?key=value` 传递。

修改 `home.controller.ts`，添加一个问候接口：

```typescript
import { Controller, Get, Query } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/greet')
  async greet(@Query('name') name: string) {
    return `你好, ${name || '游客'}!`;
  }
}
```

这段代码的效果：
- 访问 `/greet?name=张三` 会返回 "你好, 张三!"
- 访问 `/greet` 会返回 "你好, 游客!"

## 2. 获取路由参数 @Param

路由参数是 URL 路径的一部分，用于 RESTful 风格的 API。

```typescript
@Get('/user/:id')
async getUserById(@Param('id') id: string) {
  return {
    userId: id,
    name: `用户${id}`,
    email: `user${id}@example.com`
  };
}
```

当访问 `/user/123` 时，会得到：

```json
{
  "userId": "123",
  "name": "用户123",
  "email": "user123@example.com"
}
```

## 3. 组合使用多个参数

您可以在同一个方法中使用多个参数装饰器：

```typescript
@Get('/search/:category')
async search(
  @Param('category') category: string,
  @Query('keyword') keyword: string,
  @Query('page') page: string = '1'
) {
  return {
    category,
    keyword,
    page: parseInt(page),
    results: []
  };
}
```

当访问 `/search/books?keyword=TypeScript&page=2` 时：

```json
{
  "category": "books",
  "keyword": "TypeScript",
  "page": 2,
  "results": []
}
```

## 动手实践

现在让我们创建一个计算器 API：

```typescript
@Get('/calc/:operation')
async calculate(
  @Param('operation') operation: string,
  @Query('a') a: string,
  @Query('b') b: string
) {
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);

  let result: number;
  switch (operation) {
    case 'add':
      result = num1 + num2;
      break;
    case 'subtract':
      result = num1 - num2;
      break;
    case 'multiply':
      result = num1 * num2;
      break;
    case 'divide':
      result = num1 / num2;
      break;
    default:
      return { error: '不支持的操作' };
  }

  return {
    operation,
    a: num1,
    b: num2,
    result
  };
}
```

这个计算器 API 支持以下操作：
- `/calc/add?a=10&b=5` → 结果: 15
- `/calc/multiply?a=6&b=7` → 结果: 42
- `/calc/divide?a=100&b=4` → 结果: 25

## 类型转换提示

⚠️ 注意：URL 参数始终是字符串类型，需要手动转换：

- 数字：`parseInt(str)` 或 `parseFloat(str)`
- 布尔：`str === 'true'`
- 日期：`new Date(str)`

## 小结

✅ `@Query()` 获取 URL 查询参数
✅ `@Param()` 获取路由参数
✅ 可以组合使用多个参数装饰器
✅ 记得进行类型转换和验证

下一节，我们将学习如何使用 Service 来组织业务逻辑！
