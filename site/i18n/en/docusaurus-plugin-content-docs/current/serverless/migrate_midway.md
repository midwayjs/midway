# Midway application migration

Midway Serverless provides a general application migration scheme, which can publish the original application to the function platform without modifying the code as much as possible. with this solution, you can migrate the original midway application to the function platform for hosting as quickly and simply as possible, and enjoy the elastic bonus of the cloud native era.

## Restrictions

Only pure `@midwayjs/koa`, `@midwayjs/express`, `@midwayjs/web` projects (pure Http) can be migrated.



## @midway/koa

The Serverless environment refers to the function environment such as Aliyun FC and Tencent Cloud. Midway can deploy existing Web projects as Serverless applications. Here, deploy to Alibaba Cloud Function Compute as an example.


1. Add the `f.yml` file to the root directory of your project.

```
➜ hello_koa tree
.
├── src
├── dist
├── f.yml  								# Midway Serverless deployment profile
├── package.json
└── tsconfig.json
```

```yaml
service: my-midway-app ## the name of the application published to the cloud platform, generally refers to the application name

provider:
	name: aliyun

deployType:
  type: koa ## application type to be deployed
  version: 3.0.0
```

2. Code modification

Rename `bootstrap.js` to `app.js` and return an app.

The modified code is as follows:

```typescript
// Get the framework
const WebFramework = require('@midwayjs/koa'). Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

module.exports = async () => {
  // Load the framework and execute
  await Bootstrap.run();
  // Get the dependency injection container
  const container = Bootstrap.getApplicationContext();
  // Get koa framework
  const framework = container.get(WebFramework);
  // Return app object
  return framework.getApplication();
};
```

3, add the build hook at the time of release.

Add the following paragraph to `package.json` to automatically execute `npm run build` when publishing.

```json
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"scripts": {
  	"deploy": "midway-bin deploy"
  }
```

3. Run `NPM run deploy`. After Publishing, Alibaba Cloud outputs a temporarily available domain name and opens a browser to access it.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#height=193&id=XpZAN&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&originalType=binary&ratio=1&size=35152&status=done&style=none&width=1219" width="1219" />

For more detailed release documents, please refer to the [**Serverless release FAQ**](./serverless/deploy_aliyun_faq).



## @midway/express

1. Add the `f.yml` file to the root directory of your project.

```
➜ hello_express tree
.
├── src
├── dist
├── f.yml  								# Midway Serverless deployment profile
├── package.json
└── tsconfig.json
```

```yaml
service: my-midway-app ## the name of the application published to the cloud platform, generally refers to the application name

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: express ## the type of application deployed
  version: 3.0.0
```

2. Code modification

Rename `bootstrap.js` to `app.js` and return an app.

The modified code is as follows:

```typescript
// Get the framework
const WebFramework = require('@midwayjs/express'). Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

module.exports = async () => {
  // Load the framework and execute
  await Bootstrap.run();
  // Get the dependency injection container
  const container = Bootstrap.getApplicationContext();
  // Get express framework
  const framework = container.get(WebFramework);
  // Return app object
  return framework.getApplication();
};
```

3, add the build hook at the time of release.

Add the following paragraph to `package.json` to automatically execute `npm run build` when publishing.

```json
{
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"scripts": {
  	"deploy": "midway-bin deploy"
  }
}
```

3. Run `npm run deploy`. After publishing, Alibaba Cloud outputs a temporarily available domain name and opens a browser to access it.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png"/>

For more detailed release documents, please refer to the [**Serverless release FAQ**](./serverless/deploy_aliyun_faq).



## @midwayjs/web

1. Add the `f.yml` file to the root directory of the code. The simplest content is as follows.

```yaml
service: my-egg-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: the type of the application deployed by the egg ##
  version: 3.0.0

package:
  include:
    -public ## If there is a static file directory, it will be automatically copied here.
  exclude:
    -package-lock.json ## Ignore package-lock.json files

custom:
  customDomain:
    domainName: auto ## automatically generates domain name
```

