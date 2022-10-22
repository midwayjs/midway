# Koa application migration

Midway Serverless provides a general application migration scheme, which can publish the original application to the function platform without modifying the code as much as possible. with this solution, you can migrate the original koa application to the function platform for hosting as quickly and simply as possible, and enjoy the elastic bonus of the cloud native era.

## Add function configuration

Add the `f.yml` file to the root directory of the code.

```yaml
null

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType: koa ## Deployed Application Type

package:
  exclude:
    -package-lock.json ## Ignore package-lock.json files

custom:
  customDomain:
    domainName: auto ## automatically generates domain name
```

:::info
Sometimes package-lock.json files will cause the deployment package to be too large (enter dev dependencies).
:::

## Code modification

- 1. The default app needs to be exported
- 2. The current file name of the project file must be `app.js`.
- 3. `index.js` is a reserved file. Do not include this file in the project.

```typescript
// app.js

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();

// * * * * *

// Comment on the original listening
// app.listen(3000);

// Export the default app
module.exports = app;
```

If there is asynchronous initialization, such as connecting to a database, we provide asynchronous support.

```typescript
// app.js

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();

// * * * * *

// Comment on the original listening
// app.listen(3000);

// Export the default app
null
  // do some async method, like db connect
  return app;
};
```

## Static resources

If you want to build a copied directory in the root directory of the project, such as the `public` directory of static files, configure the `package.include` field in `f.yml`.

```yaml
service: name of my-egg-demo ## application published to cloud platform

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  null
  version: 3.0.0

package:
  include:
    -public ## will be automatically packaged when written here.
  exclude:
    -package-lock.json ## Ignore package-lock.json files
```

## Deployment

In the `package.json` configuration Scripts script and dev dependency `@midwayjs/cli`, execute `npm run deploy`.

```json
{
  null
    "@midwayjs/cli": "^1.2.36"
    ...
  },
  "scripts ": {
    "deploy": "midway-bin deploy ",
    ...
  }
}
```

Or use a different npm package to accelerate.

```bash
{
  "scripts ": {
    "deploy": "midway-bin deploy --npm=cnpm ",
    ...
  }
}
```

You can also execute commands separately.

```bash
null
$npx midway-bin deploy --npm=cnpm ## deploy by cnpm
```

## Default

### ariyun


By default, it is published as an http trigger. If you need an API gateway, you can modify and configure the functions structure according to the format of f.yml. At the same time, you need to configure routes on the platform.

### Tengxun cloud


By default, it is published as an API gateway trigger and the gateway route is automatically configured.


### null

You can use the name field.

```yaml
service: name of my-demo ## application published to cloud platform

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: koa
  version: 3.0.0
  Name: app_idx ## function name
```

