# Upgrade to 3.x

This article will introduce how to upgrade from midway v2 to midway v3.

Upgrading from Midway v2 to Midway v3, there will be some Breaking Changes. This document will list these Breaking places in detail, so that users can know the changes in advance and respond to them.



## Automatic upgrade tool

**Before the upgrade, please cut out a new branch to avoid the failure of the upgrade and cause no recovery! ! ! **

Copy the following script and execute it in the project root directory:

```bash
$ npx --ignore-existing midway-upgrade
```

:::tip

Due to different business situations, please check the manual upgrade after the script upgrade.

:::



## Manual upgrade

**midway v3 support since node v12. **


### Package version update

All component packages, core packages will be upgraded to 3.x version.

```json
{
  "dependencies": {
    "@midwayjs/bootstrap": "^3.0.0",
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "@midwayjs/koa": "^3.0.0",
    "@midwayjs/task": "^3.0.0",
  },
  "devDependencies": {
    "@midwayjs/cli": "^1.2.90",
    "@midwayjs/luckyeye": "^1.0.0",
    "@midwayjs/mock": "^3.0.0",
    // ...
  }
}

```

`@midwayjs/cli` and `@midwyajs/luckeye`, except `@midwayjs/logger` version.



### Query/Body/Param/Header decorator changes


Mainly the default behavior without parameters.


old

```typescript
async invoke(@Query() name) {
  // ctx.query.name
}
```
new
```typescript
async invoke(@Query() name) {
  // ctx.query
}

async invoke(@Query('name') name) {
  // ctx.query.name
}
```



### Validate/Rule decorator


old
```typescript
import { Validate, Rule, RuleType } from '@midwayjs/decorator';
```
new
```typescript
import { Validate, Rule, RuleType } from '@midwayjs/validate';
```
Since validate is abstracted into a component, dependencies need to be installed and enabled in the code.
```typescript
// src/configuration
import * as validate from '@midwayjs/validate';

@Configuration({
  // ...
  imports: [
    validate
  ],
})
export class MainConfiguration {
  // ...
}

```

### task component configuration key change

old

```typescript
export const taskConfig = {};
```

new

```typescript
export const task = {};
```



### Configured absolute path


Relative paths are no longer supported


old

```typescript
// src/configuration

@Configuration({
  // ...
  importConfigs: [
    './config' // ok
  ]
})
export class MainConfiguration {
  // ...
}

```
new

```diff
// src/configuration
import { join } from 'path';

@Configuration({
  // ...
  importConfigs: [
- './config' // error
+ join(__dirname, './config') // ok
  ]
})
export class MainConfiguration {
  // ...
}

```

### Use default frame/multiframe


Old, will be introduced in bootstrap.js
```typescript
const WebFramework = require('@midwayjs/koa').Framework;
const GRPCFramework = require('@midwayjs/grpc').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap
  .load(config => {
    return new WebFramework().configure(config.cluster);
  })
  .load(config => {
    return new GRPCFramemwork().configure(config.grpcServer);
  })
  .run();
```


new version


Separate instantiation is no longer required in bootstrap.js
```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```
Instead, import as a component
```typescript
// src/configuration
import * as web from '@midwayjs/web';
import * as grpc from '@midwayjs/grpc';

@Configuration({
  // ...
  imports: [
    web,
    grpc,
    //...
  ],
})
export class MainConfiguration {
  // ...
}
```


Other effects:



- 1. It is no longer necessary to use the createBootstrap method to start from bootstrap.js in the test
- 2. The configuration of the original entry Framework can now be placed in config.*.ts, with the framework name as the key



### Removed batch of IoC container APIs


Remove the following methods on container


- getConfigService(): IConfigService;
- getEnvironmentService(): IEnvironmentService;
- getInformationService(): IInformationService;
- setInformationService(service: IInformationService): void;
- getAspectService(): IAspectService;
- getCurrentEnv(): string;


Now there are corresponding framework built-in services to replace.


For example, the old way of writing:

```typescript
const environmentService = app.getApplicationContext().getEnvironmentService();
const env = environmentService.getCurrentEnvironment();
```


new spelling
```typescript
const environmentService = app.getApplicationContext().get(MidwayEnvironmentService)
const env = environmentService.getCurrentEnvironment();
```



## @midwayjs/web(egg) section

### start port

The new version of the framework will read a port configuration when it is started. If it is not configured, port monitoring may not be started.

