# 控制器（Controller）

在常见的 MVC 架构中，C 即代表控制器，控制器用于负责**解析用户的输入，处理后返回相应的结果。**


![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1600592027849-679b4cfc-cf11-466a-a467-403907bd6a3e.png#height=317&id=Hffdy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=634&originWidth=1600&originalType=binary&ratio=1&size=57905&status=done&style=none&width=800)


常见的有：


- 在 [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) 接口中，控制器接受用户的参数，从数据库中查找内容返回给用户或者将用户的请求更新到数据库中。
- 在 HTML 页面请求中，控制器根据用户访问不同的 URL，渲染不同的模板得到 HTML 返回给用户。
- 在代理服务器中，控制器将用户的请求转发到其他服务器上，并将其他服务器的处理结果返回给用户。



一般来说，控制器常用于对用户的请求参数做一些校验，转换，调用复杂的业务逻辑，拿到相应的业务结果后进行数据组装，然后返回。


在 Midway 中，控制器**也承载了路由的能力**，每个控制器可以提供多个路由，不同的路由可以执行不同的操作。


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

import { Controller, Get } from '@midwayjs/decorator';

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


## 请求参数


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



| **装饰器** | **Express** | **Koa/EggJS** |
| --- | --- | --- |
| @Session(key?: string) | req.session / req.session[key] | ctx.session / ctx.session[key] |
| @Param(key?: string) | req.params / req.params[key] | ctx.params / ctx.params[key] |
| @Body(key?: string) | req.body / req.body[key] | ctx.request.body / ctx.request.body[key] |
| @Query(key?: string) | req.query / req.query[key] | ctx.query / ctx.query[key] |
| @Queries(key?: string) | 无 | 无 / ctx.queries[key] |
| @Headers(name?: string) | req.headers / req.headers[name] | ctx.headers / ctx.headers[name] |
|  |  |  |


:::warning
**注意 **@Queries 装饰器和 @Query **有所区别**。


Queries 会将相同的 key 聚合到一起，变为数组。当用户访问的接口参数为 `/?name=a&name=b` 时，@Queries 会返回 {name: [a, b]}，而 Query 只会返回 {name: b}
:::



**示例：获取单个 body**
```typescript
@Post('/')
async updateUser(@Body('id') id: string): Promise<User> {
  // id 等价于 ctx.request.body.id
}
```
**示例：所有 body 参数**
```typescript
@Post('/')
async updateUser(@Body() user: User): Promise<User> {
  // user 等价于 ctx.request.body 整个 body 对象
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
**示例：获取 param 参数**
```typescript
@Get('/api/user/:uid')
async findUser(@Param('uid') uid: string): Promise<User> {
  // uid 从路由参数中获取
}
```


还有一些比较常见的参数装饰器，以及它们的对应方法。



| **装饰器** | **Express** | **Koa/EggJS** |
| --- | --- | --- |
| @RequestPath | req.baseurl | ctx.path |
| @RequestIP | req.ip | ctx.ip |
|  |  |  |



**示例：获取 body 、path 和 ip**
```typescript
@Post('/')
async updateUser(
  @Body('id') id: string,
  @RequestPath() p: string,
  @RequestIP() ip: string): Promise<User> {

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


## 状态码


默认情况下，响应的**状态码**总是**200**，我们可以通过在处理程序层添加 `@HttpCode` 装饰器来轻松更改此行为。


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


:::info
状态码装饰器不能在响应流关闭后（response.end之后）修改。
:::
## 响应头


Midway 提供 `@SetHeader` 装饰器来简单的设置自定义响应头。
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
:::info
响应头装饰器不能在响应流关闭后（response.end之后）修改。
:::
## 重定向


如果需要简单的将某个路由重定向到另一个路由，可以使用 `@Redirect` 装饰器。 `@Redirect` 装饰器的参数为一个跳转的 URL，以及一个可选的状态码，默认跳转的状态码为 `302` 。


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
:::info
重定向装饰器不能在响应流关闭后（response.end之后）修改。
:::




## 响应类型


虽然浏览器会自动根据内容判断最佳的响应内容，但是我们经常会碰到需要手动设置的情况。我们也提供了 `@ContentType` 装饰器用于设置响应类型。


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
:::info
响应类型装饰器不能在响应流关闭后（response.end之后）修改。
:::
## 优先级


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

