# HTTP request



## Simple HTTP request

Midway has a built-in simple HTTP request client, which can be used without introducing a third-party package.

The default Get request, and the returned data is Buffer.



### Simple method form

```typescript
import { makeHttpRequest } from '@midwayjs/core';

const result = await makeHttpRequest('http://127.1:7001/');

// Buffer.isBuffer(result.data) => true
```

Get request, with Query, the return type is JSON.

```typescript
import { makeHttpRequest } from '@midwayjs/core';

const result = await makeHttpRequest('http://127.1:7001/', {
  data: {
    a: 1
    B: 2
  },
  dataType: 'json', // returned data format
});

// typeof result.data => 'object'
// result.data.url => /?a=1&b=2
```

You can specify the type

```typescript
import { makeHttpRequest } from '@midwayjs/core';

const result = await makeHttpRequest('http://127.1:7001/', {
  method: 'GET',
  dataType: 'json',
});
```

Returns the text format.

```typescript
import { makeHttpRequest } from '@midwayjs/core';

const result = await makeHttpRequest('http://127.1:7001/', {
  method: 'GET',
  dataType: 'text',
});
```

POST requests and returns JSON.

```typescript
import { makeHttpRequest } from '@midwayjs/core';

const result = await makeHttpRequest('http://127.1:7001/', {
  method: 'POST',
  data: {
    a: 1
    B: 2
  },
  dataType: 'json',
  contentType:'json', // the post sent is json
});

// result.data...
```

:::caution
Note, please do not return the result object directly in the request. The result object is a standard httpResponse, which cannot be directly serialized in most scenarios, and an object loop error will be thrown.
:::

Set the request timeout time.

```typescript
import { makeHttpRequest } from '@midwayjs/core';

let err;
// Timeout will report an error, pay attention to catch
try {
  const result = await makeHttpRequest('http://127.1:7001/', {
    method: 'GET',
    dataType: 'text',
    timeout: 500
  });
} catch (e) {
  err = e;
}
```

:::tip

The built-in Http client only provides the simplest capabilities. If you need complex functions (front and back interception or other additional configurations), please use axios.

:::



### Instance form

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/');

// Buffer.isBuffer(result.data) => true
```

Same as method form parameters.

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient();
const result = await httpclient.request('http://127.1:7001/', {
  method: 'POST',
  data: {
    a: 1
    B: 2
  },
  dataType: 'json',
  contentType:'json', // the post sent is json
});

// result.data...
```

In the example form, you can reuse the created object, and you can bring some fixed parameters, such as header, with each request.

```typescript
import { HttpClient } from '@midwayjs/core';

const httpclient = new HttpClient({
  headers: {
    'x-timeout': '5'
  },
  method: 'POST',
  timeout: 2000
});

// Bring headers with you every time
const result = await httpclient.request('http://127.1:7001/');

```





## Axios support

Midway wraps the [axios](https://github.com/axios/axios) package, allowing you to simply use the axios interface in your code.

Some relationships with axios are as follows:

- The interfaces are exactly the same.
- Adaptation dependency injection writing, complete type definition
- Facilitate unified instance management and configuration

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |




### Installation dependency

```bash
$ npm i @midwayjs/axios@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/axios": "^3.0.0",
    // ...
  },
}
```



### Introducing components


First, introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';
import { join } from 'path'

@Configuration({
  imports: [
    axios // import axios components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

It can then be injected into the business code.



### Use the default Axios instance


The API is the same as [axios](https://github.com/axios/axios).


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


Use example:
```typescript
import { HttpService } from '@midwayjs/axios';

@Provide()
export class UserService {

  @Inject()
  httpService: HttpService;

  async invoke() {
  	const url = 'http://www.weather.com.cn/data/cityinfo/101010100.html';
    const result = await this.httpService.get(url);
    // TODO result
  }
}
```



### Configure the default Axios instance


The HttpService instance is equivalent to `axios.create`, so you can have some configuration parameters. These parameters are the same as axios itself. We can configure it in `src/config.default.ts`.


For example:
```typescript
export default {
  // ...
  axios: {
    default: {
      // The configuration of all instances reuse.
    },
    clients: {
      // The configuration of the default instance.
      default: {
        baseURL: 'https://api.example.com',
        // 'headers' are custom headers to be sent
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 1000, // default is '0' (no timeout)

        // 'withCredentials' indicates whether or not cross-site Access-Control requests
        // should be made using credentials
        withCredentials: false, // default
      },
    }
  }
}
```
For more information, see [axios global config](https://github.com/axios/axios#config-defaults).



### Create different instances

it is the same as multiple instances of other services. configure different keys.

```typescript
export default {
  // ...
  axios: {
    default: {
      // The configuration of all instances reuse.
    },
    clients: {
      default: {
        // Default instance
      },
      customAxios: {
        // Custom instance
      }
    }
  }
}
```

The usage is as follows:

```typescript
import { HttpServiceFactory, HttpService } from '@midwayjs/axios';
import { InjectClient } from '@midwayjs/core';

@Provide()
export class UserService {

  @InjectClient(HttpServiceFactory, 'customAxios')
  customAxios: HttpService;

  async invoke() {
  	const url = 'http://www.weather.com.cn/data/cityinfo/101010100.html';
    const result = await this.customAxios.get(url);
    // TODO result
  }
}
```



### Configure global interceptors

If you are using the default Axios instance, you can configure it as follows.

```javascript
import { Configuration, IMidwayContainer } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';
import { join } from 'path';

@Configuration({
  imports: [
    axios // import axios components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {

  async onReady(container: IMidwayContainer) {
  	const httpService = await container.getAsync(axios.HttpService);
    httpService.interceptors.request.use (
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

If you want to configure other instances, you can refer to the following code.

```typescript
import { Configuration, IMidwayContainer } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';
import { join } from 'path';

@Configuration({
  imports: [
    axios // import axios components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {

  async onReady(container: IMidwayContainer) {
  	const httpServiceFactory = await container.getAsync(axios.HttpServiceFactory);
    const customAxios = httpServiceFactory.get('customAxios');
    customAxios.interceptors.request.use (
      config => {
        //...
      },
      error => {
        //...
      }
    );
  }
}
```