:::info
Sometimes package-lock.json files will cause the deployment package to be too large (enter dev dependencies).
:::



2. Modify the `bootstrap.js` of the code root directory to the following code

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
const { MidwayFrameworkService } = require('@midwayjs/core');
const { join } = require('path');

module.exports = async (options) => {
  // Load the framework and execute
  await Bootstrap
    .configure({
      appDir: __dirname
      baseDir: join(__dirname, './dist')
      ...options
    })
    .run();
  const applicationContext = Bootstrap.getApplicationContext();
  const frameworkService = applicationContext.get(MidwayFrameworkService);
  // Return app object
  return frameworkService.getMainApp();
};

```



3. In order to automatically perform compilation at the time of release, the `package.json` is configured as follows.

```json
{
  "name": "xxxxxx ",
  "version": "xxxx ",
  .....
  "scripts": {
		"deploy": "midway-bin deploy ",
  	....
	},
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"egg": {
  	"framework": "@midwayjs/web"
  }
}
```

There are two main points here:

- 1. The `egg` field is specified here to specify the upper-layer frame of a specific egg.
- 2. The `midway-integration` field is configured here to support the original compilation under the midway application system.
- 3. add deploy script

:::info
If you use your own egg upper frame, the egg.framework here can be changed to your own package name.
:::



### Egg default configuration of migration scheme

In the current migration scheme, some default configurations are added for better operation in the function system. **In general, you do not need to modify**.

```typescript
// config.default
const os = require('os');
exports.logger = {
  dir: os.tmpdir()
};

exports.rundir = os.tmpdir();

exports.static = {
  buffer: true
};
```

Since the function environment disk is not writable, we adjusted the default log directories to temporary directories.

```typescript
// plugin

'use strict';

exports.i18n = false;
exports.watcher = false;
exports.development = false;
exports.logrotator = false;
exports.schedule = false;
exports.static = false;
```

Different from the default egg, the static plug-in is disabled by default. If the `app/public` directory is not available by default, the plug-in is created when it is started. An error is reported because the server disk is not writable.

If you need a static plug-in, **open it manually** and **make sure that the** `app/public` or the corresponding directory exists.

If the `public` directory is in the root directory, configure the `package.include` field in `f.yml`.

```yaml
service: my-egg-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType: the type of application deployed by egg ##

package:
  include:
    -public ## If there is a static file directory, it will be automatically copied here.
  exclude:
    -package-lock.json ## Ignore package-lock.json files
```



## Deployment

In the `package.json` configuration Scripts script and dev dependency `@midwayjs/cli`, execute `npm run deploy`.

```json
{
  "devDependencies": {
    "@midwayjs/cli": "^1.2.36"
    ...
  },
  "scripts": {
    "deploy": "midway-bin deploy ",
    ...
  }
}
```

Or use a different npm package to accelerate.

```bash
{
  "scripts": {
    "deploy": "midway-bin deploy --npm=cnpm ",
    ...
  }
}
```

You can also execute commands separately.

```bash
$npx midway-bin deploy ## deploy by npm
$npx midway-bin deploy --npm=cnpm ## deploy by cnpm
```



## Default

### Modify the function name of the default deployment.

You can use the name field.

```yaml
service: my-egg-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: egg
  Name: app_idx ## function name
```

:::info
aggregation fields do not take effect when using deployType.
:::



### Aliyun

By default, it is published as an http trigger. If you need an API gateway, you can modify and configure the functions structure in the format of f.yml. At the same time, configure the route `/*` at the API gateway to transfer to this function.

### Tencent cloud

By default, it is published as an API gateway trigger and the gateway route is automatically configured.

## Some restrictions

- egg-socketio, etc. Not supported
- It does not support the ability that the gateway cannot support such as file upload.
