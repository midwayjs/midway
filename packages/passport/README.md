# midway-passport 使用文档

Passport 的目的是请求进行身份验证，其中它通过一组可扩展称为插件的*策略* 。`midway-passport` 对 Passport 进行了封装，目前支持`Express`，`Koa`，`Egg` 。此外推荐使用`Typescript`开发。

## 准备

1. 安装 `npm i @midwayjs/passport`

```bash
Express
npm i passport
```

```bash
Koa, Egg
npm i koa-passport
```

2. 开启相对应框架的 bodyparser

## 开始

首先请对[Passport](https://www.npmjs.com/package/passport)进行简单了解

##### 以本地, Jwt 为例

首先我们用`ExpressPassportStrategyAdapter` 创建一个 Strategy，其次再用`@BootStrategy`来启动此策路

`local.strategy.ts`

```ts
// Egg, Koa 为WebPassportStrategyAdapter
import { BootStrategy, ExpressPassportStrategyAdapter } from '@deskbtm/midway-passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { Logger } from '@midwayjs/decorator';
import { UserEntity } from './user';

@BootStrategy({
  async useParams() {
    return {
      passwordField: 'pwd',
    };
  },
})
// ExpressPassportStrategyAdapter 支持自定义name
export class LocalStrategy extends ExpressPassportStrategyAdapter(Strategy, 'local') {
  @InjectEntityModel(UserEntity)
  photoModel: Repository<UserEntity>;

  @Logger('dash')
  logger: ILogger;

  // 通过 verify 钩子来获取有效负载  并且此函数必须有返回参数
  // 详情见对应的Strategy
  async verify(username, password) {
    const user = await this.photoModel.findOne({ username });

    this.logger.info('user from db', user);

    if (!user) {
      throw new Error('not found user ' + username);
    }

    return {
      username,
      password,
    };
  }
}
```

`local.middleware.ts`

```ts
import { Inject, Provide } from '@midwayjs/decorator';
//Egg, Koa 请使用WebPassportMiddleware
import { ExpressPassportMiddleware } from '@deskbtm/midway-passport';
import { UserEntity } from '@/rbac';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from '@midwayjs/express';
import { Repository } from 'typeorm';

@Provide('local') // 同样可以在此处使用一个简短的identifier
export class LocalPassportMiddleware extends ExpressPassportMiddleware {
  // required
  public strategy: string = 'local';

  @InjectEntityModel(UserEntity)
  photoModel: Repository<UserEntity>;

  public async setOptions(ctx?: Context): AuthenticateOptions {
    return {};
  }

  // required
  // 首个参数为Context, 剩余参数请看 passport.authenticate
  // 获取上下文实例可以使用 ctx.requestContext.get<xxx>('xxx');
  // 推荐在此处鉴权
  public async auth(_ctx, _err, data): Promise<Record<any, any>> {
    const user = await this.photoModel.findOne({ username: data.username });
    console.log(user);

    return data;
  }
}
```

`jwt.strategy.ts`

```ts
import { BootStrategy, ExpressPassportStrategyAdapter } from '@deskbtm/midway-passport';
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

`jwt.middleware.ts`

```ts
import { Provide } from '@midwayjs/decorator';
import { ExpressPassportMiddleware } from '@deskbtm/midway-passport';

@Provide()
export class JwtPassportMiddleware extends ExpressPassportMiddleware {
  strategy: string = 'jwt';

  async auth(_ctx, _err, data) {
    return data;
  }
}
```

`test.controller.ts`

```ts
import { ALL, Provide, Logger, Get, Inject } from '@midwayjs/decorator';
import { Body, Controller, Post } from '@midwayjs/decorator';
import { LocalPassportControl } from './local.control';
import { JwtPassportControl } from './jwt.control';
import { ILogger } from '@midwayjs/logger';
import { Jwt } from '@deskbtm/midway-jwt';

@Provide()
@Controller('/test')
export class TestPackagesController {
  @Logger('dash')
  logger: ILogger;

  @Inject()
  jwt: Jwt;

  @Post('/local-passport', { middleware: ['local'] })
  async localPassport(@Body(ALL) body) {
    // auth返回的参数会被挂到req.user上
    console.log('local user: ', this.ctx.req.user);
    return body;
  }

  @Post('/jwt-passport', { middleware: ['jwtPassportMiddleware'] })
  async jwtPassport(@Body(ALL) body) {
    console.log('jwt user: ', this.ctx.req.user);
    return body;
  }

  @Post('/gen-jwt')
  async genJwt() {
    return {
      t: await this.jwt.sign({ msg: 'Hello Midway' }),
    };
  }
}
```

在 StrategyAdapter 中支持 1. 使用 BootStrategy 中的 useParams。2. 通过 StrategyAdapter 的第三个参数，两种方式传递 options。

## 相关

[midwayjs/jwt](../jwt/README.md)
