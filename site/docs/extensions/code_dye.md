# 代码染色

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的代码染色组件。

用于在 HTTP 场景展示调用链路耗时与各个方法的出入参，帮你更快地定位代码问题。

比如：

+ 代码执行缓慢
  - 不知道是哪一个方法执行的慢：通过代码染色后，可以查看每一个 `方法的执行时长`。
+ 代码执行错误
  - 可能是方法没有调到：通过代码染色后，可以查看每一个 `方法的调用链`。
  - 可能是方法调用参数出错：通过代码染色后，查看每一个`方法的入参和返回值`

使用效果：

![](https://gw.alicdn.com/imgextra/i1/O1CN017Zd6y628M2PvqJO7I_!!6000000007917-2-tps-2392-844.png)




相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/code-dye@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/code-dye": "^3.0.0"
    // ...
  },
}
```



## 启用组件

将 code-dye 组件配置到代码中。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as codeDye from '@midwayjs/code-dye';

@Configuration({
  imports: [
    // ...
    {
      component: codeDye,
      enabledEnvironment: ['local'],	// 只在本地启用
    }
  ],
})
export class MainConfiguration {}
```





:::tip

- 可以在 `本地` 或 `研发` 环境开启本组件，便于开发时定位问题，但是 `不建议` 在线上启用，会对线上访问性能产生影响。

:::



## 配置染色

可以通过`matchQueryKey` 配置，控制当 `query` 参数包含`matchQueryKey` 配置对应的值的时候，进入染色链路，例如，配置为：

```typescript
// src/config/config.local.ts
export default {
  codeDye: {
    matchQueryKey: 'codeDyeABC',
  }
}
```
当请求接口 `http://127.0.0.1:7001/test?codeDyeABC=html` 时，就会判断 `query` 中是否存在 `codeDyeABC` 参数来决定是否染色，并根据参数对应的值，来响应不同的染色结果。

也可以通过`matchHeaderKey` 配置，控制当 `headers` 参数包含 `matchHeaderKey` 配置对应的值的时候，进入染色链路，例如，配置为：

```typescript
// src/config/config.local.ts
export default {
  codeDye: {
    matchHeaderKey: 'codeDyeHeader',
  }
}
```
当请求接口 `http://127.0.0.1:7001/test` 时，就会判断请求的 `headers` 中是否存在 `codeDyeHeader` 参数来决定是否染色，并根据参数对应的值，来响应不同的染色结果。



## 染色报告

开启了代码染色后，链路染色的结果，可以通过开启染色的不同参数值来配置，目前支持以下三种：

+ `html`：`对` 当前请求的结果进行处理，将染色信息添加到结果中，响应为 `html`，可以在浏览器上查看，效果可以查看此文档上面的图片效果展示。
+ `json`：`对` 当前请求的结果进行处理，将染色信息添加到结果中，响应为 `json` 结构化信息。
+ `log`：`不对` 当前请求的结果进行处理，染色的信息将会输出到日志中，不影响请求。

例如，配置为：

```typescript
// src/config/config.local.ts
export default {
  codeDye: {
    matchQueryKey: 'codeDyeXXX',
  }
}
```

当请求接口 `http://127.0.0.1:7001/test?codeDyeXXX=html` 时，就会判断 `query` 中 `codeDyeXXX` 参数的值为 `html`，就将染色结果输出在当前请求的响应中，并且内容为 `html` 格式。
