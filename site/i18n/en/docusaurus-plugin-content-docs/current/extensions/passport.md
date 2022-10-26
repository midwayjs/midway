# Authentication

Authentication is an important part of most Web applications. Therefore, Midway encapsulates the most popular Passport library in Nodejs.


Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |

Starting from v3.4.0, Midway maintains its own passport and will no longer need to introduce community packages and type packages.



## Some concepts

The passport is that the community uses more authentication libraries to make authentication requests through extensible plug-ins called policies. Passport routing is not mounted or any specific database is assumed, this maximizes flexibility and allows developers to make application-level decisions.

It itself contains several parts:

- 1. Verification strategies, such as jwt verification, github verification, oauth verification, etc. The most abundant passport is this one.
- 2. After the policy is executed, the logic processing and configuration of middleware, such as jump after success or failure, error reporting, etc.




## Installation dependency

`npm I @midwayjs/passport` installation and related policy dependencies.

```bash
## Required
$ npm i @midwayjs/passport@3 --save

## Optional
## Install the local policy below
$ npm i passport-local --save
$ npm i @types/passport-local --save-dev
## Install Github policy below
$ npm i passport-github --save
## Install Jwt policy below
$ npm i passport-jwt --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/passport": "^3.0.0",
    // Local policy
    "passport-local": "^1.0.0"
    // Jwt strategy
    "passport-jwt": "4.0.0",
    // Github policy
    "passport-github": "1.1.0",
    // ...
  },
  "devDependencies": {
    // Local policy
    "@types/passport-local": "^1.0.34 ",
    // Jwt strategy
    "@types/passport-jwt": "^3.0.6 ",
    // Github policy
    "@types/passport-github": "^1.1.7 ",
    // ...
  }
}
```



## Enable components


Enable the component first.

```typescript
// src/configuration.ts

import { join } from 'path';
import { ILifeCycle,} from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [
    // ...
    passport
  ],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration implements ILifeCycle {}

```



## Policy example

Here we use the local authentication strategy and the Jwt strategy as a demonstration.

### Example: Local Policy

We can start a policy from `@CustomStrategy` and derived `PassportStrategy`. The payload is obtained by validate a hook, and this function must have a return value, and its parameters are not clear. You can refer to the corresponding Strategy or print through the expansion character.

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

  // Validation of policies
  async validate(username, password) {
    const user = await this.userModel.findOne({ username });
    if (await bcrypt.compare(password, user.password)) {
      throw new Error('error password '+ username);
    }

    return {
      username
      password
    };
  }

  // Parameters of the current policy
  getStrategyOptions(): any {
    return {};
  }
}

```
:::tip

Note: validate method is an Promise alternative to community policy verify. You don't need to pass callback parameters at the end.

:::

Use derivation to `PassportMiddleware` a middleware.

```typescript
// src/middleware/local.middleware.ts

import { Inject, Middleware } from '@midwayjs/decorator';
import { PassportMiddleware, AuthenticateOptions } from '@midwayjs/passport';
import { LocalStrategy } from './strategy/local.strategy.ts'

@Middleware()
export class LocalPassportMiddleware extends PassportMiddleware(LocalStrategy) {
  // Set AuthenticateOptions
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
import { LocalPassportMiddleware } from './middleware/local.middleware.ts'

@Controller('/')
export class LocalController {

