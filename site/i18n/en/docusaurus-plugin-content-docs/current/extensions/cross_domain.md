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


| config | value type | default value | description | example |
| --- | --- | --- | --- | --- |
| allowMethods | `string` 、`string[]` | `GET,HEAD,PUT,POST,DELETE,PATCH` | allowCrossDomainMethods | `GET,POST`、`['GET', 'POST']` |
| origin | `string` 、`(request) => string` | Automatically get the on the request Headers `origin` attribute | Set `Access-Control-Allow-Origin` value | `http://test.midwayjs.org`、`*` |
| allowHeaders | `string` 、`string[]`| Automatically get the on the request Headers `Access-Control-Request-Headers` attribute |  Set `Access-Control-Allow-Headers` value | `Content-Type` |
| exposeHeaders | `string` 、`string[]`| - |  Set `Access-Control-Expose-Headers` value |  |
| credentials | `string` 、`(request) => boolean`| `false` |  Set `Access-Control-Allow-Credentials` value | `true` |
| maxAge | `number`| - |  value `Access-Control-Max-Age` Value | |
| keepHeadersOnError | `boolean`| `false` |  Whether to write cross-domain header information to the error pair's headers attribute when executing an error | `true` |


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


## JSONP
### Usage
When the cross_domain component is introduced in `configuration.ts`, within the scope of the request, the `ctx.jsonp` method can be called directly to package the response data.

The `jsonp` method will be based on the configured callback attribute (the default is `jsonp`, that is, `? Jsonp = xxx123`), get the method name of the callback from the requested query[callback] (if not, the default is `callback`).

The default jsonp configuration in the `config` file can be overridden by the second parameter of the jsonp method.

```typescript

@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Get('/ctx-jsonp')
  async ctxJsonp() {
    return this.ctx.jsonp({ test: 456 }, { callback: 'callback' });
  }
}
```

### Config

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

The available configurations are as follows:

| config | value type | default value | description | example |
| --- | --- | --- | --- | --- |
| callback | `string` | `jsonp` | Set the query key to get the callback method name of JSONP. | `?jsonp=callback` |
| limit | `number` | `512` | Sets the maximum length of the callback method name | `512` |
| csrf | `boolean`| `false` | After the csrf security option of the security component is turned on, whether to verify the csrf of jsonp | `true` |
