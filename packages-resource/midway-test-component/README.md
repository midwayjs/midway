midway 测试组件

包含路由，定时任务等。

使用方式

```bash
$ npm i midway-test-component --save
```

然后配置

```ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as test from 'midway-test-component';

@Configuration({
  imports: [
    test
  ]
})
export class ContainerConfiguration implements ILifeCycle {
  async onReady(): Promise<void> {
  }
}
```

效果

- 1、路由访问 /test/hello，会输出 {data: 'hello world', query: {}}
- 2、控制台会输出定时任务的字符串