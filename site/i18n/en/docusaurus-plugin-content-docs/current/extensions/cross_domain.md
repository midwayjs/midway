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

Introducing components in `src/configuration.ts`,

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


## CORS configuration

CORS configuration can be performed in `src/config/config.default`.

```typescript
// src/config/config.default.ts
export default {
  // ...
  cors: {
    credentials: false,
  },
}
```

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
