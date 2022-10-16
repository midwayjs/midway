# Cookies and Session

HTTP Cookie (also called Web Cookie or Browser Cookie) is a small piece of data sent by the server to the user's browser and stored locally. It will be carried and sent to the server the next time the browser rerequests the same server. Usually, it is used to tell the server whether the two requests come from the same browser, such as keeping the user logged in. Cookies make it possible for stateless HTTP protocols to record stable state information.  Cookie are mainly used in the following three aspects:

- Session state management (such as user login status, shopping cart, game score, or other information that needs to be recorded)
- Personalization settings (such as user-defined settings, themes, etc.)
- Browser behavior tracking (e. g. tracking and analyzing user behavior, etc.)

Cookie often assume the function of identifying the requestor's identity in Web applications, so Web applications encapsulate the concept of Session on the basis of cookies and are specially used for user identification.

## Default Cookies

Midway provides a `@midwayjs/cookies` module to manipulate Cookie.

At the same time, in `@midwayjs/koa`, the method of directly reading and writing cookies from the context is provided by default.

- `ctx.cookies.get(name, [options])` Cookie in Read Context Request
- `ctx.cookies.set(name, value, [options])` writes cookie in context

Examples are as follows:

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // set cookie
    this.ctx.cookies.set('foo', 'bar', { encrypt: true });
    // get cookie
    this.ctx.cookies.get('foo', { encrypt: true });
  }
}
```



## Set Cookie

Use the `ctx.cookies.set(key, value, options)` API to set Cookie.

Setting Cookie is actually done by setting a set-cookie header in the HTTP response. Each set-cookie will allow the browser to store a key-value pair in the cookie. While setting the Cookie value, the protocol also supports many parameters to configure the transmission, storage and permissions of this Cookie.

These options include:

| Options | Type | Description |
| -------- | ------- | ------------------------------------------------------------ |
| path | String | The path where the key-value pair takes effect. By default, the path is set to the root path (`/`). That is, all URLs under the current domain name can access this cookie.  |
| domain | String | The domain name for which the key-value pair takes effect is not configured by default. It can be configured to be accessed only in the specified domain name.  |
| expires | Date | Set the expiration time of this key-value pair. If maxAge is set, the expires will be overwritten. If maxAge and expires are not set, Cookie will expire when the browser's session fails (usually when the browser is closed).  |
| maxAge | Number | Set the maximum save time for this key-value pair in the browser. is the number of milliseconds from the current time on the server. If maxAge is set, the expires will be overwritten.  |
| secure | Boolean | Set the key-value pair to [transmit only on HTTPS connections](http://stackoverflow.com/questions/13729749/how-does-cookie-secure-flag-work). The framework helps us to determine whether the secure value is automatically set on the HTTPS connection.  |
| httpOnly | Boolean | Set whether the key-value pair can be accessed by JS. The default value is true and JS access is not allowed. |

In addition to these attributes, the framework extends 3 additional parameters:

| Options | Type | Description |
| --------- | ------- | ------------------------------------------------------------ |
| overwrite | Boolean | Set how to handle key-value pairs with the same key. If set to true, the value set later will overwrite the previously set. Otherwise, two set-cookie response headers will be sent.  |
| signed | Boolean | Set whether to sign the Cookie. If set to true, the value of the key-value pair will be signed at the same time when the key-value pair is set, and the value will be checked when the key-value pair is taken later, which can prevent the front end from tampering with the value. The default value is true.  |
| encrypt | Boolean | Set whether to encrypt the cookie. If set to true, the value of this key-value pair will be encrypted before sending the cookie. The client cannot read the plaintext value of the cookie. The default value is false.  |

When setting a cookie, we need to consider whether the cookie needs to be acquired by the front end, how long it will expire, etc.

Example:

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.cookies.set('cid', 'hello world', {
      Domain: 'localhost', // write the domain name where the cookie is located
      Path: '/index', // the path where the cookie is written
      MaxAge: 10*60*1000, // cookie valid duration
      expires: new Date('2017-02-15'), // cookie expiration time
      httpOnly: false, // is it only used for http requests
      overwrite: false, // whether rewrite is allowed
    });
    ctx.body = 'cookie is OK';
  }
}
```

**By default, cookies are signed and not encrypted. The browser can view plaintext, js cannot access it, and cannot be tampered with by the client.**

If you want Cookie to be accessed and modified by js on the browser side:

```typescript
ctx.cookies.set(key, value, {
  httpOnly: false,
  signed: false,
});
```

If you want the Cookie to not be modified on the browser side, you cannot see the clear text:

```typescript
ctx.cookies.set(key, value, {
  httpOnly: true, // the default is true
  encrypt: true, // encrypted transmission
});
```



## Get Cookie

Use the `ctx.cookies.get(key, options)` API to get Cookie.

Since the cookie in the HTTP request is transmitted in a header, the value of the corresponding key-value pair can be quickly obtained from the entire cookie through this method provided by the framework. When setting cookies above, we can set the `options.signed` and `options.encrypt` to sign or encrypt cookies, so the corresponding matching options should also be passed when obtaining cookies.

