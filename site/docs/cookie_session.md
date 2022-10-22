# Cookies 和 Session

HTTP Cookie（也叫 Web Cookie 或浏览器 Cookie）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。 Cookie 主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

Cookie 在 Web 应用中经常承担标识请求方身份的功能，所以 Web 应用在 Cookie 的基础上封装了 Session 的概念，专门用做用户身份识别。

## 默认的 Cookies

Midway 提供了 `@midwayjs/cookies` 模块来操作 Cookie。

同时在 `@midwayjs/koa` 中，默认提供了从上下文直接读取、写入 cookie 的方法

- `ctx.cookies.get(name, [options])` 读取上下文请求中的 cookie
- `ctx.cookies.set(name, value, [options])` 在上下文中写入 cookie

示例如下：

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



## 设置 Cookie

使用 `ctx.cookies.set(key, value, options)` API 来设置 Cookie。

设置 Cookie 其实是通过在 HTTP 响应中设置 set-cookie 头完成的，每一个 set-cookie 都会让浏览器在 Cookie 中存一个键值对。在设置 Cookie 值的同时，协议还支持许多参数来配置这个 Cookie 的传输、存储和权限。

这些选项包括：

| 选项     | 类型    | 描述                                                         |
| -------- | ------- | ------------------------------------------------------------ |
| path     | String  | 设置键值对生效的 URL 路径，默认设置在根路径上（`/`），也就是当前域名下的所有 URL 都可以访问这个 Cookie。 |
| domain   | String  | 设置键值对生效的域名，默认没有配置，可以配置成只在指定域名才能访问。 |
| expires  | Date    | 设置这个键值对的失效时间，如果设置了 maxAge，expires 将会被覆盖。如果 maxAge 和 expires 都没设置，Cookie 将会在浏览器的会话失效（一般是关闭浏览器时）的时候失效。 |
| maxAge   | Number  | 设置这个键值对在浏览器的最长保存时间。是一个从服务器当前时刻开始的毫秒数。如果设置了 maxAge，expires 将会被覆盖。 |
| secure   | Boolean | 设置键值对 [只在 HTTPS 连接上传输](http://stackoverflow.com/questions/13729749/how-does-cookie-secure-flag-work)，框架会帮我们判断当前是否在 HTTPS 连接上自动设置 secure 的值。 |
| httpOnly | Boolean | 设置键值对是否可以被 js 访问，默认为 true，不允许被 js 访问  |

除了这些属性之外，框架另外扩展了 3 个参数：

| 选项      | 类型    | 描述                                                         |
| --------- | ------- | ------------------------------------------------------------ |
| overwrite | Boolean | 设置 key 相同的键值对如何处理，如果设置为 true，则后设置的值会覆盖前面设置的，否则将会发送两个 set-cookie 响应头。 |
| signed    | Boolean | 设置是否对 Cookie 进行签名，如果设置为 true，则设置键值对的时候会同时对这个键值对的值进行签名，后面取的时候做校验，可以防止前端对这个值进行篡改。默认为 true。 |
| encrypt   | Boolean | 设置是否对 Cookie 进行加密，如果设置为 true，则在发送 Cookie 前会对这个键值对的值进行加密，客户端无法读取到 Cookie 的明文值。默认为 false。 |

在设置 Cookie 时，我们需要考虑这个 Cookie 是否需要被前端获取，失效时间多久等等。

示例：

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
      domain: 'localhost', // 写cookie所在的域名
      path: '/index', // 写cookie所在的路径
      maxAge: 10 * 60 * 1000, // cookie有效时长
      expires: new Date('2017-02-15'), // cookie失效时间
      httpOnly: false, // 是否只用于http请求中获取
      overwrite: false, // 是否允许重写
    });
    ctx.body = 'cookie is ok';
  }
}
```

**默认的配置下，Cookie 是加签不加密的，浏览器可以看到明文，js 不能访问，不能被客户端（手工）篡改。**

如果想要 Cookie 在浏览器端可以被 js 访问并修改:

```typescript
ctx.cookies.set(key, value, {
  httpOnly: false,
  signed: false,
});
```

如果想要 Cookie 在浏览器端不能被修改，不能看到明文：

```typescript
ctx.cookies.set(key, value, {
  httpOnly: true, // 默认就是 true
  encrypt: true, // 加密传输
});
```



## 获取 Cookie

使用 `ctx.cookies.get(key, options)` API 来获取 Cookie。

由于 HTTP 请求中的 Cookie 是在一个 header 中传输过来的，通过框架提供的这个方法可以快速的从整段 Cookie 中获取对应的键值对的值。上面在设置 Cookie 的时候，我们可以设置 `options.signed` 和 `options.encrypt` 来对 Cookie 进行签名或加密，因此对应的在获取 Cookie 的时候也要传相匹配的选项。

- 如果设置的时候指定为 signed，获取时未指定，则不会在获取时对取到的值做验签，导致可能被客户端篡改。
- 如果设置的时候指定为 encrypt，获取时未指定，则无法获取到真实的值，而是加密过后的密文。

如果要获取前端或者其他系统设置的 Cookie，需要指定参数 `signed` 为 `false`，避免对它做验签导致获取不到 Cookie 的值。

```typescript
ctx.cookies.get('frontend-cookie', {
  signed: false,
});
```



## Cookie 秘钥

由于我们在 Cookie 中需要用到加解密和验签，所以需要配置一个秘钥供加密使用。

默认脚手架会在配置文件 `src/config/config.default.ts` 中自动生成一个秘钥，也可以自己修改。

```typescript
// src/config/config.default
export default {
  keys:  ['key1','key2'],
}
```

keys 默认是一个字符串，可以分隔配置多个 key。Cookie 在使用这个配置进行加解密时：

- 加密和加签时只会使用第一个秘钥。
- 解密和验签时会遍历 keys 进行解密。

如果我们想要更新 Cookie 的秘钥，但是又不希望之前设置到用户浏览器上的 Cookie 失效，可以将新的秘钥配置到 keys 最前面，等过一段时间之后再删去不需要的秘钥即可。



## 默认的 Session

默认的 `@midwayjs/koa` ，内置了 Session 组件，给我们提供了 `ctx.session` 来访问或者修改当前用户 Session 。

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // 获取 Session 上的内容
    const userId =  this.ctx.session.userId;
    const posts = await  this.ctx.service.post.fetch(userId);
    // 修改 Session 的值
    this.ctx.session.visited = ctx.session.visited ? (ctx.session.visited + 1) : 1;
    // ...
  }
}
```

