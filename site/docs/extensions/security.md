# 安全

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用安全组件，支持 `csrf` 、`xss` 等多种安全策略。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |



## 安装使用

1、安装依赖

```bash
$ npm i @midwayjs/security --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/security": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



2、在 configuration 中引入组件

```typescript
import * as security from '@midwayjs/security';
@Configuration({
  imports: [
    // ...other components
    security
  ],
})
export class MainConfiguration {}
```

---

## 防范常见的安全威胁


### 一、CSRF

CSRF（Cross-site request forgery 跨站请求伪造），是一种挟制用户在当前已登录的Web应用程序上执行非本意的操作的攻击方法。


#### 1. 令牌同步模式
通过响应页面时将 token 渲染到页面上，在开启 `csrf` 配置后，通过 `ctx.csrf` 可以获取到 `csrf token`，可以再返回页面 html 时同步输出

```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    return `<form method="POST" action="/upload?_csrf=${ this.ctx.csrf }" >
      title: <input name="title" />
      <button type="submit">upload</button>
    </form>`;
  }
}
```

传递 CSRF token 的字段（上述示例中的 `_csrf`）可以在配置中改变，请查看下述 `配置 -> csrf`。



#### 2. Cookies 模式

在 CSRF 默认配置下，token 会被设置在 Cookie 中，可以再前端页面中通过 JS 从 Cookies 中获取，然后再 ajax/fetch 等请求中添加到 `header`、`query` 或 `body` 中。

```js
const csrftoken = Cookies.get('csrfToken');
fetch('/api/post', {
  method: 'POST',
  headers: {
    'x-csrf-token': csrftoken
  },
  ...
});
```

默认配置下，框架会将 `CSRF token` 存在 `Cookie` 中，以方便前端 JS 发起请求时获取到。但是所有的子域名都可以设置 Cookie，因此当我们的应用处于无法保证所有的子域名都受控的情况下，存放在 `Cookie` 中可能有被 `CSRF` 攻击的风险。框架提供了一个配置项 `useSession`，可以将 token 存放到 Session 中。


当 `CSRF token` 存储在 `Cookie` 中时，一旦在同一个浏览器上发生用户切换，新登陆的用户将会依旧使用旧的 token（之前用户使用的），这会带来一定的安全风险，因此在每次用户登陆的时候都必须调用 `ctx.rotateCsrfSecret()` 刷新 `CSRF token`，例如：


```js
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Inject()
  userService;

  @Get('/login')
  async login(@Body('username') username: string, @Body('password') password: string) {
    const user = await userService.login({ username, password });
    this.ctx.session = { user };
    this.ctx.rotateCsrfSecret();
    return { success: true };
  }
}
```

### 二、XSS

`XSS`（cross-site scripting 跨站脚本攻击）攻击是最常见的 Web 攻击，是代码注入的一种。它允许恶意用户将代码注入到网页上，其他用户在观看网页时就会受到影响。

`XSS` 攻击通常指的是通过利用网页开发时留下的漏洞，通过巧妙的方法注入恶意指令代码到网页，使用户加载并执行攻击者恶意制造的网页程序。攻击成功后，攻击者可能得到更高的权限（如执行一些操作）、私密网页内容、会话和cookie等各种内容。


#### 1. 反射型的 XSS 攻击

主要是由于服务端接收到客户端的不安全输入，在客户端触发代码执行从而发起 `Web` 攻击。

例如：在某搜索网站搜索时，搜索结果会显示搜索的关键词。搜索关键词填入 `<script>alert('xss')</script>`, 点击搜索后，若页面程序没有对关键词进行处理，这段代码就会直接在页面上执行，弹出 alert。

框架提供了 `ctx.security.escape()` 方法对字符串进行 XSS 过滤。

```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    const str = `<script>alert('xss')</script>`;
    const escapedStr = this.ctx.security.escape(str);
    // &lt;script&gt;alert(&quot;xss&quot;) &lt;/script&gt;
    return escapedStr;
  }
}
```

另外当网站输出的内容是作为 js 脚本的。这个时候需要使用 `ctx.security.js()` 来进行过滤。

还有一种情况，有时候我们需要在 `js` 中输出 `json` ，若未做转义，易被利用为 `XSS` 漏洞。框架提供了 `ctx.security.json(变量)` 来提供 json encode，防止 XSS 攻击。


```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    return `<script>windows.config = ${this.ctx.security.json( ...variable )};</script>`;
  }
}
```

#### 2. 存储型的 XSS 攻击

通过提交带有恶意脚本的内容存储在服务器上，当其他人看到这些内容时发起 Web 攻击，比如一些网站的评论框中，用户恶意将一些代码作为评论内容，若没有过滤，其他用户看到这个评论时恶意代码就会执行。


框架提供了 `ctx.security.html()` 来进行过滤。


#### 3. 其他 XSS 的防范方式

浏览器自身具有一定针对各种攻击的防范能力，他们一般是通过开启 Web 安全头生效的。框架内置了一些常见的 Web 安全头的支持。

**CSP**

`Content Security Policy`，简称 `CSP`，主要是用来定义页面可以加载哪些资源，减少 `XSS` 的发生。

默认关闭（可通过 `csp: {enable: true}` 配置开启），开启后可以有效的防止 `XSS` 攻击的发生。要配置 `CSP` , 需要对 `CSP` 的 `policy` 策略有了解，具体细节可以参考 [阿里聚安全 - CSP是什么？](https://www.zhihu.com/question/21979782/answer/122682029)


**X-Download-Options:noopen**

默认开启（可通过 `noopen: {enable: false}` 配置关闭），禁用 IE 下下载框 Open 按钮，防止 IE 下下载文件默认被打开 XSS。

**X-Content-Type-Options:nosniff**
禁用 IE8 自动嗅探 mime 功能，默认关闭（可通过 `nosniff: {enable: true}` 配置开启），例如 text/plain 却当成 text/html 渲染，特别当本站点 serve 的内容未必可信的时候。

**X-XSS-Protection**
IE 提供的一些 XSS 检测与防范，默认开启（可通过 `xssProtection: {enable: false}` 配置关闭）

close 默认值 false，即设置为 1; mode=block

---


## 配置

默认配置如下：

```ts
// src/config/config.default
export default {
  // ...

  // 默认配置
  security: {
    csrf: {
      enable: true,
      type: 'ctoken',
      useSession: false,
      cookieName: 'csrfToken',
      sessionName: 'csrfToken',
      headerName: 'x-csrf-token',
      bodyName: '_csrf',
      queryName: '_csrf',
      refererWhiteList: [],
    },
    xframe: {
      enable: true,
      value: 'SAMEORIGIN',
    },
    csp: {
      enable: false,
    },
    hsts: {
      enable: false,
      maxAge: 365 * 24 * 3600,
      includeSubdomains: false,
    },
    noopen: {
      enable: false,
    },
    nosniff: {
      enable: false,
    },
    xssProtection: {
      enable: true,
      value: '1; mode=block',
    },
  },
}

