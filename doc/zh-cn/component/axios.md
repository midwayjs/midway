# HTTP 请求（Axios）

midway 包裹了 [axios](https://github.com/axios/axios) 包，使得在代码中可以简单的使用 axios 接口。

和 axios 的一些关系如下：

- 接口完全一致
- 适配依赖注入写法，完整的类型定义
- 方便框架串联依赖链路，排查问题


## 安装依赖

```bash
$ npm i @midwayjs/axios@3 --save
```


## 引入组件


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


## 使用服务


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


## 配置 Axios


HttpService 实例等价于 `axios.create` ，所以可以有一些配置参数，我们可以在 `src/config.default.ts` 中配置它，配置完之后，全局的 axios 都会生效。


比如：
```typescript
export const axios = {
	baseURL: 'https://api.example.com',
  // `headers` are custom headers to be sent
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 1000, // default is `0` (no timeout)

  // `withCredentials` indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  withCredentials: false, // default
};
```
具体的参数可以参考 [axios global config](https://github.com/axios/axios#config-defaults)。


## 配置全局拦截器
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