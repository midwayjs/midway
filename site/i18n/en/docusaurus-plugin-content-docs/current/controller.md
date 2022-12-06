import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Routing and controller

In the common MVC architecture, C represents the controller, which is responsible for **parsing the user's input and returning the corresponding results after processing.**

As shown in the figure, the client requests the controller of the server through the Http protocol, and the controller responds to the client after processing. This is the most basic "request-response" process.

![controller](https://img.alicdn.com/imgextra/i1/O1CN01dYitV22ADuagILnp3_!!6000000008170-2-tps-1600-634.png)


Common ones are:


- In the [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) interface, the controller accepts the user's parameters, returns the contents from the database to the user, or updates the user's request to the database.
- In the HTML page request, the controller renders different templates to obtain HTML and returns it to the user according to the user's access to different URLs.
- In a proxy server, the controller forwards the user's request to other servers and returns the processing results of other servers to the user.



Generally speaking, the controller is often used to verify, convert, and call complex business logic on the user's request parameters, assemble the data after getting the corresponding business results, and then return.


In Midway, controllers **also carry routing capabilities**. Each controller can provide multiple routes, and different routes can perform different operations.


In the following example, we will demonstrate how to create a route in the controller.


## Routing


Controller files are generally in the `src/controller` directory, where we can create controller files. Midway annotates controllers with the `@Controller()` decorator, where the decorator has an optional parameter for route prefix (grouping), so that all routes under this controller will carry this prefix.


At the same time, Midway provides a method decorator for marking the type of request.


For example, we create a homepage controller to return a default`/`route.
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
The `@Controller` decorator tells the framework that this is a class of type Web Controller, and the `@Get` decorator tells the framework that the decorated `home` method will be exposed as a `/` route, which can be accessed by ` GET` request to access.


The whole method returns a string, and in the browser you will receive the response type of `text/plain` and a `200` status code.


## Routing method


In the preceding example, you have created a **GET** route. In general, we will have other HTTP Methods, Midway provides more routing method decorators.


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
Midway also provides other decorators, such as `@Get`, `@Post`, `@Put()`, `@Del()`, `@Patch()`, `@Options()`, `@Head()`, and `@All()`.


The `@All` decorator is special, indicating that it can accept all types of HTTP methods.


You can bind multiple routes to the same method.
```typescript
@Get('/')
@Get('/main')
async home() {
  return 'Hello Midwayjs!';
}
```


## Get request parameters


Next, we will create an HTTP API about users. Similarly, we will create a `src/controller/user.ts` file. This time we will add a routing prefix and more request types.


Let's take the user type as an example, first add a user type, and we usually put the defined content in the `src/interface.ts` file.
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
Add a route prefix and the corresponding controller.
```typescript
// src/controller/user.ts

import { Controller } from "@midwayjs/decorator";

@Controller('/api/user')
export class UserController {
  // xxxx
}

```

Next, we will call different processing logic for different request types. Except for the request type, the requested data is generally dynamic and will be passed at different locations in HTTP, such as common Query,Body, etc.



### Decorator parameter conventions


Midway adds a common decorator for dynamic values. Take the `@Query` decorator as an example. The `@Query` decorator obtains the query parameters in the URL and assigns them to the input parameters of the function. In the following example, the id is obtained from the query parameter of the route. If the URL is `/?id = 1`, the value of the id is 1. At the same time, the route returns an object of the `User` type.
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

The `@Query` decorator has a parameter. You can pass in a specified string key to obtain the corresponding value and assign the value to the input parameter. If the parameter is not passed in, the entire query object is returned by default.

```typescript
// URL = /?id=1
async getUser(@Query('id') id: string) // id = 1
async getUser(@Query() queryData) // {"id": "1"}
```

Midway provides more decorators that get values from Query, Body, Header, etc., which are all out of the box and adapted to different upper-level Web frameworks.


The following are these decorators and the corresponding equivalent frame values.

| Decorator | Express the corresponding method | Corresponding method of Koa/EggJS |
| --- | --- | --- |
| @Session(key?: string) | req.session / req.session [key] | ctx.session / ctx.session [key] |
| @Param(key?: string) | req.params / req.params [key] | ctx.params / ctx.params [key] |
| @Body(key?: string) | req.body / req.body [key] | ctx.request.body / ctx.request.body [key] |
| @Query(key?: string) | req.query / req.query [key] | ctx.query / ctx.query[key] |
| @Queries(key?: string) | - | -/ctx.queries [key] |
| @Headers(name?: string) | req.headers / req.headers [name] | ctx.headers / ctx.headers [name] |

:::caution
**Note** @Queries decorator is **different from** @Query.

Queries will aggregate the same keys together and become an array. When the interface parameter accessed by the user is `/? When name = a & name = B`, @Queries will return {name: [a, B] }, while Query will only return {name: B}
:::



### Query

The part after `?` in the URL is a Query String, which is often used to pass parameters in GET type requests.

For example

```
GET /user?uid=1&sex=male
```

It is the parameter passed by the user.

**Example: Get from Decorator**

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

**Example: Get from an API operation**

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
    // sex: 'male',
    //}
  }
}
```

If the key in the Query String is repeated, the `ctx.query` parameter is only the value of the key when it appears for the first time. Any subsequent key is ignored.

For example, `GET /user?uid = 1 & uid = 2` is `{ uid: '1' }` by using `ctx.query`.



### Body

Although we can pass parameters through the URL, there are still many limitations:

- [The length of the URL is limited in the browser](http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers). If there are too many parameters to pass, the URL cannot be passed.
- The server often records the complete URL of the access to the log file, and it is unsafe to pass some sensitive data through the URL.

In the previous HTTP request message example, we saw that there is a body part after the header, and we usually pass the parameters of POST, PUT, DELETE and other methods in this part. When there is a body in a general request, the client (browser) will send a `Content-Type` at the same time to tell the server what format the body of this request is. The two most commonly used data delivery formats in Web development are `JSON` and `Form`.

The framework has built-in [bodyParser](https://github.com/koajs/bodyparser) middleware to parse requests in these two formats into objects and mount them to `ctx.request.body`. HTTP protocol does not recommend passing body when accessing through GET and HEAD methods, so we cannot obtain content according to this method in GET and HEAD methods.

**Example: Get a single body**

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
    // id is equivalent to ctx.request.body.uid
  }
}
```

