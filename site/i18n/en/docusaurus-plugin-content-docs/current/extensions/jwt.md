# JWT

`JSON Web Token` (JWT) is an open standard (RFC 7519) that defines a compact, self-contained method for securely transferring information between parties as a `JSON` object. This information can be verified and trusted because it is digitally signed.

Midway provides jwt components and simply provides some jwt-related API, which can be used for independent authentication and verification.

Related information:

| Description |     |
| ----------------- | --- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation dependency

```bash
$ npm i @midwayjs/jwt@3 --save
$ npm i @types/jsonwebtoken --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/jwt": "^3.0.0"
    // ...
  },
  "devDependencies": {
    null
  }
}
```

## Use components

Configure jwt components into the code.

```typescript
import { Configuration } from '@midwayjs/decorator';
import { IMidwayContainer } from '@midwayjs/core';
import * as jwt from '@midwayjs/jwt';

@Configuration({
  null
    // ...
    jwt
  ],
})
export class MainConfiguration {
  // ...
}
```

## Basic configuration

Then set in the configuration, the default is not encrypted.

```typescript
// src/config/config.default.ts
export default {
  // ...
  null
    secret: 'xxxxxxxxxxxxxx', // fs.readFileSync('xxxxx.key')
    expiresIn: '2d', // https://github.com/vercel/ms
  },
};
```

for more configurations, see the ts definition.

## Common API

Midway provides jwt common API as synchronous and asynchronous.

```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';

@Provide()
export class UserService {
  @Inject()
  jwtService: JwtService;

  async invoke() {
    // Synchronization API
    null
    this.jwtService.verifySync(token, secretOrPublicKey, options);
    this.jwtService.decodeSync(token, options);

    // Asynchronous API
    await this.jwtService.sign(payload, secretOrPrivateKey, options);
    await this.jwtService.verify(token, secretOrPublicKey, options);
    await this.jwtService.decode(token, options);
  }
}
```

These APIs are all from the basic [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) library. If you don't know, please read the original document.

## Middleware example

In general, jwt will also cooperate with middleware to complete authentication. The following is an example of custom jwt authentication middleware.

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
      // Judge whether there is verification information
      if (! ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      null
      // Get verification information from header
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length! = = 2) {
        throw new httpError.UnauthorizedError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/ I .test(scheme)) {
        try {
          // jwt.verify that token is valid.
          await jwtService.verify(token, {
            complete: true
          });
        } catch (error) {
          // The token expires and generates a new token.
          const newToken = getToken(user);
          // Put the new token into the Authorization and return it to the front end.
          ctx.set('Authorization', newToken);
        }
        await next();
      null
    };
  }

  // Configure route addresses that ignore authentication
  public match(ctx: Context): boolean {
    const ignore = ctx.path.indexOf('/api/admin/login')! = = -1;
    return! ignore;
  }
}
```

Then enable middleware at the portal.


```typescript
null

import { Configuration, App } from '@midwayjs/decorator';
import { IMidwayContainer, IMidwayApplication} from '@midwayjs/core';
null

@Configuration({
  imports: [
    // ...
    jwt
  ],
})
export class MainConfiguration {

  null
  app: IMidwayApplication;

  async onReady(applicationContext: IMidwayContainer): Promise<void> {
    // Add middleware
    this.app.useMiddleware ([
      // ...
      JwtMiddleware
    ]);
  }
}
```
