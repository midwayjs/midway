# JWT

`JSON Web Token` (JWT)是一个开放标准(RFC 7519)，它定义了一种紧凑的、自包含的方式，用于作为`JSON`对象在各方之间安全地传输信息。该信息可以被验证和信任，因为它是数字签名的。

Midway 提供了 jwt 组件，简单提供了一些 jwt 相关的 API，可以基于它做独立的鉴权和校验。

相关信息：

| 描述              |     |
| ----------------- | --- |
| 可用于标准项目    | ✅  |
| 可用于 Serverless | ✅  |
| 可用于一体化      | ✅  |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 安装依赖

```bash
$ npm i @midwayjs/jwt@3 --save
$ npm i @types/jsonwebtoken --save-dev
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/jwt": "^3.0.0"
    // ...
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^8.5.8"
  }
}
```

## 使用组件

将 jwt 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/decorator';
import { IMidwayContainer } from '@midwayjs/core';
import * as jwt from '@midwayjs/jwt';

@Configuration({
  imports: [
    // ...
    jwt,
  ],
})
export class MainConfiguration {
  // ...
}
```

## 基础配置

然后在配置中设置，默认未加密。

```typescript
// src/config/config.default.ts
export default {
  // ...
  jwt: {
    secret: 'xxxxxxxxxxxxxx', // fs.readFileSync('xxxxx.key')
    expiresIn: '2d', // https://github.com/vercel/ms
  },
};
```

更多配置请查看 ts 定义。

## 常用 API

Midway 将 jwt 常用 API 提供为同步和异步两种形式。

```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';

@Provide()
export class UserService {
  @Inject()
  jwtService: JwtService;

  async invoke() {
    // 同步 API
    this.jwtService.signSync(payload, secretOrPrivateKey, options);
    this.jwtService.verifySync(token, secretOrPublicKey, options);
    this.jwtService.decodeSync(token, options);

    // 异步 API
    await this.jwtService.sign(payload, secretOrPrivateKey, options);
    await this.jwtService.verify(token, secretOrPublicKey, options);
    await this.jwtService.decode(token, options);
  }
}
```

这些 API 都来自于 [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) 基础库，如果不了解请阅读原版文档。

## 中间件示例

一般，jwt 还会配合中间件来完成鉴权，下面是一个自定义 jwt 鉴权的中间件示例。

```typescript
// src/middleware/jwt.middleware

import { Inject, Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import { httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new httpError.UnauthorizedError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          //jwt.verify方法验证token是否有效
          await jwtService.verify(token, {
            complete: true,
          });
        } catch (error) {
          //token过期 生成新的token
          const newToken = getToken(user);
          //将新token放入Authorization中返回给前端
          ctx.set('Authorization', newToken);
        }
        await next();
      }
    };
  }

  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignore = ctx.path.indexOf('/api/admin/login') !== -1;
    return !ignore;
  }
}
```

然后在入口启用中间件即可。


```typescript
// src/configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { IMidwayContainer, IMidwayApplication} from '@midwayjs/core';
import * as jwt from '@midwayjs/jwt';

@Configuration({
  imports: [
    // ...
    jwt,
  ],
})
export class MainConfiguration {

  @App()
  app: IMidwayApplication;

  async onReady(applicationContext: IMidwayContainer): Promise<void> {
    // 添加中间件
    this.app.useMiddleware([
      // ...
      JwtMiddleware,
    ]);
  }
}
```