```

### csrf

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | true |
| type | 'all' / 'any' / 'ctoken' / 'referer' | csrf 校验类型，all/any 等于 ctoken + referer | 'ctoken' 从query/header/body 中获取 csrf token；；'referer' 则可以通过 refererWhiteList 配置白名单 |
| useSession | boolean | csrf token 是否存放在 session 中 | false，默认存放在 cookies 中 |
| cookieName | string | token 在 cookie 中存放的 字段 | 'csrfToken' |
| sessionName | string | token 在 session 中存放的 字段 | 'csrfToken' |
| headerName | string | token 在 header 中存放的 字段 | 'x-csrf-token' |
| bodyName | string | token 在 body 中存放的 字段 | '_csrf' |
| queryName | string | token 在 query 中存放的 字段 | '_csrf' |
| refererWhiteList | Array<string\> | 允许的来源白名单 | [] |

#### 配置 refererWhiteList 不生效？
+ 原因一：refererWhiteList 中需要配置 referer 的 host 部分，例如 referer 为 `https://midway-demo.com:1234/docs`，则 refererWhiteList 中需要配置 `midway-demo.com:1234`。
+ 原因二：refererWhiteList 仅在 csrf 配置中 type 为 `referer` 的情况下生效，默认 type 为 `ctoken`，需要修改为 `referer`。
+ 原因三：发送的http请求中的 referer 字段不是一个标准的 url 地址（例如没有加上请求协议等），参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referer) 文档

