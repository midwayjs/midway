# 跨域

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用跨域组件，支持 `cors` 、`jsonp` 多种模式。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/cross-domain --save
```

## 引入组件

在 `src/configuration.ts` 中引入组件。

```typescript
import * as crossDomain from '@midwayjs/cross-domain';
@Configuration({
  imports: [
    // ...other components
    crossDomain
  ],
})
export class MainConfiguration {}
```



## 什么是跨域

假设有两个网站：

- **A.com**：这是你的网站，你想要从这里访问一些资源。
- **B.com**：这是另一个网站，它拥有你想要访问的资源。

### 场景设定

1. **A.com** 是你的主网站，你在这里运行一些 JavaScript 代码。
2. **B.com** 拥有一些 API 接口，你想要通过 A.com 的 JavaScript 代码来调用这些 API 接口。

由于同源策略，浏览器默认不允许 A.com 的 JavaScript 代码直接访问 B.com 的资源。这是因为浏览器出于安全考虑，防止恶意网站读取其他网站的敏感数据。你想要在 A.com 上运行的 JavaScript 代码中发起一个请求到 B.com 的 API 接口，这个请求会被视为跨域请求。

简单来说，从 A.com 访问 B.com 的接口，就是跨域。

此外，跨域还有一些条件：

* 1、同源策略是浏览器安全机制的一部分，所以一般只有浏览器访问才有跨域问题
* 2、当浏览器发起跨域请求时，它会根据当前源自动添加一个 `Origin` 头部到请求中，服务端也会根据 `origin` 头判断来源，进而做处理

所以，当你发现跨域设置不生效时，请检查：

* 1、是否真的是跨域请求
* 2、是否真的从浏览器发起
* 3、是否请求带有 `origin` 头



## 什么是 CORS

在前端代码调用后端服务中经常会碰到下面的错误，这就最为常见的跨域 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 错误。

```
Access to fetch at 'http://127.0.0.1:7002/' from origin 'http://127.0.0.1:7001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

出于安全性，浏览器限制脚本内发起的跨源 HTTP 请求。例如，`XMLHttpRequest` 和 [Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 遵循[同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)。这意味着使用这些 API 的 Web 应用程序只能从加载应用程序的同一个域请求 HTTP 资源，除非响应报文包含了正确 CORS 响应头。

CORS 机制允许 Web 应用服务器进行跨源访问控制，从而使跨源数据传输得以安全进行。现代浏览器支持在 API 容器中（例如 [`XMLHttpRequest`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest) 或 [Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)）使用 CORS，以降低跨源 HTTP 请求所带来的风险。



## 常见的 CORS 配置

下面列举几种跨域的解决方案，我们以 `fetch` 方法为例。

### 未使用 `credentials` 

客户端。

```javascript
fetch(url);
```

服务端配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  cors: {
    origin: '*',
  },
}
```

### 使用 `credentials`

客户端。

```javascript
fetch(url, {
  credentials: "include",
});
```

服务端配置

```typescript
// src/config/config.default.ts
export default {
  // ...
  cors: {
    credentials: true,
  },
}
```

### 限制 `origin` 来源

假如我们的网页地址为 `http://127.0.0.1:7001` 而接口为 `http://127.0.0.1:7002`。

客户端。

```javascript
fetch('http://127.0.0.1:7002/', {
  credentials: 'include'
})
```

服务端配置，注意，由于启用了 `credentials`，这个时候 `origin` 字段不能为 `*`。

```typescript
// src/config/config.default.ts
export default {
  // ...
  cors: {
    origin: 'http://127.0.0.1:7001',
    credentials: true,
  },
}
```



## 更多 CORS 配置

完整可用配置如下：

```typescript
export const cors = {
  // 允许跨域的方法，【默认值】为 GET,HEAD,PUT,POST,DELETE,PATCH
  allowMethods: string |string[];
  // 设置 Access-Control-Allow-Origin 的值，【默认值】会获取请求头上的 origin
  // 也可以配置为一个回调方法，传入的参数为 request，需要返回 origin 值
  // 例如：http://test.midwayjs.org
  // 如果设置了 credentials，则 origin 不能设置为 *
  origin: string|Function;
  // 设置 Access-Control-Allow-Headers 的值，【默认值】会获取请求头上的 Access-Control-Request-Headers
  allowHeaders: string |string[];
  // 设置 Access-Control-Expose-Headers 的值
  exposeHeaders: string |string[];
  // 设置 Access-Control-Allow-Credentials，【默认值】false
   // 也可以配置为一个回调方法，传入的参数为 request，返回值为 true 或 false
  credentials: boolean|Function;
  // 是否在执行报错的时候，把跨域的 header 信息写入到 error 对的 headers 属性中，【默认值】false
  keepHeadersOnError: boolean;
  // 设置 Access-Control-Max-Age
  maxAge: number;
}
```


## JSONP 配置

可以在 `src/config/config.default` 中进行 JSONP 配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  jsonp: {
    callback: 'jsonp',
    limit: 512,
  },
}
```
