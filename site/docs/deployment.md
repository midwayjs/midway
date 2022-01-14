# 启动和部署

Midway 提供了一个轻量的启动器，用于启动你的应用。我们为应用提供了多种部署模式，你既可以将应用按照传统的样子，部署到任意的服务上（比如自己购买的服务器），也可以将应用构建为一个 Serverless 应用，Midway 提供跨多云的部署方式。


## 本地开发


这里列举的主要是本地使用 `dev` 命令开发的方式，有两种。


### 快速启动单个服务


在本地研发时，Midway 在 `package.json` 中提供了一个 `dev` 命令启动框架，比如：
```json
{
	"script": {
    "dev": "midway-bin dev --ts"
  }
}
```
这是一个最精简的命令，他有如下特性：


- 1、使用 `--ts` 指定 TypeScript（ts-node）环境启动
- 2、使用内置的（@midwayjs/mock 的 createApp）创建一个服务，并返回主框架的 app



在命令行运行下面的命令即可执行。
```bash
$ npm run dev
```

## 部署到普通服务器


### 部署后和本地开发的区别


在部署后，有些地方和本地开发有所区别。


**1、node 环境的变化**


最大的不同是，服务器部署后，会直接使用 node 来启动项目，而不是 ts-node，这意味着不再读取 `*.ts` 文件。


**2、加载目录的变化**


服务器部署后，只会加载构建后的 `dist` 目录，而本地开发则是加载 `src` 目录。

|  | 本地 | 服务器 |
| --- | --- | --- |
| appDir | 项目根目录 | 项目根目录 |
| baseDir | 项目根目录下的 src 目录 | 项目根目录下的 dist 目录 |


**3、环境的变化**


服务器环境，一般使用 `NODE_ENV=production` ，很多库都会在这个环境下提供性能更好的方式，例如启用缓存，报错处理等。


**4、日志文件**


一般服务器环境，日志不再打印到项目的 logs 目录下，而是其他不会受到项目更新影响的目录，比如 `home/admin/logs` 等等，这样固定的目录，也方便其他工具采集日志。


### 部署的流程


整个部署分为几个部分，由于 Midway 是 TypeScript 编写，比传统 JavaScript 代码增加了一个构建的步骤，整个部署的过程如下。

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01wSpCuM27pWGTDeDyK_!!6000000007846-2-tps-2212-242.png)
由于部署和平台、环境非常相关，下面我们都将以 Linux 来演示，其他平台可以视情况参考。


### 编译代码和安装依赖


由于 Midway 项目是 TypeScript 编写，在部署前，我们先进行编译。在示例中，我们预先写好了构建脚本，执行 `npm run build` 即可，如果没有，在 `package.json` 中添加下面的 `build` 命令即可。
```json
// package.json
{
  "scripts": {
    "build": "midway-bin build -c"
  },
}
```

:::info
虽然不是必须，但是推荐大家先执行测试和 lint。
:::


一般来说，部署构建的环境和本地开发的环境是两套，我们推荐在一个干净的环境中构建你的应用。


下面的代码，是一个示例脚本，你可以保存为 `build.sh` 执行。

```bash
## 服务器构建（已经下载好代码）
$ npm install                                       # 安装开发期依赖
$ npm run build																			# 构建项目
$ npm prune --production												    # 移除开发依赖

## 本地构建（已经安装好 dev 依赖）
$ npm run build
$ npm prune --production														# 移除开发依赖
```

:::info
一般安装依赖会指定 `NODE_ENV=production` 或 `npm install --production` ，在构建正式包的时候只安装 dependencies 的依赖。因为 devDependencies 中的模块过大而且在生产环境不会使用，安装后也可能遇到未知问题。
:::


执行完构建后，会出现 Midway 构建产物 `dist` 目录。
```bash
➜  my_midway_app tree
.
├── src
├── dist                # Midway 构建产物目录
├── node_modules        # Node.js 依赖包目录
├── test
├── package.json
└── tsconfig.json
```


### 打包压缩


构建完成后，你可以简单的打包压缩，上传到待发布的环境。




### 上传和解压