**Example: Get the entire body**

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
    // user is equivalent to the entire body object of ctx.request.body
    // => output user
    // {
    //   uid: '1',
    //   name: 'harry',
    // }
  }
}
```

**Example: Get from an API operation**

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
    // uid: '1',
    // name: 'harry',
    //}
  }
}
```

**Example: Obtain query and body parameters**


Decorators can be used in combination.
```typescript
@Post('/')
async updateUser(@Body() user: User, @Query('pageIdx') pageIdx: number): Promise<User> {
  // user gets it from body
  // pageIdx obtained from query
}
```
The framework sets some default parameters for the bodyParser. After configuration, it has the following features:

- If the request Content-Type is `application/json`, `application/json-patch + json`, `application/vnd.api + json`, and `csp-report`, the request body is parsed in json format and the maximum length of the body is limited to `1mb`.
- When the request Content-Type is `application/x-www-form-urlencoded`, the request body is parsed in the form format and the maximum length of the body is limited to `1mb`.
- If the parsing is successful, the body must be an Object (possibly an array).

:::caution

Common errors: `ctx.request.body` is confused with `ctx.body`, which is the abbreviation of `ctx.response.body`.

:::



### Router Params

If the route is declared in the `:xxx` format, you can use `ctx.params` to obtain the parameters.

**Example: Get from Decorator**

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