### xframe


xframe 用来配置 `X-Frame-Options` 响应头，用来给浏览器指示允许一个页面可否在 `frame`, `iframe`, `embed` 或者 `object` 中展现的标记。站点可以通过确保网站没有被嵌入到别人的站点里面，从而避免 `clickjacking` 攻击。

`X-Frame-Options` 有三个可能的值：

+ X-Frame-Options: deny：页面不允许在 frame 中展示
+ X-Frame-Options: sameorigin：该页面可以在相同域名页面的 frame 中展示
+ X-Frame-Options: allow-from https://example.com/：该页面可以在指定来源的 frame 中展示



| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | true |
| value | string | X-Frame-Options 值 | 'SAMEORIGIN' |



### hsts

`HTTP Strict Transport Security`（通常简称为 `HSTS` ）是一个安全功能，它告诉浏览器只能通过 `HTTPS` 访问当前资源，而不是 `HTTP`。

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | false |
| maxAge | number | 在浏览器收到这个请求后的多少 `秒` 时间内凡是访问这个域名下的请求都使用HTTPS请求 | `365 * 24 * 3600` 即一年 |
| includeSubdomains | boolean | 此规则是否适用于该网站的所有子域名 | false |


### csp

HTTP 响应头 `Content-Security-Policy` 允许站点管理者控制指定的页面加载哪些资源。这将帮助防止跨站脚本攻击（XSS）。


| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | false |
| policy | Object<key: string, value: string / string[] / boolean> | 策略列表 | {} |
| reportOnly | boolean | 是否开启 | false |
| supportIE | boolean | 是否支持IE浏览器 | false |

详细的 `policy` 配置可以参考: [Content Security Policy (CSP) 是什么？阿里聚安全](https://www.zhihu.com/question/21979782/answer/122682029)


### noopen

用于指定 `IE 8` 以上版本的用户不打开文件而直接保存文件。在下载对话框中不显式“打开”选项。

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | false |




### nosniff

开启后，如果从 `script` 或 `stylesheet` 读入的文件的 `MIME` 类型与指定 `MIME` 类型不匹配，不允许读取该文件。用于防止 `XSS` 等跨站脚本攻击。

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | false |




### xssProtection

用于启用浏览器的XSS过滤功能，以防止 `XSS` 跨站脚本攻击。

`X-XSS-Protection` 响应头是 `IE`，`Chrome` 和 `Safari` 的一个特性，当检测到跨站脚本攻击 (XSS (en-US))时，浏览器将停止加载页面。若网站设置了良好的 `Content-Security-Policy` 来禁用内联 JavaScript ('unsafe-inline')，现代浏览器不太需要这些保护， 但其仍然可以为尚不支持 `CSP` 的旧版浏览器的用户提供保护。

`X-XSS-Protection` 可以配置下述四个值

+ `0`: 禁止XSS过滤。
+ `1`：启用XSS过滤（通常浏览器是默认的）。 如果检测到跨站脚本攻击，浏览器将清除页面（删除不安全的部分）。
+ `1;mode=block`：启用XSS过滤。 如果检测到攻击，浏览器将不会清除页面，而是阻止页面加载。
+ `1; report=<reporting-URI>`： Chromium only，启用XSS过滤。 如果检测到跨站脚本攻击，浏览器将清除页面并使用CSP report-uri (en-US)指令的功能发送违规报告。

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | false |
| value | string | X-XSS-Protection 配置 | `1; mode=block` |

