## Code-Dye 代码染色组件

Code dye components are applicable to `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa`, and `@midwayjs/express` frameworks.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |


### Scenes that can be used

Clearly show the time-consuming of calling links and the parameters of each method to help you locate code problems faster.。

+ Code execution is slow
  - When you don't know which method is slow to execute: after dyeing with code, you can check the `execution duration of each method`。
+ Code execution error
  - It may be that the method is not tuned: after dyeing with the code, you can view every `call chain' of the method`。
  - It may be that there is an error in the method call parameter: after dyeing through the code, view each `input parameter and return value' of the method`


### Effect
![](https://gw.alicdn.com/imgextra/i1/O1CN017Zd6y628M2PvqJO7I_!!6000000007917-2-tps-2392-844.png)

### Install

1. Installation dependency

```bash
$ npm i @midwayjs/code-dye --save
```

2. Introduce components into configuration

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as codeDye from '@midwayjs/code-dye';
@Configuration({
  imports: [
    // ...
    {
      component: codeDye,
      enabledEnvironment: ['local'],	// Enabled locally only
    }
  ],
})
export class MainConfiguration {}
```

### configuration

:::tip

- You can enable this component in the `local` or `development` environment, which is convenient for locating problems during development, but it is `not recommended` to enable it online, which will affect the performance of online access.

:::

#### Enable coloring

You can use `matchQueryKey` configuration to control when the `query` parameter contains the value corresponding to `matchQueryKey` configuration, to enter the dye link, for example, the configuration is:

```typescript
// src/config/config.local.ts
export default {
   codeDye: {
     matchQueryKey: 'codeDyeABC',
   }
}
```
When requesting the interface `http://127.0.0.1:7001/test?codeDyeABC=html`, it will judge whether `codeDyeABC` parameter exists in `query` to decide whether to dye or not, and respond differently according to the corresponding value of the parameter the staining results.

You can also use the `matchHeaderKey` configuration to control when the `headers` parameter contains the value corresponding to the `matchHeaderKey` configuration, to enter the dye link. For example, the configuration is:

```typescript
// src/config/config.local.ts
export default {
   codeDye: {
     matchHeaderKey: 'codeDyeHeader',
   }
}
```
When requesting the interface `http://127.0.0.1:7001/test`, it will judge whether there is a `codeDyeHeader` parameter in the `headers` of the request to decide whether to dye, and respond to different dyeing according to the corresponding value of the parameter result.


#### Dyeing results

After code coloring is enabled, the result of link coloring can be configured by enabling different parameter values for coloring. Currently, the following three types are supported:

+ `html`: `process` the result of the current request, add the coloring information to the result, and the response is `html`, which can be viewed on the browser, and the effect can be viewed in the picture above this document.
+ `json`: `process` the result of the current request, add coloring information to the result, and respond as `json` structured information.
+ `log`: `Do not process` the result of the current request, and the dyed information will be output to the log without affecting the request.

For example, configured as:

```typescript
// src/config/config.local.ts
export default {
   codeDye: {
     matchQueryKey: 'codeDyeXXX',
   }
}
```

When the interface `http://127.0.0.1:7001/test?codeDyeXXX=html` is requested, it will be judged that the `codeDyeXXX` parameter value in `query` is `html`, and the dyeing result will be output in the response of the current request , and the content is in `html` format.