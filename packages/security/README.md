## Security 安全组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用安全组件，支持 `csrf` 、`xss` 等多种安全策略。

### Usage

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



### 配置
```ts
export const security = {
  
}
```