# Process Agent

midway encapsulates `@midwayjs/process-agent` to solve data inconsistencies between processes in some multi-process scenarios in node scenarios, or it is impossible to specify the master process to execute a method.


Examples:

- If pm2, cluster, and multi-process deployment methods are used, and memory cache is used, then the cache is in its own process.
- prometheus, when acquiring `/metrics`, it is necessary to collect data from all processes, not from one process.
- Health check, if there are 4 processes, if one process is abnormal, the health check should fail.



Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation method

Usage:

```bash
$ npm install @midwayjs/process-agent@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/process-agent": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## Introducing components

Usage of `configuration.ts`:

```typescript
import * as processAgent from '@midwayjs/process-agent';

@Configuration({
  imports: [
    // ...
    processAgent
  ],
})
export class MainConfiguration {
}

```
## Usage

Business code UserService:

```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { TestService } from './test';

@Provide()
export class UserService {

  @Inject()
  testService: TestService;

  async getUser() {
    let result = await this.testService.setData(1);
    return result;
  }
}

```
Then when calling the testService, it is hoped that it will only be executed in the main process:

```typescript
import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { RunInPrimary } from '@midwayjs/process-agent';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService {

  data: any = 0;

  @RunInPrimary()
  async setData( B) {
    this.data = B;
    return this.data;
  }

  @RunInPrimary()
  async getData() {
    return this.data;
  }
}

```
Note that the data returned by the execution is limited to serializable data, such as ordinary JSON, and does not support data that cannot be serialized such as including methods.


## Effect description
Assume that it is started in a multi-process manner such as pm2 or egg-script. Assume that this is a request.

First:

- 1. Set setData
- 2. Then get the getData


If this decorator is not RunInPrimary, the request may fall on process 2 or process 3, and the updated data may not be obtained.

So RunInPrimary can ensure that the execution of this function falls to the main process.


## Function Solicitation
If you have other related functions that can be placed in this package, please mention them in the comment area or [issue](https://github.com/midwayjs/midway/issues). We will discuss and implement them with you.

