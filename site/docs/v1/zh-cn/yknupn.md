---
title: 全局中间件
---

当前，midway v1 的全局中间件为 egg 提供，使用 egg 写法，和路由中间件有所区别，并且**不能使用**注入的形式使用。

## 写一个全局中间件

我们先来通过编写一个简单的 report 中间件，来看看中间件的写法。

```typescript
// src/app/middleware/report.ts

module.exports = () => {
  return async function (ctx, next) {
    const startTime = Date.now();
    await next();
    // 上报请求时间
    reportTime(Date.now() - startTime);
  };
};
```

可以看到，框架的中间件和 Koa 的中间件写法是一样的，所以任何 Koa 的中间件都可以直接被框架使用。

在 `config.default.ts`  中配置。

```typescript
module.exports = {
  middleware: ['report'],
};
```

这里配置的名字和文件名一致。

## 直接使用 koa 中间件

如果希望直接使用 koa 中间件，以 koa-compress 为例，在 Koa 中使用时，我们按照框架的规范来在应用中加载这个 Koa 的中间件：

```typescript
// src/app/middleware/compress.ts
// koa-compress 暴露的接口((options) => middleware)和框架对中间件要求一致
module.exports = require('koa-compress');
```

配置

```typescript
// src/config/config.default.js
module.exports = {
  middleware: ['compress'],
};
```
