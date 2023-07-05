# Start-up and deployment

Midway provides a lightweight launcher to launch your application. null


## Local development


Here are two ways to use the `dev` command for local development.


### Quickly start a single service


In local development, Midway provides a `dev` command startup framework in `package.json`, such:
```json
{
  "script": {
    "dev": "midway-bin dev --ts"
  }
}
```
This is the most concise command, it has the following characteristics:


- 1. Use `--ts` to specify the TypeScript(ts-node) environment to start
- 2. Use the built-in API(@midwayjs/core `initializeGlobalApplicationContext`) to create a service without `bootstrap.js`
- 3. Single process operation

Run the following command on the command line to execute.
```bash
$ npm run dev
```



### Specify the portal to start the service

Because the local dev command is usually different from the initialization parameters of the `bootstrap.js` startup file, some users are worried about the inconsistency between local development and online development, such as testing links.

In this case, you can directly pass an entry file to the `dev` command and use the entry file to start the service.

```json
{
  "script": {
    "dev": "midway-bin dev --ts --entryFile=bootstrap.js"
  }
}
```



## Deploy to a normal server


### The difference between post-deployment and local development


After deployment, some places are different from local development.


**1. Changes in the node environment**


The biggest difference is that after the server is deployed, node will be used directly to start the project instead of ts-node, which means that the `*.ts` file will no longer be read.


**2. Changes in the loading directory**


After the server is deployed, only the built `dist` directory is loaded, while the local development `src` directory is loaded.

|  | Local | Server |
| --- | --- | --- |
| appDir | Project root directory | Project root directory |
| baseDir | src directory under the root directory of the project | dist directory under the root directory of the project |

**3. Changes in the environment**


In the server environment, `NODE_ENV=production` is generally used. Many libraries will provide better performance methods in this environment, such as enabling caching, error reporting, etc.

**4. Log files**


In the general server environment, logs are not printed to the logs directory of the project, but other directories that are not affected by project updates, such as `home/admin/logs`. This fixed directory also facilitates other tools to collect logs.


### Deploy process


The entire deployment is divided into several parts. Since Midway is written TypeScript, it adds a build step to the traditional JavaScript code. The entire deployment process is as follows.

