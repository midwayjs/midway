---
title: Hooks 语法
---

Midway Hooks 使用了类似于 React Hooks 的语法，允许开发者通过 Function + Hooks 的方式，获取当前请求数据并提供 Web 服务。

在下面的例子中，我们通过 `useContext` 获取请求上下文，并返回当前请求的 HTTP Method。

```typescript
import { useContext } from '@midwayjs/hooks';

export function getHttpMethod() {
  const { request } = useContext();
  return request.method;
}
```

## 什么是 Hooks

Hooks 是一些可以让你在函数里访问当前请求上下文信息的函数。

我们提供了内置的 Hooks：

- useContext: 获取请求上下文
- useLogger: 获取 Logger
- useInject: 获取 IoC 注入的实例
- useConfig: 获取用户配置
- usePlugin: 获取 Egg 插件

你也可以创建自己的 Hooks 来复用代码逻辑。

## 与 React Hooks 的区别

在 Midway Hooks 中，Hooks 是用于访问请求上下文信息的函数。因此 Hooks 只是用于访问信息，而不能保存状态或执行副作用等。

## 自定义 Hooks

我们可以通过自定义 Hooks 来对复杂逻辑进行封装与复用。

在定义与封装 Hooks 时，我们要求遵守统一的 Hooks 命名规范，以 `use` 作为自定义 Hooks 的命名前缀，如 `useHeader, usePath` 等。

> 定义 Hooks（apis/hooks/request.ts）

```typescript
import { useContext } from '@midwayjs/hooks';

export function useHeader() {
  const { request } = useContext();
  return request.headers;
}

export function usePath() {
  const { request } = useContext();
  return request.path;
}
```

> 调用自定义 Hooks（apis/function/index.ts）

```typescript
import { useHeader, usePath } from '../hooks/request';

export function get() {
  return {
    header: useHeader(),
    path: usePath(),
  };
}
```
