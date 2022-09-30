# Security 安全组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用安全组件，支持 `csrf` 、`xss` 等多种安全策略。

## 安装使用

1. 安装依赖
```shell
tnpm i @midwayjs/security --save
```
2. 在 configuration 中引入组件,
```ts
import * as Security from '@midwayjs/security';
@Configuration({
  imports: [
    // ...other components
    Security
  ],
})
export class AutoConfiguration {}
```



## 配置
```ts
// 默认配置
export const security = {
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
}
```

### csrf

| 配置项 | 类型 | 作用描述 | 默认值 |
| --- | --- | --- | --- |
| enable | boolean | 是否开启 | true |
| type | 'all' / 'any' / 'ctoken' / 'referer' | csrf 校验类型，all/any 等于 ctoken + referer | 'ctoken' 从query/header/body 中获取 csrf token；'referer' 则可以通过 refererWhiteList 配置白名单 |
| useSession | boolean | csrf token 是否存放在 session 中 | false，默认存放在 cookies 中 |
| cookieName | string | token 在 cookie 中存放的 字段 | 'csrfToken' |
| sessionName | string | token 在 session 中存放的 字段 | 'csrfToken' |
| headerName | string | token 在 header 中存放的 字段 | 'x-csrf-token' |
| bodyName | string | token 在 body 中存放的 字段 | '_csrf' |
| queryName | string | token 在 query 中存放的 字段 | '_csrf' |
| refererWhiteList | Array<string> | 允许的来源白名单 | [] |

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

用于指定 `IE 8` 以上版本的用户不打开文件而直接保存文件。在下载对话框中不显示“打开”选项。

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


