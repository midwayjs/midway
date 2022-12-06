import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 路由和控制器

在常见的 MVC 架构中，C 即代表控制器，控制器用于负责 **解析用户的输入，处理后返回相应的结果。**

如图所示，客户端通过 Http 协议请求服务端的控制器，控制器处理结束后响应客户端，这是一个最基础的 ”请求 - 响应“ 流程。

![controller](https://img.alicdn.com/imgextra/i1/O1CN01dYitV22ADuagILnp3_!!6000000008170-2-tps-1600-634.png)


常见的有：


- 在 [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) 接口中，控制器接受用户的参数，从数据库中查找内容返回给用户或者将用户的请求更新到数据库中。
- 在 HTML 页面请求中，控制器根据用户访问不同的 URL，渲染不同的模板得到 HTML 返回给用户。
- 在代理服务器中，控制器将用户的请求转发到其他服务器上，并将其他服务器的处理结果返回给用户。



一般来说，控制器常用于对用户的请求参数做一些校验，转换，调用复杂的业务逻辑，拿到相应的业务结果后进行数据组装，然后返回。


在 Midway 中，控制器 **也承载了路由的能力**，每个控制器可以提供多个路由，不同的路由可以执行不同的操作。


在接下去的示例中，我们将演示如何在控制器中创建路由。


## 路由


控制器文件一般来说在 `src/controller`  目录中，我们可以在其中创建控制器文件。Midway 使用 `@Controller()` 装饰器标注控制器，其中装饰器有一个可选参数，用于进行路由前缀（分组），这样这个控制器下面的所有路由都会带上这个前缀。


同时，Midway 提供了方法装饰器用于标注请求的类型。


比如，我们创建一个首页控制器，用于返回一个默认的 `/` 路由的页面。
```
➜  my_midway_app tree
.
├── src
│   └── controller
│       └── home.ts
├── test
├── package.json
└── tsconfig.json
```
```typescript
// src/controller/home.ts

import { Controller, Get } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return "Hello Midwayjs!";
  }
}

```
`@Controller` 装饰器告诉框架，这是一个 Web 控制器类型的类，而 `@Get` 装饰器告诉框架，被修饰的 `home` 方法，将被暴露为 `/` 这个路由，可以由 `GET` 请求来访问。


整个方法返回了一个字符串，在浏览器中你会收到 `text/plain` 的响应类型，以及一个 `200` 的状态码。


## 路由方法


上面的示例，我们已经创建了一个 **GET** 路由。一般情况下，我们会有其他的 HTTP Method，Midway 提供了更多的路由方法装饰器。


```typescript
// src/controller/home.ts

import { Controller, Get, Post } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }

  @Post('/update')
  async updateData() {
    return 'This is a post method'
  }
}

```
Midway 还提供了其他的装饰器，  `@Get` 、 `@Post` 、 `@Put()` 、 `@Del()` 、 `@Patch()` 、 `@Options()` 、 `@Head()`  和 `@All()` ，表示各自的 HTTP 请求方法。


`@All` 装饰器比较特殊，表示能接受以上所有类型的 HTTP Method。


你可以将多个路由绑定到同一个方法上。
```typescript
@Get('/')
@Get('/main')
async home() {
  return 'Hello Midwayjs!';
}
```


## 获取请求参数


接下去，我们将创建一个关于用户的 HTTP API，同样的，创建一个 `src/controller/user.ts`  文件，这次我们会增加一个路由前缀，以及增加更多的请求类型。


我们以用户类型举例，先增加一个用户类型，我们一般会将定义的内容放在 `src/interface.ts` 文件中。
```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.ts
│   │   └── home.ts
│   └── interface.ts
├── test
├── package.json
└── tsconfig.json
```
```typescript
// src/interface.ts
export interface User {
  id: number;
  name: string;
  age: number;
}
```
再添加一个路由前缀以及对应的控制器。
```typescript
// src/controller/user.ts

import { Controller } from "@midwayjs/decorator";

@Controller('/api/user')
export class UserController {
  // xxxx
}

```

接下去，我们要针对不同的请求类型，调用不同的处理逻辑。除了请求类型之外，请求的数据一般都是动态的，会在 HTTP 的不同位置来传递，比如常见的 Query，Body 等。



### 装饰器参数约定


Midway 添加了常见的动态取值的装饰器，我们以 `@Query` 装饰器举例， `@Query` 装饰器会获取到 URL 中的 Query 参数部分，并将它赋值给函数入参。下面的示例，id 会从路由的 Query 参数上拿，如果 URL 为 `/?id=1` ，则 id 的值为 1，同时，这个路由将会返回 `User` 类型的对象。
```typescript
// src/controller/user.ts

import { Controller, Get, Query } from "@midwayjs/decorator";

@Controller('/api/user')
export class UserController {
  @Get('/')
  async getUser(@Query('id') id: string): Promise<User> {
    // xxxx
  }
}
```

`@Query`  装饰器的有参数，可以传入一个指定的字符串 key，获取对应的值，赋值给入参，如果不传入，则默认返回整个 Query 对象。

```typescript
// URL = /?id=1
async getUser(@Query('id') id: string) // id = 1
async getUser(@Query() queryData) // {"id": "1"}
```

Midway 提供了更多从 Query、Body 、Header 等位置获取值的装饰器，这些都是开箱即用，并且适配于不同的上层 Web 框架。


下面是这些装饰器，以及对应的等价框架取值方式。

| 装饰器 | Express 对应的方法 | Koa/EggJS 对应的方法 |
| --- | --- | --- |
| @Session(key?: string) | req.session / req.session[key] | ctx.session / ctx.session[key] |
| @Param(key?: string) | req.params / req.params[key] | ctx.params / ctx.params[key] |
| @Body(key?: string) | req.body / req.body[key] | ctx.request.body / ctx.request.body[key] |
| @Query(key?: string) | req.query / req.query[key] | ctx.query / ctx.query[key] |
| @Queries(key?: string) | 无 | 无 / ctx.queries[key] |
| @Headers(name?: string) | req.headers / req.headers[name] | ctx.headers / ctx.headers[name] |

:::caution
**注意 **@Queries 装饰器和 @Query **有所区别**。

Queries 会将相同的 key 聚合到一起，变为数组。当用户访问的接口参数为 `/?name=a&name=b` 时，@Queries 会返回 {name: [a, b]}，而 Query 只会返回 {name: b}
:::



### Query

在 URL 中 `?` 后面的部分是一个 Query String，这一部分经常用于 GET 类型的请求中传递参数。例如

```
GET /user?uid=1&sex=male
```

就是用户传递过来的参数。

**示例：从装饰器获取**

```typescript
// src/controller/user.ts
import { Controller, Get, Query } from "@midwayjs/decorator";

@Controller('/user')
export class UserController {
  @Get('/')
  async getUser(@Query('uid') uid: string): Promise<User> {
    // xxxx
  }
}
```

**示例：从 API 获取**

```typescript
// src/controller/user.ts
import { Controller, Get, Inject } from "@midwayjs/decorator";
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;

  @Get('/')
  async getUser(): Promise<User> {
    const query = this.ctx.query;
    // {
    //   uid: '1',
    //   sex: 'male',
    // }
  }
}
```

当 Query String 中的 key 重复时，`ctx.query` 只取 key 第一次出现时的值，后面再出现的都会被忽略。

比如 `GET /user?uid=1&uid=2` 通过 `ctx.query` 拿到的值是 `{ uid: '1' }`。



### Body

虽然我们可以通过 URL 传递参数，但是还是有诸多限制：

- [浏览器中会对 URL 的长度有所限制](http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)，如果需要传递的参数过多就会无法传递。
- 服务端经常会将访问的完整 URL 记录到日志文件中，有一些敏感数据通过 URL 传递会不安全。

在前面的 HTTP 请求报文示例中，我们看到在 header 之后还有一个 body 部分，我们通常会在这个部分传递 POST、PUT 和 DELETE 等方法的参数。一般请求中有 body 的时候，客户端（浏览器）会同时发送 `Content-Type` 告诉服务端这次请求的 body 是什么格式的。Web 开发中数据传递最常用的两类格式分别是 `JSON` 和 `Form`。

框架内置了 [bodyParser](https://github.com/koajs/bodyparser) 中间件来对这两类格式的请求 body 解析成 object 挂载到 `ctx.request.body` 上。HTTP 协议中并不建议在通过 GET、HEAD 方法访问时传递 body，所以我们无法在 GET、HEAD 方法中按照此方法获取到内容。

**示例：获取单个 body**

```typescript
// src/controller/user.ts
// POST /user/ HTTP/1.1
// Host: localhost:3000
// Content-Type: application/json; charset=UTF-8
//
// {"uid": "1", "name": "harry"}
import { Controller, Post, Body } from "@midwayjs/decorator";

@Controller('/user')
export class UserController {
  @Post('/')
  async updateUser(@Body('uid') uid: string): Promise<User> {
    // id 等价于 ctx.request.body.uid
  }
}
```

**示例：获取整个 body **

```typescript
// src/controller/user.ts
// POST /user/ HTTP/1.1
// Host: localhost:3000
// Content-Type: application/json; charset=UTF-8
//
// {"uid": "1", "name": "harry"}
import { Controller, Post, Body } from "@midwayjs/decorator";

@Controller('/user')
export class UserController {
  @Post('/')
  async updateUser(@Body() user: User): Promise<User> {
    // user 等价于 ctx.request.body 整个 body 对象
    // => output user
    // {
    //   uid: '1',
    //   name: 'harry',
    // }
  }
}
```

**示例：从 API 获取**

```typescript
// src/controller/user.ts
// POST /user/ HTTP/1.1
// Host: localhost:3000
// Content-Type: application/json; charset=UTF-8
//
// {"uid": "1", "name": "harry"}
import { Controller, Post, Inject } from "@midwayjs/decorator";
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;

  @Post('/')
  async getUser(): Promise<User> {
    const body = this.ctx.request.body;
    // {
    //   uid: '1',
    //   name: 'harry',
    // }
  }
}
```

**示例：获取 query 和 body 参数**


装饰器可以组合使用。
```typescript
@Post('/')
async updateUser(@Body() user: User, @Query('pageIdx') pageIdx: number): Promise<User> {
  // user 从 body 获取
  // pageIdx 从 query 获取
}
```
框架对 bodyParser 设置了一些默认参数，配置好之后拥有以下特性：

- 当请求的 Content-Type 为 `application/json`，`application/json-patch+json`，`application/vnd.api+json` 和 `application/csp-report` 时，会按照 json 格式对请求 body 进行解析，并限制 body 最大长度为 `1mb`。
- 当请求的 Content-Type 为 `application/x-www-form-urlencoded` 时，会按照 form 格式对请求 body 进行解析，并限制 body 最大长度为 `1mb`。
- 如果解析成功，body 一定会是一个 Object（可能是一个数组）。

:::caution

常见错误： `ctx.request.body` 和 `ctx.body` 混淆，后者其实是 `ctx.response.body` 的简写。

:::



### Router Params

如果路由上使用 `:xxx` 的格式来声明路由，那么参数可以通过 `ctx.params` 获取到。

**示例：从装饰器获取**

```typescript
// src/controller/user.ts
// GET /user/1
import { Controller, Get, Param } from "@midwayjs/decorator";

@Controller('/user')
export class UserController {
  @Get('/:uid')
  async getUser(@Param('uid') uid: string): Promise<User> {
    // xxxx
  }
}
```

**示例：从 API 获取**

```typescript
// src/controller/user.ts
// GET /user/1
import { Controller, Get, Inject } from "@midwayjs/decorator";
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;

  @Get('/:uid')
  async getUser(): Promise<User> {
    const params = this.ctx.params;
    // {
    //   uid: '1',
    // }
  }
}
```



### Header

除了从 URL 和请求 body 上获取参数之外，还有许多参数是通过请求 header 传递的。框架提供了一些辅助属性和方法来获取。

- `ctx.headers`，`ctx.header`，`ctx.request.headers`，`ctx.request.header`：这几个方法是等价的，都是获取整个 header 对象。
- `ctx.get(name)`，`ctx.request.get(name)`：获取请求 header 中的一个字段的值，如果这个字段不存在，会返回空字符串。
- 我们建议用 `ctx.get(name)` 而不是 `ctx.headers['name']`，因为前者会自动处理大小写。

**示例：从装饰器获取**

```typescript
// src/controller/user.ts
// GET /user/1
import { Controller, Get, Headers } from "@midwayjs/decorator";

@Controller('/user')
export class UserController {
  @Get('/:uid')
  async getUser(@Headers('cache-control') cacheSetting: string): Promise<User> {
    // no-cache
    // ...
  }
}
```

**示例：从 API 获取**

```typescript
// src/controller/user.ts
// GET /user/1
import { Controller, Get, Inject } from "@midwayjs/decorator";
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;

  @Get('/:uid')
  async getUser(): Promise<User> {
    const cacheSetting = this.ctx.get('cache-control');
    // no-cache
  }
}
```



### Cookie

HTTP 请求都是无状态的，但是我们的 Web 应用通常都需要知道发起请求的人是谁。为了解决这个问题，HTTP 协议设计了一个特殊的请求头：[Cookie](https://en.wikipedia.org/wiki/HTTP_cookie)。服务端可以通过响应头（set-cookie）将少量数据响应给客户端，浏览器会遵循协议将数据保存，并在下次请求同一个服务的时候带上（浏览器也会遵循协议，只在访问符合 Cookie 指定规则的网站时带上对应的 Cookie 来保证安全性）。

通过 `ctx.cookies`，我们可以在 Controller 中便捷、安全的设置和读取 Cookie。

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

Cookie 虽然在 HTTP 中只是一个头，但是通过 `foo=bar;foo1=bar1;` 的格式可以设置多个键值对。

Cookie 在 Web 应用中经常承担了传递客户端身份信息的作用，因此有许多安全相关的配置，不可忽视，[Cookie](cookie_session#默认的-cookies) 文档中详细介绍了 Cookie 的用法和安全相关的配置项，可以深入阅读了解。



### Session

通过 Cookie，我们可以给每一个用户设置一个 Session，用来存储用户身份相关的信息，这份信息会加密后存储在 Cookie 中，实现跨请求的用户身份保持。

框架内置了 [Session](https://github.com/midwayjs/midway/tree/main/packages/session) 插件，给我们提供了 `ctx.session` 来访问或者修改当前用户 Session 。

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

Session 的使用方法非常直观，直接读取它或者修改它就可以了，如果要删除它，直接将它赋值为 `null`：

```typescript
ctx.session = null;
```

和 Cookie 一样，Session 也有许多安全等选项和功能，在使用之前也最好阅读 [Session](cookie_session#默认的-session) 文档深入了解。



### 上传的文件

上传的文件一般使用 `multipart/form-data` 协议头，由 `@Files` 装饰器获取，由于上传功能由 upload 组件提供，具体可以参考 [upload 组件](./extensions/upload)。



### 其他的参数

还有一些比较常见的参数装饰器，以及它们的对应方法。

| 装饰器 | Express 对应的方法 | Koa/EggJS 对应的方法 |
| --- | --- | --- |
| @RequestPath | req.baseurl | ctx.path |
| @RequestIP | req.ip | ctx.ip |



**示例：获取 body 、path 和 ip**

```typescript
@Post('/')
async updateUser(
  @Body('id') id: string,
  @RequestPath() p: string,
  @RequestIP() ip: string): Promise<User> {

}
```



### 自定义请求参数装饰器

你可以快速通过`createRequestParamDecorator` 创建自定义请求参数装饰器。

```typescript
import { createRequestParamDecorator } from '@midwayjs/core';

// 实现装饰器
export const Token = () => {
  return createRequestParamDecorator(ctx => {
    return ctx.headers.token;
  });
};

// 使用装饰器
export class UserController {
  async invoke(@Token() token: string) {
    console.log(token);
  }
}
```




## 请求参数类型转换

如果是简单类型，Midway 会自动将参数转换为用户声明的类型。

比如：

数字类型

```ts
@Get('/')
async getUser(@Query('id') id: number): Promise<User> {
  console.log(typeof id)  // number
}
```

布尔类型

- 当值为 0，"0", "false" 则转为 false，其余返回 Boolean(value) 的值

```ts
@Get('/')
async getUser(@Query('id') id: boolean): Promise<User> {
  console.log(typeof id)  // boolean
}
```

如果是复杂类型，如果指定的类型是 Class，将会自动转换为该类的实例。

```typescript
// class
class UserDTO {
  name: string;

  getName() {
    return this.name;
  }
}

@Get('/')
async getUser(@Query() query: UserDTO): Promise<User> {
  // query.getName()
}
```

如果不希望被转换，可以使用 Interface。

```typescript
interface User {
  name: string;
}

@Get('/')
async getUser(@Query() query: User): Promise<User> {
  // ...
}
```



## 参数校验

参数校验功能由 validate 组件提供，具体可以参考 [validate 组件](./extensions/validate)。



## 设置 HTTP 响应

### 设置返回值

绝大多数的数据都是通过 body 发送给请求方的，和请求中的 body 一样，在响应中发送的 body，也需要有配套的 Content-Type 告知客户端如何对数据进行解析。

- 作为一个 RESTful 的 API 接口 controller，我们通常会返回 Content-Type 为 `application/json` 格式的 body，内容是一个 JSON 字符串。
- 作为一个 html 页面的 controller，我们通常会返回 Content-Type 为 `text/html` 格式的 body，内容是 html 代码段。

在 Midway 中你可以简单的使用 `return` 来返回数据。

```typescript
import { Controller, Get, HttpCode } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // 返回字符串
    return "Hello Midwayjs!";

    // 返回 json
    return {
      a: 1,
      b: 2,
    };

    // 返回 html
    return '<html><h1>Hello</h1></html>';

    // 返回 stream
    return fs.createReadStream('./good.png');
  }
}
```

也可以使用 koa 原生的 API。

```typescript
import { Controller, Get, HttpCode } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    // 返回字符串
    this.ctx.body = "Hello Midwayjs!";

    // 返回 json
    this.ctx.body = {
      a: 1,
      b: 2,
    };

    // 返回 html
    this.ctx.body = '<html><h1>Hello</h1></html>';

    // 返回 stream
    this.ctx.body = fs.createReadStream('./good.png');
  }
}
```

:::caution

注意：`ctx.body` 是 `ctx.response.body` 的简写，不要和 `ctx.request.body` 混淆了。

:::



### 设置状态码

默认情况下，响应的**状态码**总是**200**，我们可以通过在处理程序层添加 `@HttpCode` 装饰器或者通过 API 来轻松更改此行为。

当发送错误时，如 `4xx/5xx`，可以使用 [异常处理](error_filter) 抛出错误的方式实现。

**示例：使用装饰器**


```typescript
import { Controller, Get, HttpCode } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  @HttpCode(201)
  async home() {
    return "Hello Midwayjs!";
  }
}
```

**示例：使用 API**

```typescript
import { Controller, Get, Inject } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.status = 201;
    // ...
  }
}
```

:::info
状态码不能在响应流关闭后（response.end之后）修改。
:::



### 设置响应头

Midway 提供 `@SetHeader` 装饰器或者通过 API 来简单的设置自定义响应头。

**示例：使用装饰器**

```typescript
import { Controller, Get, SetHeader } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  @SetHeader('x-bbb', '123')
  async home() {
    return "Hello Midwayjs!";
  }
}

```
当有多个响应头需要修改的时候，你可以直接传入对象。


```typescript
import { Controller, Get, SetHeader } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  @SetHeader({
  	'x-bbb': '123',
    'x-ccc': '234'
  })
  async home() {
    return "Hello Midwayjs!";
  }
}

```
**示例：使用 API**

```typescript
import { Controller, Get, Inject } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.set('x-bbb', '123');
    // ...
  }
}
```

:::info
响应头不能在响应流关闭后（response.end之后）修改。
:::

### 重定向

如果需要简单的将某个路由重定向到另一个路由，可以使用 `@Redirect` 装饰器。 `@Redirect` 装饰器的参数为一个跳转的 URL，以及一个可选的状态码，默认跳转的状态码为 `302` 。

此外，也可以通过 API 来跳转。

**示例：使用装饰器**


```typescript
import { Controller, Get, Redirect } from "@midwayjs/decorator";

@Controller('/')
export class LoginController {

  @Get('/login_check')
  async check() {
    // TODO
  }

  @Get('/login')
  @Redirect('/login_check')
  async login() {
    // TODO
  }

  @Get('/login_another')
  @Redirect('/login_check', 302)
  async loginAnother() {
    // TODO
  }
}
```
**示例：使用 API**

```typescript
import { Controller, Get, Inject } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.redirect('/login_check');
    // ...
  }
}
```

:::info
重定向不能在响应流关闭后（response.end之后）修改。
:::




### 响应类型

虽然浏览器会自动根据内容判断最佳的响应内容，但是我们经常会碰到需要手动设置的情况。我们也提供了 `@ContentType` 装饰器用于设置响应类型。

此外，也可以通过 API 来设置。

**示例：使用装饰器**


```typescript
import { Controller, Get, ContentType } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  @ContentType('html')
  async login() {
    return '<body>hello world</body>';
  }
}
```
**示例：使用 API**

```typescript
import { Controller, Get, Inject } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.type = 'html';
    // ...
  }
}
```

:::info
响应类型不能在响应流关闭后（response.end之后）修改。
:::



## 全局路由前缀

需要在 `src/config/config.default` 配置中设置。

注意，不同组件在不同的关键字配置下：

<Tabs>
<TabItem value="koa" label="koa">

```typescript
// src/config/config.default.ts
export default {
  koa: {
    globalPrefix: '/v1'
  }
};
```
</TabItem>
<TabItem value="egg" label="Egg.js">

```typescript
// src/config/config.default.ts
export default {
  egg: {
    globalPrefix: '/v1'
  }
};
```

</TabItem>
<TabItem value="express" label="Express">

```typescript
// src/config/config.default.ts
export default {
  express: {
    globalPrefix: '/v1'
  }
};
```

</TabItem>
</Tabs>

配置后，所有的路由都会自动增加该前缀。

如有特殊路由不需要，可以使用装饰器参数忽略。

**示例：Controller 级别忽略**

```typescript
// 该 Controller 下所有路由都将忽略全局前缀
@Controller('/api', {ignoreGlobalPrefix: true})
export class HomeController {
  // ...
}
```

**示例：路由级别忽略**

```typescript
@Controller('/')
export class HomeController {
  // 该路由不会忽略
  @Get('/', {})
  async homeSet() {
  }

  // 该路由会忽略全局前缀
  @Get('/bbc', {ignoreGlobalPrefix: true})
  async homeSet2() {
  }
}
```



## 路由优先级


midway 已经统一对路由做排序，通配的路径将自动降低优先级，在最后被加载。


规则如下：


- 1、绝对路径规则优先级最高如 `/ab/cb/e`
- 2、星号只能出现最后且必须在/后面，`如 /ab/cb/**`
- 3、如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高，比如 `/abc/*` 和 `/abc/d`，那么请求 `/abc/d` 时，会匹配到后一个绝对的路由
- 4、有多个通配能匹配一个路径时，最长的规则匹配，如 `/ab/**` 和 `/ab/cd/**` 在匹配 `/ab/cd/f` 时命中 `/ab/cd/**`
- 5、如果 `/` 与 `/*` 都能匹配 `/` ,但 `/` 的优先级高于 `/*`
- 6、如果都为通配，但是其余权重都一样，比如 `/:page/page` 和 `/page/:page` ，那么两者权重等价，以编码加载顺序为准



此规则也与 Serverless 下函数的路由规则保持一致。


简单理解为，“明确的路由优先级最高，长的路由优先级高，通配的优先级最低”。


比如：
```typescript
@Controller('/api')
export class APIController {
  @Get('/invoke/*')
  async invokeAll() {
  }

  @Get('/invoke/abc')
  async invokeABC() {
  }
}
```
这种情况下，会先注册 `/invoke/abc` ，保证优先级更高。


不同的 Controller 的优先级，我们会以长度进行排序， `/` 根 Controller 我们将会最后加载。

