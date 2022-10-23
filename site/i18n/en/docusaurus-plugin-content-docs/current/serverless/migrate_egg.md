# Egg application migration

Midway Serverless provides a general application migration scheme, which can publish the original application to the function platform without modifying the code as much as possible. with this solution, you can migrate the original egg application to the function platform for hosting as quickly and simply as possible, and enjoy the elastic bonus of the cloud native era.

## Use

The `f.yml` file is added to the root directory of the code. The simplest content is as follows.

```yaml
Service: Name of My-egg-Demo## Application published to cloud platform

provider:
  name: aliyun 		## cloud platform, aliyun,tencent, etc

deployType:
  type: egg 			## Deployed application type
  version: 3.0.0

package:
  include:
    -public 			## If there is a static file directory, it will be automatically copied here.
  exclude:
    -package-lock.json ## Ignore package-lock.json files

custom:
  customDomain:
    domainName: auto ## automatically generates domain name
```

:::info
Sometimes package-lock.json files will cause the deployment package to be too large (enter dev dependencies).
:::

## TS compilation

If it is a egg-ts project, you can use the release hook provided by us to automatically perform compilation at the time of release. The configuration in `package.json` is as follows.

```json
{
  "name": "xxxxxx ",
  "version": "xxxx ",
  .....
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run tsc"
    }
  }
}
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
service: name of my-demo ## application published to cloud platform

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: egg
  version: 3.0.0
  Name: app_idx ## function name
```

:::info
aggregation fields do not take effect when using deployType.
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
package:
  include:
    -public ## If there is a static file directory, it will be automatically copied here.
  exclude:
    -package-lock.json ## Ignore package-lock.json files
```

### ariyun

By default, it is published as an http trigger. If you need an API gateway, you can modify and configure the functions structure in the format of f.yml. At the same time, configure the route `/*` at the API gateway to transfer to this function.

### Tencent cloud

By default, it is published as an API gateway trigger and the gateway route is automatically configured.

## Some restrictions

- egg-socketio, etc. Not supported
- It does not support the ability that the gateway cannot support such as file upload.
