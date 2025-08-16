# Security

It is a common security component applicable to multiple frameworks such as `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa`, and `@midwayjs/express`. It supports multiple security policies such as `csrf` and `xss`.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |



## Installation and use

1. Installation Dependence

```bash
$ npm i @midwayjs/security --save
```

Or reinstall the following dependencies in `package.json`.

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



2. Introduce components into the configuration

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

## Prevent common security threats


### I. CSRF

CSRF(Cross-site request forgery Cross-site Request Forgery) is an attack method that captive users to perform unintended operations on currently logged-in Web applications.


#### 1. Token synchronization mode
Render the token to the page when you respond to the page. After you enable the `csrf` configuration, you can obtain the `csrf token` by using `ctx.csrf`. Then, you can synchronize the output when you return to page html.

```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    return '<form method="POST" action="/upload?_csrf=${ this.ctx.csrf }">
      title: <input name="title" />
      <button type="submit">upload</button>
    </form>';
  }
}
```

The `_csrf` field in the preceding example can be changed in the configuration. For more information, see `Configuration-> csrf`.



#### 2. Cookies mode

If CSRF is configured by default, the token is set in the Cookie. You can use JS to obtain the token from the Cookies on the frontend page, and then add the ajax/fetch requests to the `header`, `query`, or `body`.

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

By default, the framework contains the `CSRF token` in the `Cookie` file, which is easy to obtain when the front-end JS sends a request. However, cookies can be set for all subdomain names. Therefore, when our application cannot guarantee that all subdomain names are controlled, it may be at risk of being attacked by `CSRF` when stored in `cookies`. The framework provides a configuration item `useSession` to store token in the Session.


When the `CSRF token` is stored in a `Cookie`, if a user switch occurs in the same browser, the new user will still use the old token (previously used by the user). This will bring certain security risks. Therefore, you must call `ctx.rotateCsrfSecret()` to refresh the `CSRF token` every time you log in. For example:


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

### II. XSS

`XSS` (cross-site scripting cross-site scripting attack) attack is the most common Web attack and is a kind of code injection. It allows malicious users to inject code into the web page, and other users will be affected when watching the web page.

`XSS` attack usually refers to injecting malicious instruction code into a web page by exploiting vulnerabilities left during web page development, so that users can load and execute malicious web page programs created by attackers. After the attack is successful, the attacker may be given higher permissions (such as performing some operations), private web content, sessions, cookies and other content.


#### 1. Reflective XSS attack

The server receives insecure input from the client and triggers code execution on the client to initiate a `Web` attack.

For example, when searching for a search website, the search results will display the search keywords. Enter `<script>alert('xss')</script>` in the search for keywords. After you click Search, if the page program does not handle the keywords, the code is directly executed on the page, and alert is displayed.

The framework provides the `ctx.security.escape()` method for XSS filtering of strings.

```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    const str = '<script>alert('xss')</script>';
    const escapedStr = this.ctx.security.escape(str);
    // <script>alert(&quot;xss&quot;) </script>
    return escapedStr;
  }
}
```

In addition, when the content output by the website is used as a js script. `ctx.security.js()` is needed to filter at this time.

In another case, you need to output `json` in `js`. If you do not escape the json, it is easily exploited as a `XSS` vulnerability. The framework provides `ctx.security.json (variable)` to provide json encode to prevent XSS attacks.


```ts
@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/home')
  async home() {
    return '<script>windows.config = ${this.ctx.security.json( ...variable )};</script>';
  }
}
```

#### 2. Storage-type XSS attacks.

By submitting content with malicious scripts and storing it on the server, a Web attack is launched when others see the content. For example, in the comment box of some websites, the user maliciously uses some code as the comment content. If there is no filtering, the malicious code will be executed when other users see the comment.


The framework provides `ctx.security.html()` for filtering.


#### 3. Other XSS prevention methods

The browser itself has a certain ability to prevent various attacks, and they usually take effect by opening the Web security header. The framework has built-in support for some common Web security headers.

**CSP**

`Content Security Policy`, referred to as `CSP`, is used to define which resources can be loaded on a page to reduce the occurrence of `XSS`.