Session 的使用方法非常直观，直接读取它或者修改它就可以了，如果要删除它，直接将它赋值为 null：

```typescript
ctx.session = null;
```

需要 **特别注意** 的是：设置 session 属性时需要避免以下几种情况（会造成字段丢失，详见 [koa-session](https://github.com/koajs/session/blob/master/lib/session.js#L37-L47) 源码）

- 不要以 `_` 开头
- 不能为 `isNew`

```
// ❌ 错误的用法
ctx.session._visited = 1;   //    --> 该字段会在下一次请求时丢失
ctx.session.isNew = 'HeHe'; //    --> 为内部关键字, 不应该去更改

// ✔️ 正确的用法
ctx.session.visited = 1;    //   -->  此处没有问题
```

Session 的实现是基于 Cookie 的，默认配置下，用户 Session 的内容加密后直接存储在 Cookie 中的一个字段中，用户每次请求我们网站的时候都会带上这个 Cookie，我们在服务端解密后使用。Session 的默认配置如下：

```typescript
export default {
  session: {
    maxAge: 24 * 3600 * 1000, // 1天
    key: 'MW_SESS',
    httpOnly: true,
  },
  // ...
}
```

可以看到这些参数除了 `key` 都是 Cookie 的参数，`key` 代表了存储 Session 的 Cookie 键值对的 key 是什么。在默认的配置下，存放 Session 的 Cookie 将会加密存储、不可被前端 js 访问，这样可以保证用户的 Session 是安全的。



## Session 示例

### 修改用户 Session 失效时间

虽然在 Session 的配置中有一项是 maxAge，但是它只能全局设置 Session 的有效期，我们经常可以在一些网站的登陆页上看到有 **记住我** 的选项框，勾选之后可以让登陆用户的 Session 有效期更长。这种针对特定用户的 Session 有效时间设置我们可以通过 `ctx.session.maxAge=` 来实现。

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

    // 设置 Session
    this.ctx.session.user = user;
    // 如果用户勾选了 `记住我`，设置 30 天的过期时间
    if (rememberMe) {
      this.ctx.session.maxAge = FORMAT.MS.ONE_DAY * 30;
    }
  }
}
```



### 延长用户 Session 有效期

默认情况下，当用户请求没有导致 Session 被修改时，框架都不会延长 Session 的有效期，但是在有些场景下，我们希望用户如果长时间都在访问我们的站点，则延长他们的 Session 有效期，不让用户退出登录态。框架提供了一个 `renew` 配置项用于实现此功能，它会在发现当用户 Session 的有效期仅剩下最大有效期一半的时候，重置 Session 的有效期。

```typescript
// src/config/config.default.ts
export default {
  session: {
    renew: true,
    // ...
  },
  // ...
}
```



## 自定义 Session Store

过多的将数据放在 Session 中并不太合理，大部分情况下，我们只需要在 Session 中存储一些 Id，来保证安全性。虽然我们觉得 Cookie 作为存储 Session 已经足够，但是在某些极端情况下，还是需要使用例如 Redis 来存储 Session 的情况。

不同的上层框架使用了不同的 Session 方案，下面列举了一些 Session 替换方案

- [@midwayjs/koa 方案](https://github.com/midwayjs/midway/tree/main/packages/session#custom-session-store)
- [@midwayjs/express 方案](https://github.com/midwayjs/midway/tree/main/packages/express-session)
- [@midwayjs/web（egg）方案](https://github.com/eggjs/egg-session)





