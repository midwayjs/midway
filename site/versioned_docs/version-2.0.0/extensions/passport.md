---
title: Passport
---

身份验证是大多数 Web 应用程序的重要组成部分。因此 Midway 封装了目前 Node.js 中最流行的 Passport 库。
​

Passport 是通过称为策略的可扩展插件进行身份验证请求。Passport 不挂载路由或假设任何特定的数据库，这最大限度地提高了灵活性并允许开发人员做出应用程序级别的决策。

## 准备

1. 安装 `npm i @midwayjs/passport`

```bash
$ npm i @midwayjs/passport passport --save
$ npm i @types/passport --save-dev
```

2. 如果你需要保存到 session 中，开启相对应框架的 session 功能

## 使用

​

这里我们以本地认证，和 JWT 作为演示，这里用到了另一个 JWT 组件。
​

首先

```typescript
// src/configuration.ts

import { ILifeCycle } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as jwt from '@midwayjs/jwt';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [jwt, passport],
  // ...
})
export class ContainerLifeCycle implements ILifeCycle {}
```

### e.g. 本地策略

​

我们可以通过 `@CustomStrategy` 和派生 `PassportStrategy`来 自启动一个策略。通过 validate 钩子来获取有效负载，并且此函数必须有返回值，其参数并不明确，可以参考对应的 Strategy 或者通过展开符打印查看。

```typescript
// strategy/local.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import * as bcrypt from 'bcrypt';

@CustomStrategy()
export class LocalStrategy extends PassportStrategy(Strategy) {
  async validate(user, password) {
    // 实际的秘钥
    const password = '*********';

    // 和用户的秘钥做对比
    const isLegalUser = await bcrypt.compare(password, user.password);
    if (!isLegalUser) {
      throw new Error('error password ' + user.name);
    }

    return {
      user,
      password,
    };
  }

  // 当前策略的参数
  getStrategyOptions(): any {
    return {
      passwordField: 'pwd',
    };
  }
}
```

之后派生`PassportMiddleware`出一个中间件。

```typescript
// local-middleware.ts

import { Inject, Provide } from '@midwayjs/decorator';
import { PassportMiddleware } from '@midwayjs/passport';
import { Context } from '@midwayjs/express';

@Provide('local') // 此处可以使用一个简短的identifier
export class LocalPassportMiddleware extends PassportMiddleware(LocalStrategy) {
  // 设置 AuthenticateOptions
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      failureRedirect: '/login',
      presetProperty: 'user',
    };
  }
}
```

```typescript
// controller.ts

import { Provide, Post, Inject, Controller } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class LocalController {
  @Post('/passport/local', { middleware: ['local'] })
  async localPassport() {
    console.log('local user: ', this.ctx.req.user);
    return this.ctx.req.user;
  }
}
```

使用 curl 模拟一次请求。

```bash
curl -X POST http://localhost:7001/passport/local -d '{"username": "demo", "pwd": "1234"}' -H "Content-Type: application/json"

结果 {"username": "demo", "pwd": "1234"}
```

###

注意，express 的用户信息会保存到 `req.user` ，而 koa/egg 会保存到 `ctx.state.user` 。

###

### e.g. Jwt

首先需要 **额外安装** 依赖和策略：

```bash
$ npm i @midwayjs/jwt passport-jwt --save
```

然后在 config.ts 中配置， 默认未加密，请不要把敏感信息存放在 payload 中。

```typescript
export const jwt = {
  secret: 'xxxxxxxxxxxxxx', // fs.readFileSync('xxxxx.key')
  expiresIn: '2d', // https://github.com/vercel/ms
};
```

```typescript
// jwt-strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@CustomStrategy()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Config('jwt')
  jwtConfig;

  async validate(payload) {
    return payload;
  }

  getStrategyOptions(): any {
    return {
      secretOrKey: this.jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
  }
}
```

```typescript
// jwt-middleware.ts

import { Provide } from '@midwayjs/decorator';
import { PassportMiddleware } from '@midwayjs/passport';

@Provide()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {};
  }
}
```

```typescript
import { Provide, Post, Inject } from '@midwayjs/decorator';
import { Controller, Post } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';

@Provide()
@Controller('/')
export class JwtController {

  @Inject()
  jwt: JwtService;

  @Inject();
  ctx: any;

  @Post('/passport/jwt', { middleware: ['jwtPassportMiddleware'] })
  async jwtPassport() {
    console.log('jwt user: ', this.ctx.req.user);
    return this.ctx.req.user;
  }

  @Post('/jwt')
  async genJwt() {
    return {
      t: await this.jwt.sign({ msg: 'Hello Midway' }),
    };
  }
}
```

使用 curl 模拟请求

```bash
curl -X POST http://127.0.0.1:7001/jwt

结果 {"t": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}

curl http://127.0.0.1:7001/passport/jwt -H "Authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

结果 {"msg": "Hello Midway","iat": 1635468727,"exp": 1635468827}

```

## 自定义其他策略

`@midwayjs/passport` 支持自定义[其他策略](http://www.passportjs.org/packages/)，这里以 Github OAuth 为例。
​

首先需要安装相应的 passport 库。

```bash
$ npm i passport-github --save
```

​

编写如下策略代码：

```typescript
// github-strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, StrategyOptions } from 'passport-github';

const GITHUB_CLIENT_ID = 'xxxxxx',
  GITHUB_CLIENT_SECRET = 'xxxxxxxx';

@CustomStrategy()
export class GithubStrategy extends PassportStrategy(Strategy) {
  async validate(...payload) {
    return payload;
  }
  getStrategyOptions() {
    return {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'https://127.0.0.1:7001/auth/github/cb',
    };
  }
}
```

提供一个中间件

```typescript
// github-middleware.ts

import { PassportMiddleware } from '@midwayjs/passport';

@Provide()
export class GithubPassportMiddleware extends PassportMiddleware {}
```

```typescript
// controller.ts

import { Provide, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/oauth')
export class AuthController {
  @Inject()
  ctx: any;

  @Get('/github', { middleware: ['githubPassportMiddleware'] })
  async githubOAuth() {}

  @Get('/github/cb', { middleware: ['githubPassportMiddleware'] })
  async githubOAuthCallback() {
    return this.ctx.req.user;
  }
}
```

​

​

## 一些相关资料

- [JWT 入门](https://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