  @Post('/passport/local', { middleware: [LocalPassportMiddleware] })
  async localPassport() {
    console.log('local user:', this.ctx.state.user);
    return this.ctx.state.user;
  }
}
```

Use curl to simulate a request.

```bash
curl -X POST http://localhost:7001/passport/local -d '{"username": "demo", "password": "1234"}' -H "Content-Type: application/json"

Results {"username": "demo", "password": "1234"}
```



### Example: Jwt strategy

**Additional installation** of dependencies and policies is required first:

```bash
$ npm i @midwayjs/jwt passport-jwt --save
```

Additional jwt components are enabled.

```typescript
// configuration.ts

import { join } from 'path';
import * as jwt from '@midwayjs/jwt';
import { ILifeCycle,} from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as passport from '@midwayjs/passport';

@Configuration({
  imports: [
    // ...
    jwt
    passport
  ],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration implements ILifeCycle {}

```

Then set in the configuration, the default is not encrypted, please do not store sensitive information in the payload.

```typescript
// src/config/config.default.ts
export default {
  // ...
  jwt: {
    secret: 'xxxxxxxxxxxxxx', // fs.readFileSync('xxxxx.key')
    expiresIn: '2d' // https://github.com/vercel/ms
  },
}
```

```typescript
// src/strategy/jwt.strategy.ts

import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Config } from '@midwayjs/decorator';

@CustomStrategy()
export class JwtStrategy extends PassportStrategy (
  Strategy
  'jwt'
) {
  @Config('jwt')
  jwtConfig;

  async validate(payload) {
    return payload;
  }

  getStrategyOptions(): any {
    return {
      secretOrKey: this.jwtConfig.secret
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    };
  }
}
```
:::tip

Note: validate method is an Promise alternative to community policy verify. You don't need to pass callback parameters at the end.

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
    console.log('jwt user:', this.ctx.state.user);
    return this.ctx.state.user;
  }

  @Post('/jwt')
  async genJwt() {
    return {
      t: await this.jwt.sign({ msg: 'Hello Midway' })
    };
  }
}
```

Use curl to simulate requests

```bash
curl -X POST http://127.0.0.1:7001/jwt

Result {"t": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}

curl http://127.0.0.1:7001/passport/jwt -H "Authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

Results {"msg": "Hello Midway","iat": 1635468727,"exp": 1635468827}

```

## Customize other policies

`@midwayjs/passport` supports customizing [other policies](http://www.passportjs.org/packages/). Here, take Github OAuth as an example.
`npm I passport-github` first, and then write the following code:

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
      clientID: GITHUB_CLIENT_ID
      clientSecret: GITHUB_CLIENT_SECRET
      callbackURL: 'https://127.0.0.1:7001/auth/github/cb'
    };
  }
}

```
```typescript
// src/middleware/github.middleware.ts

import { PassportMiddleware } from '@midwayjs/passport';
import { Middleware } from '@midwayjs/decorator';
import { GithubStrategy } from './github-strategy.ts';

@Middleware()
export class GithubPassportMiddleware extends PassportMiddleware(GithubStrategy) {
  getAuthenticateOptions(): AuthenticateOptions | Promise<AuthenticateOptions> {
    return {};
  }
}
```
```typescript
// src/controoer/auth.controller.ts

import { Controller, Get, Inject } from '@midwayjs/decorator';
import { GithubPassportMiddleware } from './github.middleware';

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



## Policy options

| Options | Type | Description |
| ------------------- | ------- | ------------------------------------------------- |
| failureRedirect | string | The url of the failed jump. |
| session | boolean | The default is true. When it is turned on, the user information will be automatically set to the session |
| sessionUserProperty | string | set to the key on the session, the default user |
| userProperty | string | The key set to ctx.state or req, the default user |
| successRedirect | string | The address that jumps after user authentication is successful. |



## Frequently Asked Questions



### 1. Failed to serialize user into session

Since the passport will try to write user data to the session by default, if you do not need to save the user to the session, you can turn off session support.

```typescript
// src/config/config.default
export default {
  // ...
  passport: {
    session: false
  }
}
```

If you explicitly need to save data to the Session, you need to rewrite the serialization method of the `PassportStrategy` User. Please do not save particularly large data.

For example, the local strategy implemented by oneself.

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
    // You can save only the user name
    done(null, user.username);
  }

  deserializeUser(id, done) {

    // This is not an asynchronous method. You can check the user data from other places according to the user name.
    const user = getUserFromDataBase(id);

    done(null, user);
  }
}
```



