## Code-Dye 代码染色组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的代码染色组件，清晰的展示调用链路耗时与各个方法的出入参，帮你更快地定位代码问题。
![](https://gw.alicdn.com/imgextra/i1/O1CN017Zd6y628M2PvqJO7I_!!6000000007917-2-tps-2392-844.png)
### Usage

1. 安装依赖
```shell
tnpm i @midwayjs/code-dye --save
```
2. 在 configuration 中引入组件,
```ts
import * as codeDye from '@midwayjs/code-dye';
@Configuration({
  imports: [
    // ...other components
    codeDye
  ],
})
export class AutoConfiguration {}
```

3. 请求你的接口，添加配置的 header 或 query 进入染色链路

例如，配置为：
```ts
// src/config/config.default.ts
export const codeDye = {
  matchQueryKey: 'codeDyeABC',
}
```
然后请求你的接口，例如：http://127.0.0.1:7001/test?codeDyeABC=html

### 配置
```ts
export const codeDye = {
  // 是否启用
  enable: boolean;
  // 匹配到对应的 header key时，进行代码染色，值可以为 html、json、log
  matchHeaderKey: string;
  // 匹配到对应的 query key时，进行代码染色
  // 例如 http://127.0.0.1:7001/test?codeDye=html
  matchQueryKey: string;
}
```