![](https://img.alicdn.com/imgextra/i3/O1CN01wSpCuM27pWGTDeDyK_!!6000000007846-2-tps-2212-242.png)
Since deployment is very relevant to the platform and environment, we will demonstrate it with Linux below, and other platforms can refer to it as appropriate.


### Compile code and install dependencies


Since Midway project is TypeScript written, we compile it before deployment. In this example, we have written the build script in advance and run the `npm run build` command. If not, add the following `build` command to `package.json`.
```json
// package.json
{
  "scripts": {
    "build": "midway-bin build -c"
  },
}
```

:::info
Although it is not necessary, it is recommended that you perform the test and lint first.
:::


Generally speaking, the deployment build environment and the local development environment are two sets. We recommend building your application in a clean environment.


The following code is a sample script that you can save as `build.sh`.

```bash
## Server build (code downloaded)
$ npm install             # installation and development period dependency
$ npm run build           # build project
$ npm prune --production  # remove development dependencies

## Local build (dev dependency has been installed)
$ npm run build
$ npm prune --production  # remove development dependencies
```

:::info
General installation dependencies specify `NODE_ENV = production` or `npm install-production` only dependencies dependencies are installed when building formal packages. Because the modules in the devDependencies are too large and will not be used in the production environment, unknown problems may also be encountered after installation.
:::


After the build is completed, the `dist` directory of the Midway build product appears.
```text
➜  my_midway_app tree
.
├── src
├── dist                # Midway build product directory
├── node_modules        # Node.js dependency package directory.
├── test
├── bootstrap.js        # Deployment Startup File
├── package.json
└── tsconfig.json
```


### Packing compression


After the construction is completed, you can simply package and compress it and upload it to the environment to be released.

:::caution

Generally speaking, the files or directories that must be included in the server operation are `package.json`, `bootstrap.js`, `dist`, `node_modules`.

:::




### Upload and decompress


There are many ways to upload to the server, such as the common `ssh/FTP/git` etc. You can also use online services such as [OSS](https://www.aliyun.com/product/oss) for transfer.


### Start the project

The project built by Midway is single-process. Whether it adopts `fork` mode or `cluster` mode, single-process code is always easily compatible with different systems, so it is very easy to be loaded by existing tools such as pm2/forever in the community,


Here we use pm2 to demonstrate how to deploy.


Projects generally need an entry file, for example, we create a `bootstrap.js` in the root directory as our deployment file.
```
➜  my_midway_app tree
.
├── src
├── dist                # Midway build product directory
├── test
├── bootstrap.js        # Deployment Startup File
├── package.json
└── tsconfig.json
```


Midway provides a simple way to meet the startup method of different scenarios. All we need to do is install the `@midwayjs/bootstrap` module provided by us (by default, it comes with it).

```bash
$ npm install @midwayjs/bootstrap --save
```

Then write the code in the entry file. Note that the code here uses `JavaScript`.

```javascript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```

Although the code of the startup file is very simple, we still need this file, which is needed in subsequent scenarios such as link tracking.

Note that there is no http startup port here. If you need it, you can refer to the document for modification.

- [Modify the koa port](extensions/koa# Modify Port)

At this time, you can directly use `NODE_ENV = production node bootstrap.js` to start the code, or you can use pm2 to perform the startup.

We generally recommend using tools to start the Node.js project. Here are some documents for advanced reading.

- [Use documentation for pm2](extensions/pm2)
- [cfork documentation](extensions/cfork)



### Startup parameters

In most cases, it is not necessary to configure parameters in the Bootstrap, but there are still some configurable startup parameter options that are passed in through `configure` methods.

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
  	imports: [/*...*/]
  })
  .run();
```



| Property | Type | Description |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| appDir | string | Optional. The project root directory is `process.cwd()` by default. |
| baseDir | string | Optional. The directory of the project code, which is `src` in R & D and `dist` in R & D. |
| imports | Component [] | Optional, explicit component reference |
| moduleDetector | 'file' \| IFileDetector \| false | Optional. The module loading method used. Default value: `file`. You can use the dependency injection local file scanning method. You can explicitly specify a scanner or disable scanning. |
| logger | Boolean \| ILogger | optional. the logger used in the bootstrap. the default value is consoleLogger |
| ignore | string [] | optional. the path ignored by the dependent injection container scan. the moduleDetector is invalid if false |
| globalConfig | Array<{ [environmentName: string]: Record<string, any> }> \| Record<string, any> | Optionally, if the global incoming configuration is an object, it is directly merged into the current configuration in the form of an object. If you want to pass in the configuration of different environments, it is passed in in the form of an array with the same structure and `importConfigs`.  |



**Example: Enter the global configuration (object)**

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
  	globalConfig: {
      customKey: 'abc'
    }
  })
  .run();
```



**Example, incoming sub-environment configuration**

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap
  .configure({
  	globalConfig: [{
      default: {/*...*/}
      unittest: {/*...*/}
    }]
  })
  .run();
```






## Deploy with Docker

### Write Dockerfile and build images


Step 1: Add a Dockerfile to the current directory

```dockerfile
FROM node:18

WORKDIR /app

ENV TZ="Asia/Shanghai"

COPY . .

# If each company has its own private source, it can replace the registry address
RUN npm install --registry=https://registry.npm.taobao.org

RUN npm run build

# If the port is changed, this side can be updated
EXPOSE 7001

CMD ["npm", "run", "online"]
```


Step 2: Add `.dockerignore` file (similar to git ignore file), you can copy the content of `.gitignore` to `.dockerignore`


Step 3: When using pm2 deployment, change the command to `pm2-runtime start`. For more information about pm2 deployment, see [pm2 container deployment instructions](https://www.npmjs.com/package/pm2#container-support).


Step 4: build a docker image

```bash
$ docker build -t helloworld.
```

step 5: run docker image

```bash
$ docker run -itd -P helloworld
```

The operation effect is as follows:
![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608882492099-49160b6a-601c-4f08-ba65-b95a1335aedf.png)

Then the uppercase `-P` allows us to access `32791` ports because we are assigned a port by default (this `-P` is randomly assigned, and we can also use the `-p 7001:7001` to specify a specific port)

![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608882559686-031bcf0d-2185-42cd-a838-80f008777395.png)

For other registry pushed to dockerhub or docker, you can search for the corresponding method.


**Optimization**

We can see that the mirror image we typed in front has more than 1g, which can be optimized:
- 1. We can use a simpler basic image of docker image: for example, node:18-alpine,
- 2. The source code was finally typed in the mirror image. In fact, we don't need this one.

We can also combine the multistage functions of docker to do some optimization. Please note that this function can only be used after `Docker 17.05`.


```dockerfile
FROM node:18 AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy the source code and the error can be reported to the right line
COPY --from=build /app/src ./src
COPY --from=build /app/dist ./dist
COPY --from=build /app/bootstrap.js ./
COPY --from=build /app/package.json ./

RUN apk add --no-cache tzdata

ENV TZ="Asia/Shanghai"

RUN npm install --production

# If the port is changed, this side can be updated
EXPOSE 7001

CMD ["npm", "run", "start"]
```

The result of the current example is only `207MB`. Compared with the original `1.26G`, it saves a lot of space.

### Combined with Docker-Compose operation

On the basis of docker deployment, you can also deploy some services related to your own services in combination with docker-compose.


**Step 1**

Add dockerfile according to Docker deployment


**Step 2**

The `docker-compose.yml` file is added as follows: (here we simulate our midway project using Redis)

```yaml
version: "3"
services:
  web:
    build: .
    ports:
      -"7001:7001"
    links:
      -redis
  redis:
    image: redis

```


**Step 3: Build**

Use command:

```bash
$docker-compose build
```

**Step 4: Run**

```bash
$docker-compose up -d
```

![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608884158660-02bd2d3c-08b4-4ecc-a4dd-a18d4b9d2c12.png)
So how to use redis, for example, because docker-compose has added a redis and link.

For more details about docker-compose, you can see how to use docker-compose online.



## Single file build deployment

In some scenarios, the project is built as a single file, the deployed file can be smaller, and it can be distributed and deployed more easily. In some scenarios, it is particularly efficient, such as:

- In serverless scenarios, a single file can be deployed faster
- For private scenarios, a single file can be encrypted and confused more easily

Midway supports building projects as a single file starting from v3.

Cases that are not supported are:

- egg project (@midwayjs/web)
- The path form used by `importConfigs` at the entrance imports the configured application, component
- Packages that are not explicitly depended on, or that contain convention-based files



### pre-dependency

Single-file builds have some pre-dependencies that need to be installed.

```bash
## Used to generate entry
$ npm i @midwayjs/bundle-helper --save-dev

## Used to build a single file
## install to the global
$ npm i @vercel/ncc -g
## Or install to project (recommended)
$ npm i @vercel/ncc --save-dev
```



### Code adjustments

There are some possible adjustments, listed below:

#### 1. Configuration format adjustment

The configuration imported by the project must be adjusted to [object mode](./env_config).

Midway's official components have been adjusted to this mode. If you have your own components, please adjust to this mode to build a single file.

:::tip

Both Midway v2/v3 support configuration loading in "object mode".

:::

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { join } from 'path';

import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
   importConfigs: [
     {
       default: DefaultConfig,
       local: LocalConfig
     }
   ]
})
export class MainConfiguration {
}
```



#### 2. The default export situation

Due to the default behavior of the ncc builder, please **DO NOT** use default exports in dependency injection related code.

for example:

```typescript
export default class UserSerivce {
   //...
}
```

After compiling, `UserSerivce` cannot be injected.



#### 3. Data source entities related

Data source-dependent scan paths are also not supported.

```typescript
export default {
   typeorm: {
     dataSource: {
       default: {
         //...
         entities: [
           '/abc', // not supported
         ]
       },
   }
}
```

If there are too many entities, you can write a js file, scan out the entities, generate a file to the directory, and execute it every time you build.



### Modify the entry file

Modify the entry `bootstrap.js` to the following code.

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');

// Explicitly introduce user code as a component
Bootstrap. configure({
   // Here is the compiled entry, local development does not use this file
   imports: require('./dist/index'),
   // Disable directory scanning for dependency injection
   moduleDetector: false,
}).run()

```



### Construct

Compilation for single-file builds requires several steps:

- 1. Build the project ts file into js
- 2. Use an additional compiler to package all js files into one file

We can write the above process as the following two commands, and put them in the `scripts` field of `package.json`.

```json
   "scripts": {
     //...
     "bundle": "bundle && npm run build && ncc build bootstrap.js -o build",
     "bundle_start": "NODE_ENV=production node ./build/index.js"
   },
```

Contains three parts

- `bundle` is to export all project codes as components and generate a `src/index.ts` file, this command is provided by `@midwayjs/bundle-helper`
- `npm run buid` is the basic ts project build, build `src/**/*.ts` to `dist/**/*.js`
- `ncc build bootstrap.js -o build` uses `bootstrap.js` as the entry to build a single file, and finally generates it into `build/index.js`



After writing, execute the command.

```bash
$ npm run bundle
```

:::tip

Note that there may be errors during the construction process, such as ts definition errors, incorrect entry generation syntax, etc., which need to be repaired manually.

:::

After compiling, start the project.

```bash
$ npm run bundle_start
```

If boot access is fine, then you can distribute your build in the build directory.



## Binary deployment

Package Node.js into a single executable file, which can be directly copied and executed during deployment. This method includes the node runtime and business code, which is conducive to the protection of intellectual property rights.

Common tools for packaging Node.js into executable files include `pkg`, `nexe`, `node-packer`, `enclose`, etc. Below we will take the most common `pkg` package as an example.



### pre-dependency

Binary deployment has some pre-dependencies that need to be installed.

```bash
## Used to generate entry
$ npm i @midwayjs/bundle-helper --save-dev

## for building binaries
## install to the global
$ npm i pkg -g
## Or install to project (recommended)
$ npm i pkg --save-dev
```



### Code adjustments

The adjustment is the same as [Single File Build Deployment](./deployment#Single File Build Deployment), please refer to the above document.



### Modify the entry file

The adjustment is the same as [Single File Build Deployment](./deployment#Single File Build Deployment), please refer to the above document.



### Construct

First you need to configure pkg, the main content is in the `bin` and `pkg` fields of `package.json`.

- `bin` we specify as the entry file, ie `bootstrap.js`
- The directory after `pkg.scripts` is built, using glob syntax to include all js files under `dist`
- `pkg.asserts` If there are some static resource files, you can configure them here
- The platform product built by `pkg.targets` is a combination of the following options (in the example I specified mac + node18):
   - **nodeRange** (node8), node10, node12, node14, node16 or latest
   - **platform** alpine, linux, linuxstatic, win, macos, (freebsd)
   - **arch** x64, arm64, (armv6, armv7)
- `pkg.outputPath` is the address of the build product, in order to separate it from the ts output, we chose the build directory



`package.json` reference example:

```json
{
   "name": "my-midway-project",
   //...
   "devDependencies": {
     //...
     "@midwayjs/bundle-helper": "^1.2.0",
     "pkg": "^5.8.1"
   },
   "scripts": {
     //...
     "build": "midway-bin build -c",
     "pkg": "pkg . -d > build/pkg.log",
     "bundle": "bundle && npm run build"
   },
   "bin": "./bootstrap.js",
   "pkg": {
     "scripts": "dist/**/*.js",
     "assets": [],
     "targets": [
       "node18-macos-arm64"
     ],
     "outputPath": "build"
   },
   //...
}

```

For more details, please refer to [PKG Documentation](https://github.com/vercel/pkg).

:::tip

In the above example, the `-d` parameter of the pkg command is to output debugging information to a specific file, which can be deleted by yourself.

:::



Compilation for binary builds requires several steps:

- 1. Generate the `src/index.ts` entry file, and build the project ts file into js
- 2. Use pkg to generate platform-specific build products

We can execute orders.

```bash
$ npm run bundle
$ npm run pkg
```

If it is correct, we can see a `my-midway-project` file in the `build` directory (the `name` field of our `package.json`), double click it to execute.



## Deployment failure

After deployment, the situation is more complicated because it is related to the environment. If you encounter problems after deployment to the server, see [Troubleshoot server startup failure](null).
