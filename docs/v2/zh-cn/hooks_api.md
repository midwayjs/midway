---
title: 接口开发 & 前端调用
---

## “零” API 调用

在 Midway Hooks 中，你在前端可以直接导入服务端函数并进行调用。
​

这意味着你再也不用拼接 API URL，在前端手动发起请求并管理状态等。

> 后端接口

```typescript
import { useContext } from '@midwayjs/hooks';

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext();
  return ctx.path;
}

export async function post(name: string) {
  const ctx = useContext();

  return {
    message: `Hello ${name}!`,
    method: ctx.method,
  };
}
```

> 前端调用

```typescript
import { getPath, post } from './apis/lambda';

// send GET request to /api/getPath
const path = await getPath();
console.assert(path === '/api/getPath');

const { message, method } = await post('Jake');

console.assert(message === 'Hello Jake!');
console.assert(method === 'POST');
```

我们打造了“零” API 调用功能，你只需要关注于接口的调用，而非 HTTP 的细节。

## 创建接口与调用

在 Midway Hooks 中，我们默认配置的接口是在 `lambda` 文件夹下 任意 `.ts` 文件中导出的异步函数，你也可以通过[路由配置](/docs/hooks_route)来使用自定义的文件夹。

### Get

导出的函数中，如果不带参数则为 `Get` 接口。

> /apis/lambda/index.ts

```typescript
export async function foo() {
  return 'foo';
}
```

> 前端调用示例(src/app.tsx)

```typescript
import { foo } from './apis/lambda';

const response = await foo();
console.log(response); // foo
```

### Post

函数有参数则为 `Post` 接口。

> /apis/lambda/index.ts

```typescript
export async function bar(name: string) {
  return `hello ${name}`;
}
```

> 前端调用示例(src/app.tsx)

```typescript
import { bar } from './apis/lambda';

const response = await bar('张三');
console.log(response); // hello 张三
```

### Put/Delete

Midway Hooks 的接口信息与前端调用 SDK 均为自动生成，因此不支持 `Put/Delete` 调用。

## 规则

Midway Hooks 的接口，必须是在模块顶层直接导出的函数。

> 例子

```typescript
export async function demo() {}

export const demo = async function () {};

export default async function demo() {}
```