**Example: Get from an API operation**

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
    // uid: '1',
    //}
  }
}
```



### Header

In addition to getting parameters from the URL and request body, many parameters are passed through the request header. The framework provides some auxiliary properties and methods to obtain.

- `ctx.headers`, `ctx.header`, `ctx.request.headers`, `ctx.request.header`: These methods are equivalent to obtaining the entire header object.
- `ctx.get(name)`, `ctx.request.get(name)`: Gets the value of a field in the request header. If this field does not exist, an empty string is returned.
- We recommend using `ctx.get(name)` instead of `ctx.headers['name']`, because the former will automatically handle case.

**Example: Get from Decorator**

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

**Example: Get from an API operation**

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

HTTP requests are stateless, but our Web applications usually need to know who initiated the request. To solve this problem, HTTP protocol designs a special request header: [Cookie](https://en.wikipedia.org/wiki/HTTP_cookie). The server can respond to a small amount of data to the client through the response header (set-cookie). The browser will follow the protocol to save the data and bring it with it when requesting the same service next time (the browser will also follow the protocol and only bring the corresponding cookie when visiting websites that meet the cookie specified rules to ensure security).

`ctx.cookies` allows us to set and read Cookie conveniently and safely in our Controller.

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

Although a cookie is only a header in HTTP, you can set multiple key-value pairs in the format of `foo = bar;foo1 = bar1;`.

Cookie often plays a role in transmitting client identity information in Web applications. Therefore, there are many security-related configurations that cannot be ignored. The [Cookie](cookie_session#Default-Cookies) document describes the usage of cookies and security-related configuration items in detail.



### Session

Through Cookie, we can set a Session for each user to store information related to the user's identity. This information will be encrypted and stored in Cookie to maintain the user's identity across requests.

The framework has built-in [Session](https://github.com/midwayjs/midway/tree/main/packages/session) plug-ins, which provide us with `ctx.session` to access or modify the current user Session.

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

The use of the Session is very intuitive, just read it directly or modify it. If you want to delete it, assign it `null` directly:

```typescript
ctx.session = null;
```

Like Cookie, Session also has many security options and functions. It is better to read [Session](cookie_session# Default-session) documents for further understanding before using them.



### Uploaded file

Generally, the `multipart/form-data` protocol header is used to obtain the uploaded files by the `@Files` decorator. The upload function is provided by the upload component. For more information, see [upload component](./extensions/upload).



### Other parameters

There are also some more common parameter decorators and their corresponding methods.

| Decorator | Express the corresponding method | Corresponding method of Koa/EggJS |
| --- | --- | --- |
| @RequestPath | req.baseurl | ctx.path |
| @RequestIP | req.ip | ctx.ip |



**Example: Obtain the body, path, and ip address**

```typescript
@Post('/')
async updateUser (
  @Body('id') id: string,
  @RequestPath() p: string
  @RequestIP() ip: string): Promise<User> {

}
```



### Custom request parameter decorator

You can quickly create custom request parameter decorators with `createRequestParamDecorator`.

```typescript
import { createRequestParamDecorator } from '@midwayjs/core';

// Implement decorator
export const Token = () => {
  return createRequestParamDecorator(ctx => {
    return ctx.headers.token;
  });
};

// Use decorator
export class UserController {
  async invoke(@Token() token: string) {
    console.log(token);
  }
}
```



## Request parameter type conversion

If it is a simple type, Midway will automatically convert the parameter to the user-declared type.

For example:

Number type

```ts
@Get('/')
async getUser(@Query('id') id: number): Promise<User> {
  console.log(typeof id) // number
}
```

Boolean type

- When the value is 0,"0", "false" is converted to false, and the rest return Boolean(value) values

```ts
@Get('/')
async getUser(@Query('id') id: boolean): Promise<User> {
  console.log(typeof id) // boolean
}
```

If it is a complex type, if the specified type is Class, it will be automatically converted to an instance of the class.

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

If you do not want to be converted, you can use Interface.

```typescript
interface User {
  name: string;
}

