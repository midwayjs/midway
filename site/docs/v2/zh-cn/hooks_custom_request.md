---
title: 自定义前端 SDK
---

Midway Hooks 默认使用浏览器指定的 fetch 发送请求，为了支持不同场景，开发者可以自定义请求函数。

比如，你希望使用 Axios 作为 HTTP 请求的客户端，只需要在前端页面入口处，添加如下代码即可：

```typescript
import { defaults, ApiParam } from '@midwayjs/hooks/request';
import axios from 'axios';

defaults.request = async (param: ApiParam) => {
  const resp = await axios(params);
  return resp.data;
};
```

##### 注意事项

关于开发者实现的自定义函数，需要注意以下情况：

- 自定义函数对所有请求生效，重复设置 `defaults.request` 方法，会覆盖之前的设置
- 自定义函数的返回值应该是调用的接口返回值，像 `axios` 这种对响应自行包装的，需要手动解析出接口的返回值
