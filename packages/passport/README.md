# @midwayjs/passport

身份验证是大多数Web应用程序的重要组成部分。因此Midway封装了目前Nodejs中最流行的Passport库。
Passport是通过称为策略的可扩展插件进行身份验证请求。Passport 不挂载路由或假设任何特定的数据库，这最大限度地提高了灵活性并允许开发人员做出应用程序级别的决策。


## 准备


1. 安装 `npm i @midwayjs/passport` 和相关依赖

```bash
$ npm i @midwayjs/passport passport --save
$ npm i @types/passport --save-dev
```

2. 如果有需要的话，开启相对应框架的 bodyparser，session


## 使用

这里我们以本地认证，和Jwt作为演示。


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
我们可以通过`@CuustomStrategy`和派生`PassportStrategy`来自启动一个策略。通过 validate 钩子来获取有效负载，并且此函数必须有返回值，其参数并不明确，可以参考对应的Strategy或者通过展开符打印查看。
```typescript
// local-strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/orm';
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
使用派生`PassportMiddleware`出一个中间件。
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
      presetProperty: 'user'
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
使用curl 模拟一次请求。
```bash
curl -X POST http://localhost:7001/passport/local -d '{"username": "demo", "password": "1234"}' -H "Content-Type: application/json"

结果 {"username": "demo", "password": "1234"}
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
// strategy/jwt-strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@CustomStrategy()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt'
) {
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
import { JwtStrategy } from './strategy/jwt-strategy';

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
import { Jwt } from '@midwayjs/jwt';

@Provide()
@Controller('/')
export class JwtController {

  @Inject()
  jwt: Jwt;

  @Inject()
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

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, StrategyOptions } from 'passport-github';

const GITHUB_CLIENT_ID = 'xxxxxx', GITHUB_CLIENT_SECRET = 'xxxxxxxx';

@CustomStrategy()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  async validate(...payload) {
    return payload;
  }
  getStrategyOptions() {
    return {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'https://127.0.0.1:7001/auth/github/cb'
    };
  }
}

```
```typescript
// github-middleware.ts

import { PassportMiddleware } from '@midwayjs/passport';

@Provide()
export class GithubPassportMiddleware extends PassportMiddleware {
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


