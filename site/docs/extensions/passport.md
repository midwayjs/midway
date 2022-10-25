# 身份验证

身份验证是大多数 Web 应用程序的重要组成部分。因此 Midway 封装了目前 Nodejs 中最流行的 Passport 库。

相关信息：

| web 支持情况      |     |
| ----------------- | --- |
| @midwayjs/koa     | ✅  |
| @midwayjs/faas    | ✅  |
| @midwayjs/web     | ✅  |
| @midwayjs/express | ✅  |

从 v3.4.0 开始 Midway 自行维护 passport，将不再需要引入社区包和类型包。

## 一些概念

passport 是社区使用较多的身份验证库，通过称为策略的可扩展插件进行身份验证请求。Passport 不挂载路由或假设任何特定的数据库，这最大限度地提高了灵活性并允许开发人员做出应用程序级别的决策。

它本身包含几个部分：

- 1、验证的策略，比如 jwt 验证，github 验证，oauth 验证等，passport 最为丰富的也是这块
- 2、执行策略之后，中间件的逻辑处理和配置，比如成功或者失败后的跳转，报错等

## 安装依赖

安装 `npm i @midwayjs/passport` 和相关策略依赖。

```bash
## 必选
$ npm i @midwayjs/passport@3 --save

## 可选
## 下面安装本地策略
$ npm i passport-local --save
$ npm i @types/passport-local --save-dev
## 下面安装 Github 策略
$ npm i passport-github --save
## 下面安装 Jwt 策略
$ npm i passport-jwt --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/passport": "^3.0.0",
    // 本地策略
    "passport-local": "^1.0.0"
    // Jwt 策略
    "passport-jwt": "^4.0.0",
    // Github 策略
    "passport-github": "^1.1.0",
    // ...
  },
  "devDependencies": {
    // 本地策略
    "@types/passport-local": "^1.0.34",
    // Jwt 策略
    "@types/passport-jwt": "^3.0.6",
    // Github 策略
    "@types/passport-github": "^1.1.7",
    // ...
  }
}
```

## 启用组件

首先启用组件。

```typescript
// src/configuration.ts

import { join } from 'path';
import { ILifeCycle } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [
    // ...
    passport,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration implements ILifeCycle {}
```

## 策略示例

这里我们以使用本地认证策略，和 Jwt 策略作为演示。

### 示例：本地策略

我们可以通过 `@CustomStrategy` 和派生 `PassportStrategy` 来自启动一个策略。通过 validate 钩子来获取有效负载，并且此函数必须有返回值，其参数并不明确，可以参考对应的 Strategy 或者通过展开符打印查看。

```typescript
// src/strategy/local.strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserEntity } from './user';
import * as bcrypt from 'bcrypt';

@CustomStrategy()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  // 策略的验证
  async validate(username, password) {
    const user = await this.userModel.findOne({ username });
    if (await bcrypt.compare(password, user.password)) {
      throw new Error('error password ' + username);
    }

    return {
      username,
      password,
    };
  }

  // 当前策略的参数
  getStrategyOptions(): any {
    return {};
  }
}
```

:::tip

注意：validate 方法是社区策略 verify 的 Promise 化替代方法，你无需在最后传递 callback 参数。

:::

使用派生 `PassportMiddleware`出一个中间件。

```typescript
// src/middleware/local.middleware.ts

import { Inject, Middleware } from '@midwayjs/decorator';
import { PassportMiddleware, AuthenticateOptions } from '@midwayjs/passport';
import { LocalStrategy } from './strategy/local.strategy.ts';

@Middleware()
export class LocalPassportMiddleware extends PassportMiddleware(LocalStrategy) {
  // 设置 AuthenticateOptions
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {
      failureRedirect: '/login',
    };
  }
}
```

```typescript
// src/controller.ts
import { Post, Inject, Controller } from '@midwayjs/decorator';
import { LocalPassportMiddleware } from './middleware/local.middleware.ts';

@Controller('/')
export class LocalController {
  @Post('/passport/local', { middleware: [LocalPassportMiddleware] })
  async localPassport() {
    console.log('local user: ', this.ctx.state.user);
    return this.ctx.state.user;
  }
}
```

使用 curl 模拟一次请求。

```bash
curl -X POST http://localhost:7001/passport/local -d '{"username": "demo", "password": "1234"}' -H "Content-Type: application/json"

结果 {"username": "demo", "password": "1234"}
```