有很多种方式可以上传到服务器，比如常见的 `ssh/FTP/git` 等。也可以使用 [OSS](https://www.aliyun.com/product/oss) 等在线服务进行中转。


### 启动项目

Midway 构建出来的项目是单进程的，不管是采用 `fork` 模式还是 `cluster` 模式，单进程的代码总是很容易的兼容到不同的体系中，因此非常容易被社区现有的 pm2/forever 等工具所加载，


我们这里以 pm2 来演示如何部署。


项目一般都需要一个入口文件，比如，我们在根目录创建一个 `bootstrap.js` 作为我们的部署文件。
```
➜  my_midway_app tree
.
├── src
├── dist                # Midway 构建产物目录
├── test
├── bootstrap.js        # 部署启动文件
├── package.json
└── tsconfig.json
```


Midway 提供了一个简单方式以满足不同场景的启动方式，只需要安装我们提供的 `@midwayjs/bootstrap` 模块（默认已自带）。

```bash
$ npm install @midwayjs/bootstrap --save
```

然后在入口文件中写入代码，注意，这里的代码使用的是 `JavaScript` 。

```javascript
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
```

虽然启动文件的代码很简单，但是我们依旧需要这个文件，在后续的链路追踪等场景中需要用到。

这个时候，你已经可以直接使用 `NODE_ENV=production node bootstrap.js` 来启动代码了，也可以使用 pm2 来执行启动。

我们一般推荐使用工具使用工具来启动 Node.js 项目，下面有一些文档可以进阶阅读。

- [pm2 使用文档](extensions/pm2)
- [cfork 使用文档](extensions/cfork)


## 使用 Docker 部署

### 编写 Dockerfile，构建镜像


步骤一：在当前目录下新增Dockerfile

```dockerfile
FROM node:12

WORKDIR /app

ENV TZ="Asia/Shanghai"

COPY . .

# 如果各公司有自己的私有源，可以替换registry地址
RUN npm install --registry=https://registry.npm.taobao.org

RUN npm run build

# 如果端口更换，这边可以更新一下
EXPOSE 7001

CMD ["npm", "run", "online"]
```


步骤二: 新增 `.dockerignore` 文件（类似 git 的 ignore 文件），可以把 `.gitignore`  的内容拷贝到 `.dockerignore` 里面


步骤三：当使用 pm2 部署时，请将命令修改为 `pm2-runtime start` ，pm2 行为请参考 [pm2 容器部署说明](https://www.npmjs.com/package/pm2#container-support)。


步骤四：构建 docker 镜像

```bash
$ docker build -t helloworld .
```

步骤五：运行 docker 镜像

```bash
$ docker run -itd -P helloworld
```

运行效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608882492099-49160b6a-601c-4f08-ba65-b95a1335aedf.png#height=33&id=BtUCB&margin=%5Bobject%20Object%5D&name=image.png&originHeight=45&originWidth=1024&originalType=binary&ratio=1&size=33790&status=done&style=none&width=746)

然后大写的 `-P` 由于给我们默认分配了一个端口，所以我们访问可以访问 `32791`  端口（这个 `-P` 是随机分配，我们也可以使用 `-p 7001:7001` 指定特定端口）

![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608882559686-031bcf0d-2185-42cd-a838-80f008777395.png#height=94&id=dfag9&margin=%5Bobject%20Object%5D&name=image.png&originHeight=188&originWidth=578&originalType=binary&ratio=1&size=24488&status=done&style=none&width=289)

关于别的推送到 dockerhub 或者 docker 的 registry，可以大家搜索对应的方法。


**优化**

我们看到前面我们打出来的镜像有1个多G，可优化的地方：
- 1、我们可以采用更精简的 docker image 的基础镜像：例如 node:12-alpine，
- 2、其中的源码最终也打在了镜像中，其实这块我们可以不需要。

我们可以同时结合 docker 的 multistage 功能来做一些优化，这个功能请注意要在 `Docker 17.05` 版本之后才能使用。


```dockerfile
FROM node:12 AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM node:12-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/bootstrap.js ./
COPY --from=build /app/package.json ./

RUN apk add --no-cache tzdata

ENV TZ="Asia/Shanghai"

RUN npm install --production

# 如果端口更换，这边可以更新一下
EXPOSE 7001

CMD ["npm", "run", "start"]
```

当前示例的结果只有 `207MB`。相比原有的 `1.26G` 省了很多的空间。

### 结合 Docker-Compose 运行

在 docker 部署的基础上，还可以结合 docker-compose 部署一些跟自己服务相关的服务。


**步骤一**

按照 Docker 方式部署的方式新增 dockerfile


**步骤二**

新增 `docker-compose.yml` 文件，内容如下：（此处我们模拟我们的 midway 项目需要使用redis）

```yaml
version: "3"
services:
  web:
    build: .
    ports:
      - "7001:7001"
    links:
      - redis
  redis:
    image: redis

```


**步骤三：构建**

使用命令：

```bash
$ docker-compose build
```

**步骤四：运行**

```bash
$ docker-compose up -d
```

![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608884158660-02bd2d3c-08b4-4ecc-a4dd-a18d4b9d2c12.png#height=44&id=jWw4i&margin=%5Bobject%20Object%5D&name=image.png&originHeight=62&originWidth=1054&originalType=binary&ratio=1&size=47727&status=done&style=none&width=746)
那么redis比如怎么用，因为 docker-compose 里面加了一个 redis，并且 link 了，所以我们代码里面如下写：


在 service 目录下添加 `redis.service.ts` 文件，代码如下：

```typescript
import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator";
import * as Redis from 'ioredis'

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService{
  redis: Redis.Redis = null;

  @Init()
  async init(){
    this.redis = new Redis({
      host: 'redis'
    });
  }

  async setValue(key, value){
    return await this.redis.set(key, value);
  }

  async getValue(key){
    return await this.redis.get(key);
  }
}
```

然后在 `controller/home.ts` 里面添加一个接口如下：

```typescript
import { Controller, Get, Inject } from '@midwayjs/decorator';
import { RedisService } from '../service/redis.service';

@Controller('/')
export class HomeController {

  @Inject()
  redisService: RedisService;

  @Get('/')
  async home() {
    let res = await this.redisService.getValue("foo")
    return 'Hello Midwayjs!' + res;
  }

  @Get("/update")
  async update(){
    let res = await this.redisService.setValue("foo", "hello world");
    return res;
  }
}
```

这个代码比较好理解，相当于访问 `127.0.0.1:7001/update` 接口，会去调用 redisService 新增一个 key，对应的 value 为 hello world。

然后访问 `127.0.0.1:7001`  ，会调用 redisService 获取 key 为 foo 的值，并返回给页面。

如下：

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01Zrvj3E1p61qFBz95H_!!6000000005310-2-tps-686-184.png)

关于更多关于 docker-compose 的详情，可以查看网上关于 docker-compose 的使用方法。