```json
// src/config/config.default
export default {
  // ...
  egg: {
    port: 7001,
  },
}
```



### Add egg-mock

Since the framework removed the egg-mock package, in the new version `package.json` needs to be referenced manually.

```json
{
  "devDependencies": {
    "egg-mock": "^1.0.0",
    // ...
  }
}
```

### logger

The new version uses @midwayjs/logger uniformly, whether egg logger is enabled or not.

In order not to conflict with the egg log, we use a new key, and the original `midwayFeature` field is no longer used.

old

```typescript
export const logger = {
  level: 'warn',
  consoleLevel: 'info'
}
```

new

```typescript
export const midwayLogger = {
  default: {
    level: 'warn',
    consoleLevel: 'info'
  }
}
```

Egg's `customLogger` field is compatible with egg plugins that cannot be modified. For business code, it is best to modify them.

```typescript
export const midwayLogger = {
  default: {
    level: 'warn',
    consoleLevel: 'info'
  },
  clients: {
    // custom log
    customLoggerA: {
      // ...
    }
  }
}
```

For the rest of the more specific configuration, please refer to the Customization section in [Log Chapter](logger).

### egg plugin

In Midway3, we turned off most of the egg default plugins in order to unify documentation and behavior.

The default plugins in the new version are as follows:

```javascript
module.exports = {
  onerror: true,
  security: true,
  static: false,
  development: false,
  watcher: false,
  multipart: false,
  logrotator: false,
  view: false,
  schedule: false,
  i18n: false,
}
```

Please turn it on as appropriate (may conflict with midway ability).

The default egg log cutting plugin (logrotator), because the log no longer supports egg logger, we directly closed it in the framework (midway logger comes with cutting).



### Scheduled tasks

If you want to use the old `@Schedule` decorator, you need to additionally install the `midway-schedule` package and import it as an egg plugin.

```typescript
// src/config/plugin.ts

export default {
  schedule: true,
  schedulePlus: {
    enable: true,
    package: 'midway-schedule',
  }
  // ...
}
```





## Other adjustments for component/framework developers



### RegisterObject in the component no longer adds namespace


During component development, the namespace prefix is ​​no longer added.


old, component entry
```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class MainConfiguration {

  async onReady(container) {
  	container.registerObject('aaa', 'bbb');
  }
}

container.getAsync('A:aaa'); // => OK
```


new component entry

```typescript
@Configuration({
  namespace: 'A'
  // ...
})
export class MainConfiguration {

  async onReady(container) {
  	container.registerObject('aaa', 'bbb');
  }
}

container.getAsync('aaa'); // => OK
```




### Custom framework section


The changes in the custom framework are relatively large, and the componentization of the framework is the goal of this version. There are several places that need to be modified.


**1. Add the @Framework logo to the original framework**


old
```typescript
export class CustomKoaFramework extends BaseFramework {
// ...
}
```
new
```typescript
import { Framework } from '@midwayjs/decorator';

@Framework()
export class CustomKoaFramework extends BaseFramework {
// ...
}
```


**2. Export Configuration at the entrance according to the component specification**


You can use lifecycles in configuration, same as components. The `run` method will be called and executed explicitly during the newly added `onServerReady` lifecycle.

```typescript
import { Configuration,Inject } from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  async onReady() {}

  async onServerReady() {
    // ...
  }
}

```


**3. During framework development**

**It should be noted that since the framework is initialized before the user life cycle, when applicationInit, do not inject the configuration through the @Config decorator, but call configService to obtain it. **


```typescript
import { Framework } from '@midwayjs/decorator';

@Framework()
export class CustomKoaFramework extends BaseFramework {

   configure() {
     /**
     * return your configuration here
     * The returned value will be assigned to this.configurationOptions, and the original user's explicit input parameters will be connected
     *
     */
     return this.configService.getConfiguration('xxxxxxx');
   }

  /**
   * This new method is used to determine whether the framework is loaded
   * Sometimes components include server side (framework) and client side, you need to judge
   *
   */
   isEnable(): boolean {
     return this.configurationOptions.services?.length > 0;
   }

  // ...
}
```

This can also be judged when used outside.

```typescript
import { Configuration,Inject } from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  async onReady() {}

  async onServerReady() {
    // If isEnable is true, the framework will call framework.run() by default
    // If enable is false at the beginning, you can also delay to manually run
    if (/* defer execution */) {
      await this.framework.run();
    }
  }
}

```