### 示例：Jwt 策略

首先需要 **额外安装** 依赖和策略：

```bash
$ npm i @midwayjs/jwt passport-jwt --save
```

额外启用 jwt 组件。

```typescript
// configuration.ts

import { join } from 'path';
import * as jwt from '@midwayjs/jwt';
import { ILifeCycle } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [
    // ...
    jwt,
    passport,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration implements ILifeCycle {}
```

然后在配置中设置，默认未加密，请不要把敏感信息存放在 payload 中。

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

```typescript
// src/strategy/jwt.strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Config } from '@midwayjs/decorator';

@CustomStrategy()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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

:::tip

注意：validate 方法是社区策略 verify 的 Promise 化替代方法，你无需在最后传递 callback 参数。

:::

```typescript
// src/middleware/jwt.middleware.ts

import { Middleware } from '@midwayjs/decorator';
import { PassportMiddleware, AuthenticateOptions } from '@midwayjs/passport';
import { JwtStrategy } from '../strategy/jwt.strategy';

@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }
}
```

```typescript
import { Post, Inject, Controller } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { JwtPassportMiddleware } from '../middleware/jwt.middleware';

@Controller('/')
export class JwtController {
  @Inject()
  jwt: JwtService;

  @Inject()
  ctx: Context;

  @Post('/passport/jwt', { middleware: [JwtPassportMiddleware] })
  async jwtPassport() {
    console.log('jwt user: ', this.ctx.state.user);
    return this.ctx.state.user;
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
首先 `npm i passport-github`，之后编写如下代码：

```typescript
// github-strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, StrategyOptions } from 'passport-github';

const GITHUB_CLIENT_ID = 'xxxxxx',
  GITHUB_CLIENT_SECRET = 'xxxxxxxx';

@CustomStrategy()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  async validate(...payload) {
    return payload;
  }

  getStrategyOptions(): StrategyOptions {
    return {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'https://127.0.0.1:7001/auth/github/cb',
    };
  }
}
```

```typescript
// src/middleware/github.middleware.ts

import { AuthenticateOptions, PassportMiddleware } from '@midwayjs/passport';
import { Middleware } from '@midwayjs/decorator';
import { GithubStrategy } from './githubStrategy';

@Middleware()
export class GithubPassportMiddleware extends PassportMiddleware(GithubStrategy) {
  getAuthenticateOptions(): AuthenticateOptions | Promise<AuthenticateOptions> {
    return {};
  }
}
```

```typescript
// src/controller/auth.controller.ts

import { Controller, Get, Inject } from '@midwayjs/decorator';
import { GithubPassportMiddleware } from '../../middleware/github';

@Controller('/oauth')
export class AuthController {
  @Inject()
  ctx;

  @Get('/github', { middleware: [GithubPassportMiddleware] })
  async githubOAuth() {}

  @Get('/github/cb', { middleware: [GithubPassportMiddleware] })
  async githubOAuthCallback() {
    return this.ctx.state.user;
  }
}
```

## 策略选项

| 选项                | 类型    | 描述                                              |
| ------------------- | ------- | ------------------------------------------------- |
| failureRedirect     | string  | 失败跳转的 url                                    |
| session             | boolean | 默认 true，开启后，会自动将用户信息设置到 session |
| sessionUserProperty | string  | 设置到 session 上的 key，默认 user                |
| userProperty        | string  | 设置到 ctx.state 或者 req 上的 key，默认 user     |
| successRedirect     | string  | 用户认证成功后跳转的地址                          |

## 常见问题

### 1、Failed to serialize user into session

由于 passport 默认会尝试将 user 数据写入 session，如果无需将用户保存到 session，可以将 session 支持关闭。

```typescript
// src/config/config.default
export default {
  // ...
  passport: {
    session: false,
  },
};
```

如果明确需要保存数据到 Session，则需要重写 `PassportStrategy`的 User 的序列化方法，请不要保存特别大的数据。

比如自己实现的本地策略。

```typescript
// src/strategy/local.strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/orm';
import { UserEntity } from './user';
import * as bcrypt from 'bcrypt';

@CustomStrategy()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // ...
  serializeUser(user, done) {
    // 可以只保存用户名
    done(null, user.username);
  }

  deserializeUser(id, done) {
    // 这里不是异步方法，你可以从其他地方根据用户名，反查用户数据。
    const user = getUserFromDataBase(id);

    done(null, user);
  }
}
```
