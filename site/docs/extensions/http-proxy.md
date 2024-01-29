# HTTP 代理

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的 HTTP 请求代理组件，支持 GET、POST 等多种请求方法。

相关信息：

| web 支持情况      |     |
| ----------------- | --- |
| @midwayjs/koa     | ✅  |
| @midwayjs/faas    | 💬 |
| @midwayjs/web     | ✅  |
| @midwayjs/express | ✅  |

:::caution

💬 部分函数计算平台不支持流式请求响应，请参考对应平台能力。

:::



## 安装依赖

```bash
$ npm i @midwayjs/http-proxy@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/http-proxy": "^3.0.0"
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## 启用组件

在 `src/configuration.ts` 中引入组件

```typescript
// ...
import * as proxy from '@midwayjs/http-proxy';

@Configuration({
  imports: [
    // ...other components
    proxy,
  ],
})
export class MainConfiguration {}
```

## 配置

代理配置定义如下：

```typescript
// 代理配置类型
export interface HttpProxyConfig {
  // 匹配要代理的 URL 正则表达式
  match: RegExp;
  // 替换匹配到的链接的 host，将请求代理到此地址
  host?: string;
  // 通过正则的表达式捕获组处理代理地址
  target?: string;
  // 转发请求超时时间，默认为0不设置超时时间
  proxyTimeout?: number;
  // 忽略代理请求转发的 header 中的字段
  ignoreHeaders?: {
    [key: string]: boolean;
  };
}
```

代理支持单个代理和多个代理。

单个代理配置

```typescript
// src/config/config.default.ts

export default {
  httpProxy: {
    match: /\/tfs\//,
    host: 'https://gw.alicdn.com',
  },
};
```

多个代理配置

```typescript
// src/config/config.default.ts

// 代理配置类型
export default {
  httpProxy: {
    default: {
      // 一些每个策略复用的值，会和底下的策略进行合并
    },
    strategy: {
      gw: {
        // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
        match: /\/tfs\//,
        host: 'https://gw.alicdn.com',
      },
      g: {
        // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
        match: /\/bdimg\/(.*)$/,
        target: 'https://sm.bdimg.com/$1',
      },
      httpBin: {
        // https://httpbin.org/
        match: /\/httpbin\/(.*)$/,
        target: 'https://httpbin.org/$1',
      },
    },
  },
};
```

## 示例：使用 host 配置代理

```typescript
export default {
  httpProxy: {
    match: /\/tfs\//,
    host: 'https://gw.alicdn.com',
  },
};
```

当请求您的站点路径为： `https://yourdomain.com/tfs/test.png` 时，`match` 字段配置的正则表达式成功匹配，那么就将原始请求路径中的 `host` 部分 `https://yourdomain.com` 替换为配置的 `https://gw.alicdn.com`，从而发起代理请求到 `https://gw.alicdn.com/tfs/test.png`，并把响应结果返回给请求您站点的用户。

## 示例：使用 target 配置代理

```typescript
export default {
  httpProxy: {
    match: /\/httpbin\/(.*)$/,
    target: 'https://httpbin.org/$1',
  },
};
```

当请求您的站点路径为： `https://yourdomain.com/httpbin/get?name=midway` 时，`match` 字段配置的正则表达式成功匹配，同时正则的捕获组中有结果 `['get?name=midway']` ，那么就将原始请求路径中的 `$1` 部分替换为捕获组中的第 1 个数据（index: 0）的 `get?name=midway`，从而发起代理请求到 `https://httpbin.org/get?name=midway`，并把响应结果返回给请求您站点的用户。
