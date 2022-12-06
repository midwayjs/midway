# Static website hosting

This solution is applicable to hosting pure front-end projects (React, vue, etc.) to Serverless platforms (Aliyun, Tencent, etc.).

Common scenes include hosting company official website, personal homepage, blog, etc.

## Usage

Add the following `F. yml` to any static project:

```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: static
  version: 3.0.0

package:
  include:
  	-build ## Directory to Copy
  exclude:
    -package-lock.json ## Ignore package-lock.json files

custom:
  customDomain:
    domainName: auto ## automatically generates domain name
```

:::info
Sometimes package-lock.json files will cause the deployment package to be too large (enter dev dependencies).
:::

Add dev dependency `@midwayjs/cli`.

```json
{
  "devDependencies": {
    "@midwayjs/cli": "^1.2.36"
  	...
  },
  "scripts": {
    "deploy": "npm run build && midway-bin deploy --skipBuild"
  }
}
```

Run `npm run deploy`.

Or use a different npm package to accelerate.

```bash
{
  "scripts": {
    "deploy": "npm run build && midway-bin deploy --skipBuild --npm=cnpm ",
    ...
  }
}
```

:::info
The `--skipBuild` parameter is used here to skip the build of the function. `npm run build` connects to the front-end build command.
:::

By default, the `build` directory is used as the managed root directory. When you access the`/`route, the `/index.html` is automatically searched.

For example:

- /=> /index.html
- /api/ => /api/index.html

## Optional configuration

In addition to the default configuration, we can do some additional configuration for static websites.

### Modify managed directory

```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: static
  version: 3.0.0
  config:
  	rootDir: public          ## hosting directory becomes public

package:
  include: the directory to be copied by public ## changes with the configured managed Directory
```

### Modify managed prefix

Sometimes a unified route prefix is required for deployment, such as `/api/*`.

```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: static
  version: 3.0.0
  config:
  	prefix: /api

package:
  include: build
```

In this way, all/_will become/api/_.

### Configuration 404 page

Ordinary routes are based on managed directory structures and files. If a file that does not exist is accessed, a 404 is returned. We can specify a 404 page.

```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: static
  version: 3.0.0
  config
  	notFoundUrl: /404.html

package:
  include: build
```

### rewrite routing



Sometimes, we want to access some specific routes to a specific file. For example, we want to transfer all route requests to `/index.html`, and then let the front-end route process.

```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
  type: static
  version: 3.0.0
  config:
  	rewrite:
    	/(.*): /index.html

package:
  include: build
```

You can write multiple rewrite, and the rules are the same as [koa-rewrite](https://github.com/koajs/rewrite).


To exclude certain directories, you can use the `@not` syntax.


For example, exclude static directories.

```yaml
deployType:
  type: static
  version: 3.0.0
  config:
    rootDir: build
    rewrite:
      '@not /static/(.*)': /index.html
```



### Modify the name of the deployed function

You can use the name field.


```yaml
service: my-static-demo

provider:
  name: aliyun ## cloud platform, aliyun,tencent, etc

deployType:
	type: static
  version: 3.0.0
  Name: app_idx ## function name

package:
  include: the directory to be copied by public ## changes with the configured managed Directory
```