This function is disabled by default, which can be enabled by the `csp: {enable: true}` configuration. This function can effectively prevent `XSS` attacks. To configure `CSP`, you must understand the `policy` policy of `CSP`. For more information, see [What is the CSP?](https://www.zhihu.com/question/21979782/answer/122682029)


**X-Download-Options:noopen**

This feature is enabled by default. You can use the `noopen: {enable: false}` configuration to disable the Open button in the download box under IE to prevent files downloaded under IE from being enabled by default.

**X-Content-Type-Options:nosniff**
The IE8 automatic sniffing mime function is disabled and turned off by default (it can be configured by `nosniff: {enable: true}` ). For example, text/plain is rendered as text/html, especially when the content of serve on this site is not necessarily trusted.

**X-XSS-Protection**
Some XSS detection and prevention provided by IE, enabled by default (can be disabled by `xssProtection: {enable: false}` configuration)

The default value of close is false, that is, set to 1; mode = block

---


## Configuration

The default configuration is as follows:

```ts
// src/config/config.default
export default {
  // ...

  // default configuration
  security: {
    csrf: {
      enable: true
      type: 'ctoken',
      useSession: false
      cookieName: 'csrfToken',
      sessionName: 'csrfToken',
      headerName: 'x-csrf-token',
      bodyName: '_csrf',
      queryName: '_csrf',
      refererWhiteList: []
    },
    xframe: {
      enable: true
      value: 'SAMEORIGIN',
    },
    csp: {
      enable: false
    },
    hsts: {
      enable: false
      maxAge: 365*24*3600
      includeSubdomains: false
    },
    noopen: {
      enable: false
    },
    nosniff: {
      enable: false
    },
    xssProtection: {
      enable: true
      value: '1; mode=block',
    },
  },
}

```

### csrf

| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | true |
| type | 'all' / 'any' / 'ctoken' / 'referer' | Csrf check type, all/any equals ctoken + referer | 'ctoken' gets csrf token from query/header/body;;'referer' can configure the whitelist by refererWhiteList |
| useSession | boolean | Is CSRF token stored in session | False, stored in cookies by default |
| cookieName | string | The field where the token is stored in the cookie. | 'csrfToken' |
| sessionName | string | The field where the token is stored in the session | 'csrfToken' |
| headerName | string | The field where the token is stored in the header. | 'x-csrf-token' |
| bodyName | string | The field where the token is stored in the body. | '_csrf' |
| queryName | string | The field where the token is stored in the query. | '_csrf' |
| refererWhiteList | Array<string\> | White list of allowed sources | [] |

#### Does the configuration refererWhiteList not take effect?
+ Reason 1: You need to configure the host part of the referer in the refererWhiteList. For example, if the referer is `https:// midway-demo.com:1234/docs`, you need to configure `midway-demo.com:1234` in the refererWhiteList.
+ Reason 2: The refererWhiteList takes effect only when the type is `referer` in the csrf configuration. The default type is `ctoken` and needs to be changed to `referer`.
+ Reason 3: The referer field in the sent http request is not a standard url address (for example, no request protocol is added). Refer to [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referer)

### xframe


Xframe is used to configure the `X-Frame-Options` response header to indicate whether a page can be displayed in `frame`, `iframe`, `embed`, or `object`. Sites can avoid `clickjacking` attacks by ensuring that websites are not embedded in other people's sites.

There are three possible values for `X-Frame-Options`:

+ X-Frame-Options: deny: The page is not allowed to be displayed in frame.
+ X-Frame-Options: sameorigin: This page can be displayed in the frame of the same domain name page.
+ X-Frame-Options: allow-from https://example.com/:该页面可以在指定来源的frame中展示



| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | true |
| value | string | X-Frame-Options value | 'SAMEORIGIN' |



### hsts

`HTTP Strict Transport Security` (commonly referred to as `HSTS`) is a security feature that tells browsers that they can only access current resources through `HTTPS`, not `HTTP`.

| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | false |
| maxAge | number | In the `seconds` after the browser receives this request, all requests that access this domain name use HTTPS requests. | `365*24*3600` is one year |
| includeSubdomains | boolean | Does this rule apply to all subdomains of this website | false |


### csp

`Content-Security-Policy` of HTTP response header allows site managers to control which resources are loaded on a specified page. This will help prevent cross-site scripting attacks (XSS).


| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | false |
| policy | Object<key: string, value: string / string[]/ boolean> | Policy list | {} |
| reportOnly | boolean | Whether to open | false |
| supportIE | boolean | Does IE browser support | false |

For detailed `policy` configuration, please refer to: [What is the Content Security Policy (CSP)? Ali gathering is safe ](https://www.zhihu.com/question/21979782/answer/122682029)


### noopen

It is used to specify that users of `IE 8` or higher can save files without opening files. The "Open" option is not explicitly displayed in the download dialog box.

| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | false |




### nosniff

When turned on, if the `MIME` type of a file read from `script` or `stylesheet` does not match the specified `MIME` type, the file is not allowed to be read. It is used to prevent cross-site scripting attacks such as `XSS`.

| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | false |




### xssProtection

Enable the XSS filtering feature of the browser to prevent cross-site scripting attacks by `XSS`.

The `X-XSS-Protection` response header is a feature of `IE`, `Chrome` and `Safari`. When a cross-site scripting attack (XSS (en-US)) is detected, the browser will stop loading the page. If the website is set up with a good `Content-Security-Policy` to disable inline JavaScript ('unsafe-inline '), modern browsers do not need these protections, but it can still provide protection for users of older browsers that do not yet support `CSP`.

`X-XSS-Protection` the following four values can be configured

+ `0`: XSS filtering is prohibited.
+ `1`: Enable XSS filtering (usually the browser is the default).  If a cross-site scripting attack is detected, the browser will clear the page (delete the unsafe part).
+ `1;mode = block`: enables XSS filtering.  If an attack is detected, the browser will not clear the page, but will prevent the page from loading.
+ `1; report =<reporting-URI>`: Chromium only to enable XSS filtering.  If a cross-site scripting attack is detected, the browser will clear the page and send a violation report using the function of the CSP report-uri (en-US) instruction.

| Configuration Item | Type | Description of action | Default |
| --- | --- | --- | --- |
| enable | boolean | Whether to open | false |
| value | string | X-XSS-Protection configuration | `1; mode=block` |

