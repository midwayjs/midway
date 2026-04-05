# 参数校验

这一节说明 Functional API 里的参数校验方式，以及它和 class + decorator + pipeline 的关系。

## 结论先说

- Class 写法通常用参数装饰器 + pipe 机制做校验。
- Functional 写法用 `input(...)` / `output(...)` 做校验。
- 两者都能保证运行时安全，只是声明方式不同。
- Functional 场景下，`input(...)` 的 schema 类型还会继续传给 `handle(...)`。

## Functional 的校验入口

在 `defineApi` 里：

- `input(...)`：校验请求输入（`params/query/body/headers`）
- `output(...)`：校验响应输出

示例：

```ts
import { defineApi } from '@midwayjs/core/functional';
import { z } from 'zod';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({
      params: z.object({
        id: z.string().min(1),
      }),
      query: z.object({
        verbose: z.string().optional(),
      }),
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .handle(async ({ input }) => {
      return {
        id: input.params.id,
        name: 'harry',
      };
    }),
}));
```

上面这段代码里：

- `params.id` 在请求进入业务逻辑前会先做运行时校验
- `handle(...)` 里的 `input.params.id` 会直接拿到 `string` 类型提示

## 失败时会发生什么

- `input(...)` 校验失败：请求会在进入业务逻辑前失败。
- `output(...)` 校验失败：handler 返回后、响应前失败。

这样可以避免不合法数据进入服务层，也能避免错误响应结构流出。

## 支持什么 schema

Functional 内部会调用 schema 的解析接口（如 `safeParse/safeParseAsync/parse/parseAsync`），因此像 zod 这类 schema 库可以直接使用。

## 常见实践建议

1. 先给核心接口加 `input(...)`，特别是写操作接口。  
2. 再补 `output(...)`，保证前后端返回结构稳定。  
3. 把业务校验（如权限、业务规则）留在 service 层，不要全堆在 schema。  