- If it is specified as signed at the time of setting and not specified at the time of acquisition, the obtained value will not be checked during acquisition, which may result in tampering with the client.
- If it is specified as encrypt when setting and not specified when obtaining, the real value cannot be obtained, but the encrypted ciphertext.

If you want to obtain a Cookie set by the frontend or other systems, you must specify the `signed` parameter to `false` to avoid that the value of the Cookie cannot be obtained.

```typescript
ctx.cookies.get('frontend-cookie', {
  signed: false,
});
```



## Cookie key

Since we need to use encryption, decryption and verification in Cookie, we need to configure a secret key for encryption.

The default scaffold will automatically generate a secret key in the configuration file `src/config/config.default.ts`, or it can be modified by itself.

```typescript
// src/config/config.default
export default {
  keys: ['key1','key2'],
}
```

keys are a string by default, which can be used to separate and configure multiple keys. Cookie when encrypting and decrypting using this configuration:

- Only the first key is used when encrypting and signing.
- When decrypting and checking, the keys will be traversed for decryption.

If we want to update the key of the Cookie, but we don't want the Cookie previously set to the user's browser to become invalid, we can configure the new key to the front of the keys and delete the unnecessary key after a period of time.



## Default Session

The default `@midwayjs/koa` has built-in Session components and provides us with `ctx.session` to access or modify the current user Session.

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // Get the content on the Session
    const userId = this.ctx.session.userId;
    const posts = await this.ctx.service.post.fetch(userId);
    // Modify the value of the Session
    this.ctx.session.visited = ctx.session.visited? (ctx.session.visited + 1) : 1;
    // ...
  }
}
```

The use of the Session is very intuitive. Just read it or modify it. If you want to delete it, assign it null directly:

```typescript
ctx.session = null;
```

What needs **special attention** is: when setting the session attribute, you need to avoid the following situations (which will cause field loss, see [koa-session](https://github.com/koajs/session/blob/master/lib/session.js#L37-L47) source code)

- Do not start with `_`
- The value cannot be `isNew`.

```
// ❌ Wrong usage
ctx.session._visited = 1; // --> this field will be lost on the next request
ctx.session.isNew = 'HeHe'; // --> is an internal keyword and should not be changed

// ✔️ The correct usage
ctx.session.visited = 1; // --> no problem here
```

The implementation of the Session is based on Cookie. By default, the content Session by the user is encrypted and stored directly in a field in the Cookie. Every time the user requests our website, he will bring this Cookie with him and we will use it after decryption by the server. The default configuration of the Session is as follows:

```typescript
export default {
  session: {
    MaxAge: 24*3600*1000, // 1 day
    key: 'MW_SESS',
    httpOnly: true
  },
  // ...
}
```

It can be seen that these parameters are cookie parameters except `key`. `key` represents the key of the cookie key value pair that stores the Session. Under the default configuration, cookies stored in Session will be encrypted and cannot be accessed by the front-end js, thus ensuring that the user's Session is secure.



## Session example

### Modify user Session expiration time

Although one of the Session configurations is maxAge, it can only set the validity period of the Session globally. We can often see the option box to **remember me** on the login page of some websites. After checking, the validity period of the login user's Session can be longer. This Session effective time setting for a specific user can be implemented by `ctx.session.maxAge =`.

```typescript
import { Inject, Controller, Post, Body, Provide, FORMAT } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from './service/user.service';

@Controller('/')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Post('/')
  async login(@Body() data) {
   	const { username, password, rememberMe } = data;
    const user = await this.userService.loginAndGetUser(username, password);

    // Set Session
    this.ctx.session.user = user;
    // If the user checked "Remember Me", set a 30-day expiration time.
    if (rememberMe) {
      this.ctx.session.maxAge = FORMAT.MS.ONE_DAY * 30;
    }
  }
}
```



### Extend the validity period of user Session

By default, when the user request does not cause the Session to be modified, the framework will not extend the validity period of the Session. However, in some scenarios, we hope that if users visit our site for a long time, they will extend their Session validity period and prevent users from exiting the login state. The framework provides a `renew` configuration item to implement this function. It will reset the validity period of the Session when it is found that the validity period of the user's Session is only half of the maximum validity period.

```typescript
// src/config/config.default.ts
export default {
  session: {
    renew: true
    // ...
  },
  // ...
}
```



## Custom Session Store

It is not reasonable to put too much data in the Session. In most cases, we only need to store some Id in the Session to ensure security. Although we think Cookie is sufficient as a storage Session, in some extreme cases, Redis, for example, is still needed to store Session.

Different upper-level frameworks use different Session schemes, and some Session replacement schemes are listed below.

- [@midwayjs/koa scheme](https://github.com/midwayjs/midway/tree/main/packages/session#custom-session-store)
- [@midwayjs/express Scheme](https://github.com/midwayjs/midway/tree/main/packages/express-session)
- [@midwayjs/Web (egg) scheme](https://github.com/eggjs/egg-session)





