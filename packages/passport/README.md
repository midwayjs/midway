身份验证是大多数Web应用程序的重要组成部分。因此Midway封装了目前Nodejs中最流行的Passport库。
Passport是通过称为策略的可扩展插件进行身份验证请求。Passport 不挂载路由或假设任何特定的数据库，这最大限度地提高了灵活性并允许开发人员做出应用程序级别的决策。


## 准备


1. 安装 `npm i @midwayjs/passport`



```bash
@midwayjs/express
npm i passport
```


```bash
@midwayjs/koa, @midwayjs/web
npm i koa-passport
```


2. 开启相对应框架的 bodyparser



## 使用
这里我们以本地认证，和Jwt作为演示。
​

首先
```bash
// configuration.ts

import { join } from 'path';
import * as jwt from '@midwayjs/jwt';
import { ILifeCycle,} from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [
    jwt,
    passport,
  ],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {}

```
### e.g. 本地
我们可以通过`@BootStrategy`和派生`ExpressPassportStrategyAdapter`来自启动一个策略。通过 verify 钩子来获取有效负载，并且此函数必须有返回值，其参数并不明确，可以参考对应的Strategy或者通过展开符打印查看。
PS. Koa，Egg请使用`WebPassportStrategyAdapter`。
```typescript
// local-strategy.ts

import { BootStrategy, ExpressPassportStrategyAdapter } from '@midwayjs/passport';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/orm';
import { UserEntity } from './user';
import * as bcrypt from 'bcrypt';

@BootStrategy({
  async useParams() {
    return {
      passwordField: 'pwd',
    };
  },
})
export class LocalStrategy extends ExpressPassportStrategyAdapter(Strategy, 'local') {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  async verify(username, password) {
    const user = await this.userModel.findOne({ username });
    if (await bcrypt.compare(password, user.password)) {
      throw new Error('error password ' + username);
    }

    return {
      username,
      password,
    };
  }
}

```
之后派生`ExpressPassportMiddleware`出一个中间件。PS. Koa，Egg 使用`WebPassportMiddleware`
```typescript
// local-middleware.ts

import { Inject, Provide } from '@midwayjs/decorator';
import { ExpressPassportMiddleware } from '@midwayjs/passport';
import { Context } from '@midwayjs/express';

@Provide('local') // 此处可以使用一个简短的identifier
export class LocalPassportMiddleware extends ExpressPassportMiddleware {
  // required
  strategy: string = 'local';

  // 设置 AuthenticateOptions
  async setOptions(ctx?: Context): AuthenticateOptions {
    return {
      failureRedirect: '/login',
      presetProperty: 'user'
    };
  }

  // required
  // 首个参数为Context, 剩余参数请看 passport.authenticate
  // auth返回值默认会被挂到req.user上，当然你可以通过presetProperty来更改
  // PS. 获取上下文实例可以使用 ctx.requestContext.get<xxx>('xxx');
  async auth(_ctx, _err, data): Promise<Record<any, any>> {
    return data;
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
使用curl 模拟一次请求。
```bash
curl -X POST http://localhost:7001/passport/local -d '{"username": "demo", "pwd": "1234"}' -H "Content-Type: application/json"

结果 {"username": "demo", "pwd": "1234"}
```
### e.g. Jwt
首先你需要安装`npm i @midwayjs/jwt`，然后在 config.ts 中配置。PS.  默认未加密，请不要吧敏感信息存放在payload中。
```typescript
export const jwt = {
	secret: 'xxxxxxxxxxxxxx', // fs.readFileSync('xxxxx.key')
  expiresIn: '2d'   // https://github.com/vercel/ms
}
```
```typescript
// jwt-strategy.ts

import { BootStrategy, ExpressPassportStrategyAdapter } from '@midwayjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@BootStrategy({
  async useParams({ configuration }) {
    return {
      // 需要在config中配置secret
      secretOrKey: configuration.jwt.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
  },
})
export class JwtStrategy extends ExpressPassportStrategyAdapter(Strategy, 'jwt') {
  async verify(payload) {
    return payload;
  }
}

```
```typescript
// jwt-middleware.ts

import { Provide } from '@midwayjs/decorator';
import { ExpressPassportMiddleware } from '@midwayjs/passport';

@Provide()
export class JwtPassportMiddleware extends ExpressPassportMiddleware {
  strategy: string = 'jwt';

  async auth(_ctx, _err, data) {
    return data;
  }
}
```
```typescript
import { Provide, Post, Inject } from '@midwayjs/decorator';
import { Controller, Post } from '@midwayjs/decorator';
import { Jwt } from '@midwayjs/jwt';

@Provide()
@Controller('/')
export class JwtController {

  @Inject()
  jwt: Jwt;

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
使用curl模拟请求
```bash
curl -X POST http://127.0.0.1:7001/jwt

结果 {"t": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}

curl http://127.0.0.1:7001/passport/jwt -H "Authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

结果 {"msg": "Hello Midway","iat": 1635468727,"exp": 1635468827}

```
## 自定义其他策略


`@midwayjs/passport`支持自定义[其他策略](http://www.passportjs.org/packages/)，这里以github oauth为例。
首先 `npm i passport-github`，之后编写如下代码：
```typescript
// github-strategy.ts

import { BootStrategy, ExpressPassportStrategyAdapter } from '@midwayjs/passport';
import { Strategy, StrategyOptions } from 'passport-github';

const GITHUB_CLIENT_ID = 'xxxxxx', GITHUB_CLIENT_SECRET = 'xxxxxxxx';

@BootStrategy({
  async useParams({ configuration }): Promise<StrategyOptions> {
    return {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'https://127.0.0.1:7001/auth/github/cb'
    };
  },
})
export class GithubStrategy extends ExpressPassportStrategyAdapter(Strategy, 'github') {
  async verify(...payload) {
    return payload;
  }
}

```
```typescript
// github-middleware.ts

import { ExpressPassportMiddleware } from '@midwayjs/passport';

@Provide()
export class GithubPassportMiddleware extends ExpressPassportMiddleware {
  strategy: string = 'github';

  async auth(_ctx, ...data) {
    return data;
  }
}
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

