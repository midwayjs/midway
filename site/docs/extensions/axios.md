# HTTP 请求



## 简单的 HTTP 请求

Midway 内置了一个简单的 HTTP 请求客户端，无需引入三方包即可使用。

默认 Get 请求，返回数据为 Buffer。

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/');

// Buffer.isBuffer(result.data)  => true
```

Get 请求，带上 Query，返回类型为 JSON。

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/', {
  data: {
    a: 1,
    b: 2
  },
  dataType: 'json',
});

// typeof result.data => 'object'
// result.data.url => /?a=1&b=2
```

可以可以指定类型

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/', {
  method: 'GET',
  dataType: 'json',
});
```

返回 text 格式。

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/', {
  method: 'GET',
  dataType: 'text',
});
```

POST 请求并返回 JSON。

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/', {
  method: 'POST',
  data: {
    a: 1,
    b: 2
  },
  dataType: 'json',
});

// result.data ...
```

设置请求超时时间。

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();

let err;
// 超时会报错，注意 catch
try {
  const result = await httpclient.request('http://127.1:7001/', {
    method: 'GET',
    dataType: 'text',
    timeout: 500,
  });
} catch (e) {
  err = e;
}
```

:::tip

内置的 Http 客户端只提供最简单的能力，如需复杂的功能（前后拦截或是其他额外的配置），请使用 axios。

:::



## Axios 支持

Midway 包裹了 [axios](https://github.com/axios/axios) 包，使得在代码中可以简单的使用 axios 接口。

和 axios 的一些关系如下：

- 接口完全一致
- 适配依赖注入写法，完整的类型定义
- 方便框架串联依赖链路，排查问题

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |




### 安装依赖

```bash
$ npm i @midwayjs/axios@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/axios": "^3.0.0",
    // ...
  },
}
```



### 引入组件


首先，引入 组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as axios from '@midwayjs/axios';
import { join } from 'path'

@Configuration({
  imports: [
    axios		// 导入 axios 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerLifeCycle {
}
```

然后在业务代码中即可注入使用。


### 使用服务


接口和 [axios](https://github.com/axios/axios) 一致。


```typescript
axios.request(config)
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])
```


使用示例：
```typescript
import { HttpService } from '@midwayjs/axios';

@Provide()
export class UserService {

  @Inject()
  httpService: HttpService;

  async invoke() {
  	const url = 'http://www.weather.com.cn/data/cityinfo/101010100.html';
    const result = await this.httpService.get(url);
    // TODO resut
  }
}
```


### 配置 Axios


HttpService 实例等价于 `axios.create` ，所以可以有一些配置参数，我们可以在 `src/config.default.ts` 中配置它，配置完之后，全局的 axios 都会生效。


比如：
```typescript
export default {
  // ...
  axios: {
    baseURL: 'https://api.example.com',
    // `headers` are custom headers to be sent
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 1000, // default is `0` (no timeout)

    // `withCredentials` indicates whether or not cross-site Access-Control requests
    // should be made using credentials
    withCredentials: false, // default
  }
}
```
具体的参数可以参考 [axios global config](https://github.com/axios/axios#config-defaults)。


### 配置全局拦截器
```javascript
import { Configuration } from '@midwayjs/decorator';
import * as axios from '@midwayjs/axios';
import { join } from 'path';
import { IMidwayContainer } from '@midwayjs/core';

@Configuration({
  imports: [
    axios		// 导入 axios 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerLifeCycle {

  async onReady(container: IMidwayContainer) {
  	const httpService = await container.getAsync(axios.HttpService);
    httpService.interceptors.request.use(
      config => {
        // Do something before request is sent
        return config;
      },
      error => {
        // Do something with request error
        return Promise.reject(error);
      }
    );
  }
}
```
