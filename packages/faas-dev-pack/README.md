# Midway FaaS Dev

本模块用于 faas 代码的本地调试，用于接入现有的前端 DevServer，提供一个统一的中间件调用。


## Usage

```ts
import { useExpressDevPack } from '@midwayjs/faas-dev-pack';

// dev server 代码
app = express();

// 加载中间件
app.use(
  useExpressDevPack({
    functionDir: join(__dirname, './fixtures/ice-demo-repo'),
    sourceDir: 'src/apis',
  })
);
```

## API

暴露出两个中间件方法，用于上层集成。

- `useExpressDevPack(options: DevOptions)`
- `useKoaDevPack(options: DevOptions)`

DevOptions

```ts
export interface DevOptions {
  functionDir: string; // 本地目录，默认 process.cwd()
  sourceDir?: string; // 一体化调用时，需要知道当前的函数目录结构
}
```

