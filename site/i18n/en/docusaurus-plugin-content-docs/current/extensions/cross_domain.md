# Cross-domain

Common cross-domain components are applicable to `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa`, and `@midwayjs/express` frameworks, and support multiple modes of `cors` and `jsonp`.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |



## Installation dependency

```bash
$ npm i @midwayjs/cross-domain --save
```

## Introducing components

Introducing components in `src/configuration.ts`.

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



## What is CORS

The following errors are often encountered when front-end code calls back-end services. This is the most common cross-domain [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) error. .

```
Access to fetch at 'http://127.0.0.1:7002/' from origin 'http://127.0.0.1:7001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

For security reasons, browsers restrict cross-origin HTTP requests made within scripts. For example, `XMLHttpRequest` and [Fetch API](https://developer.mozilla.org/en-CN/docs/Web/API/Fetch_API) follow the [Same Origin Policy](https://developer.mozilla.org/ en-CN/docs/Web/Security/Same-origin_policy). This means that web applications using these APIs can only request HTTP resources from the same domain where the application is loaded unless the response message contains the correct CORS response headers.

The CORS mechanism allows web application servers to perform cross-origin access control so that cross-origin data transmission can be carried out securely. Modern browsers support this in API containers such as [`XMLHttpRequest`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest) or [Fetch](https://developer.mozilla .org/zh-CN/docs/Web/API/Fetch_API)) uses CORS to reduce the risks caused by cross-origin HTTP requests.



## Common CORS configurations

Below are several cross-domain solutions. Let’s take the `fetch` method as an example.

### `credentials` not used

client.

```javascript
fetch(url);
```

Server configuration.

```typescript
// src/config/config.default.ts
export default {
   // ...
   cors: {
     origin: '*',
   },
}
```

### Using `credentials`

client.

```javascript
fetch(url, {
   credentials: "include",
});
```

Server configuration

```typescript
// src/config/config.default.ts
export default {
   // ...
   cors: {
     credentials: true,
   },
}
```

### Limit `origin` 

Suppose our web page address is `http://127.0.0.1:7001` and the interface is `http://127.0.0.1:7002`.

client.

```javascript
fetch('http://127.0.0.1:7002/', {
   credentials: 'include'
})
```

Server configuration, please note that since `credentials` is enabled, the `origin` field cannot be `*` at this time.

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



## More CORS configuration

The available configurations are as follows:

```typescript
export const cors = {
	// Allow cross-domain methods, [default value] is GET, HEAD, PUT, POST, DELETE, PATCH
  allowMethods: string |string[];
  // Set the value of Access-Control-Allow-Origin, and [Default] will get the origin on the request header
  // It can also be configured as a callback method. The input parameter is request and the origin value needs to be returned.
  // For example: http://test.midwayjs.org
  // If credentials is set, origin cannot be set *
  origin: string|Function;
  // Set the value of Access-Control-Allow-Headers, [Default] will get Access-Control-Request-Headers on the request head
  allowHeaders: string |string[];
  // Set the value of Access-Control-Expose-Headers
  exposeHeaders: string |string[];
  // Set Access-Control-Allow-Credentials, [Default] false
   // It can also be configured as a callback method. The input parameter is request and the return value is true or false.
  credentials: boolean|Function;
  // Whether to write cross-domain header information to the headers attribute of the error pair when an error is reported, [default value] false
  keepHeadersOnError: boolean;
	// set Access-Control-Max-Age
  maxAge: number;
}
```


## JSONP configuration

JSONP can be configured in `src/config/config.default`.

```typescript
// src/config/config.default.ts
export default {
  // ...
  jsonp: {
    callback: 'jsonp',
    limit: 512
  },
}
```
