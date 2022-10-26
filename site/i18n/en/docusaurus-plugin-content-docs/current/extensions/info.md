# Information viewing

Midway provides the info component to display the basic information of the application and facilitate troubleshooting.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |


## Installation dependency

```bash
$ npm i @midwayjs/info@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/info": "^3.0.0",
    // ...
  },
}
```



## Use components

Configure the info component into the code.

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    // ...
    info
  ]
})
export class MainConfiguration {
  //...
}
```

In some cases, in order not to let the application information out, we specify that it will take effect in a special environment.

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    koa
    {
      component: info
      enabledEnvironment: ['local'], // enabled locally only
    }
  ]
})
export class MainConfiguration {
  //...
}
```



## View information

By default, the info component automatically adds a middleware to the Http scenario, which can be accessed by using `/_info`.

By default, key information such as system, process, and configuration is displayed.

The effect is as follows:

![info](https://img.alicdn.com/imgextra/i3/O1CN01TCkSvr28x8T7gtnCl_!!6000000007998-2-tps-797-1106.png)



## Modify access route

For security, we can adjust the route of access.

```typescript
// src/config/config.default.ts
export default {
  // ...
  info: {
    infoPath: '/_my_info',
  }
}
```



## Hide information

By default, the info component hides information such as the secret key. null********

Keyword can use wildcard characters, such as adding some keywords.

```typescript
// src/config/config.default.ts
import { DefaultHiddenKey } from '@midwayjs/info';

export default {
  // ...
  info: {
    hiddenKey: DefaultHiddenKey.concat(['*abc', '*def', '*bbb*']),
  }
}
```



## API

The info component provides `InfoService` by default for use in non-Http or custom scenarios.

For example:

```typescript
import { Provide } from '@midwayjs/decorator';
import { InfoService } from '@midwayjs/info';

@Provide()
export class userService {

  @Inject()
  inforService: InfoService

  async getInfo() {
    // Application information, application name, etc.
    this.inforService.projectInfo();
    // System information
    this.inforService.systemInfo();
    // Heap memory, cpu, etc.
    this.inforService.resourceOccupationInfo();
    // midway framework information
    this.inforService.softwareInfo();
    // The current environment configuration
    this.inforService.midwayConfig();
    // Depend on the service injected into the container
    this.inforService.midwayService();
    // System time, time zone, startup time
    this.inforService.timeInfo();
    // Environment variable
    this.inforService.envInfo();
    // Dependency information
    this.inforService.dependenciesInfo();
    // Network information
    this.inforService.networkInfo();
  }
}
```