@Get('/')
async getUser(@Query() query: User): Promise<User> {
  // ...
}
```



## Parameter verification

The parameter verification function is provided by the validate component. For details, please refer to the [validate component](./extensions/validate).



## Set HTTP response

### Set the return value

Most of the data is sent to the requester through the body. Like the body in the request, the body sent in the response also needs a matching Content-Type to tell the client how to parse the data.

- As a RESTful API interface controller, we usually return a body with Content-Type in `application/json` format and the content is a JSON string.
- As a controller of an html page, we usually return a body with a Content-Type of `text/html` format, and the content is html code segments.

In Midway, you can simply use `return` to return data.

```typescript
import { Controller, Get, HttpCode } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // Return string
    return "Hello Midwayjs!";

    // Return json
    return {
      a: 1
      b: 2
    };

    // return html
    return '<html><h1>Hello</h1></html>';

    // Return to stream
    return fs.createReadStream('./good.png');
  }
}
```

You can also use koa's native API.

```typescript
import { Controller, Get, HttpCode } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    // Return string
    this.ctx.body = "Hello Midwayjs!";

    // Return JSON
    this.ctx.body = {
      a: 1,
      b: 2,
    };

    // return html
    this.ctx.body = '<html><h1>Hello</h1></html>';

    // Return to stream
    this.ctx.body = fs.createReadStream('./good.png');
  }
}
```

:::caution

Note: `ctx.body` is the abbreviation of `ctx.response.body`. Do not confuse it with `ctx.request.body`.

:::



### Set status code

By default, the **status code** of the response is always **200**, and we can easily change this behavior by adding a `@HttpCode` decorator at the handler layer or through the API.

When sending an error, such as `4xx/5xx`, you can use [exception handling](error_filter) to throw an error.

**Example: Using a Decorator**


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

**Example: API operation**

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
The status code cannot be modified after the response stream is closed (after response.end).
:::



### Set response header

Midway provides a `@SetHeader` decorator or an API to simply set up a custom response header.

**Example: Using a Decorator**

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
When there are multiple response headers that need to be modified, you can directly pass in the object.


```typescript
import { Controller, Get, SetHeader } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/')
  @SetHeader({
  	'x-bbb ': '123',
    'x-ccc ': '234'
  })
  async home() {
    return "Hello Midwayjs!";
  }
}

```
**Example: API operation**

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
The response header cannot be modified after the response flow is closed (after response.end).
:::

### Redirection

If you need to simply redirect a route to another route, you can use the `@Redirect` decorator. The parameters of the `@Redirect` decorator are a redirect URL and an optional status code. The default redirect status code is `302` .

In addition, you can jump through the API.

**Example: Using a Decorator**


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
**Example: API operation**

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
Redirection cannot be modified after the response flow is closed (after response.end).
:::




### Response type

Although the browser will automatically judge the best response content based on the content, we often encounter situations that need to be set manually. We also provide a `@ContentType` decorator for setting the response type.

In addition, it can also be set through API.

**Example: Using a Decorator**


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
**Example: API operation**

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
The response type cannot be modified after the response flow is closed (after response.end).
:::



## Global route prefix

It needs to be set in the `src/config/config.default` configuration.

Note that different components are configured under different keywords:

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

After configuration, all routes automatically add this prefix.

If there are special routes that are not required, you can use the decorator parameters to ignore them.

**Example: Controller Level Ignoring**

```typescript
// All routes under this Controller will ignore the global prefix
@Controller('/api', {ignoreGlobalPrefix: true})
export class HomeController {
  // ...
}
```

**Example: route level ignored**

```typescript
@Controller('/')
export class HomeController {
  // This route will not be ignored
  @Get('/', {})
  async homeSet() {
  }

  // The route ignores the global prefix
  @Get('/bbc', {ignoreGlobalPrefix: true})
  async homeSet2() {
  }
}
```



## Routing priority


Midway has already sorted the routes uniformly, and the wildcard route will automatically reduce the priority and be loaded at the end.


The rules are as follows:


- 1. The absolute path rule has the highest priority, such as `/AB/cb/e`.
- 2. The asterisk can only appear last and must be followed by/. For example, `/AB/cb/**`
- 3. If the absolute path and the general configuration can match one path, the absolute rule has a high priority, such as `/abc/*` and `/abc/d`, then the next absolute route is matched when the `/abc/d` request is requested.
- 4. If multiple wildspaces match a path, the longest rule matches. For example, `/AB/**` and `/AB/cd/**` hit `/AB/cd/**` when matching `/AB/cd/f`.
- 5. If both`/`and `/*` match`/`, the priority of`/`is higher than that of `/*`
- 6. If the weights are the same, such as `/:page/page` and `/page/:page`.



This rule is also consistent with the routing rules of the functions under the Serverless.


It is simply understood as "clear routes have the highest priority, long routes have the highest priority, and general distribution has the lowest priority".


For example:
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
In this case, `/invoke/abc` is registered first to ensure higher priority.


The priority of different Controller will be sorted by length, and the`/`root Controller will be loaded finally.

