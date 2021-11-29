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

|  | **本地** | **服务器** |
| --- | --- | --- |
| appDir | 项目根目录 | 项目根目录 |
| baseDir | 项目根目录下的 src 目录 | 项目根目录下的 dist 目录 |
|  |  |  |

**3、环境的变化**


服务器环境，一般使用 `NODE_ENV=production` ，很多库都会在这个环境下提供性能更好的方式，例如启用缓存，报错处理等。


**4、日志文件**


一般服务器环境，日志不再打印到项目的 logs 目录下，而是其他不会受到项目更新影响的目录，比如 `home/admin/logs` 等等，这样固定的目录，也方便其他工具采集日志。


### 部署的流程


整个部署分为几个部分，由于 Midway 是 TypeScript 编写，比传统 JavaScript 代码增加了一个构建的步骤，整个部署的过程如下。


![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1607238098956-563e8219-182d-4494-b9b4-311745be32f2.png#height=121&id=WtwR3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=242&originWidth=2212&originalType=binary&ratio=1&size=51328&status=done&style=none&width=1106)
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


### 启动方式一：使用纯 Node.js 或者 pm2 等工具启动


Midway 构建出来的项目是单进程的，不管是采用 `fork` 模式还是 `cluster` 模式，单进程的代码总是很容易的兼容到不同的体系中，因此非常容易被社区现有的 pm2/forever 等工具所加载，


我们这里以 pm2 来演示如何部署。


项目一般都需要一个入口文件，比如，我们在根目录创建一个 `bootstrap.js` 作为我们的部署文件。
```
➜  my_midway_app tree
.
├── src
├── dist                # Midway 构建产物目录
├── test
├── bootstrap.js						# 部署启动文件
├── package.json
└── tsconfig.json
```


Midway 提供了一个简单方式以满足不同场景的启动方式，只需要安装我们提供的 `@midwayjs/bootstrap` 模块。
```bash
$ npm install @midwayjs/bootstrap --save
```
然后在入口文件中写入代码，注意，这里的代码使用的是 `JavaScript` 。
```javascript
// 获取框架
const WebFramework = require('@midwayjs/web').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({
  port: 7001
});

const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载框架并执行
Bootstrap
  .load(web)
  .run();
```
我们提供的每个上层框架都将会导出一个 `Framework` 类，而 `Bootstrap` 的作用则是加载这些框架，传入启动参数，运行他们。


:::info
启动参数，你可以在不同的框架处查询到。
:::


这个时候，你已经可以直接使用 `NODE_ENV=production node bootstrap.js` 来启动代码了，也可以使用 pm2 来执行启动。


pm2 启动可以参考 [pm2 使用文档](pm2)。


如果你希望把 `bootstrap.js` 文件放到不同的目录，比如 `bin/bootstrap.js` ，你可以修改 Bootstrap 的参数。


```javascript
// bin/bootstrap.js
const { join } = require('path');

// 获取框架
const WebFramework = require('@midwayjs/web').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({
  port: 7001
});

const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载框架并执行
Bootstrap
	.configure({
		appDir: join(__dirname, '../')
	})
  .load(web)
  .run();
```






### 启动方式二：EggJS 特有的启动形式


由于 EggJS 提供了默认的多进程部署工具 `egg-scripts` ，Midway 也继续支持这种方式，如果上层是 EggJS，推荐这种部署方式。


首先在依赖中，确保安装 `egg-scripts` 包和 `midway` 包。
```bash
$ npm i egg-scripts --save
```
添加 `npm scripts` 到 `package.json`：


在上面的代码构建之后，使用我们的 `start` 和 `stop` 命令即可完成启动和停止。
```json
"scripts": {
	"start": "egg-scripts start --daemon --title=********* --framework=@midwayjs/web",
	"stop": "egg-scripts stop --title=*********",
}
```
:::info
`*********` 的地方是你的项目名。
:::


> 注意：`egg-scripts` 对 Windows 系统的支持有限，参见 [#22](https://github.com/eggjs/egg-scripts/pull/22)。

####
**启动参数**
```bash
$ egg-scripts start --port=7001 --daemon --title=egg-server-showcase
```


如上示例，支持以下参数：

- `--port=7001` 端口号，默认会读取环境变量 process.env.PORT，如未传递将使用框架内置端口 7001。
- `--daemon` 是否允许在后台模式，无需 nohup。若使用 Docker 建议直接前台运行。
- `--env=prod` 框架运行环境，默认会读取环境变量 process.env.EGG_SERVER_ENV， 如未传递将使用框架内置环境 prod。
- `--workers=2` 框架 worker 线程数，默认会创建和 CPU 核数相当的 app worker 数，可以充分的利用 CPU 资源。
- `--title=egg-server-showcase` 用于方便 ps 进程时 grep 用，默认为 egg-server-${appname}。
- `--framework=yadan` 如果应用使用了[自定义框架](https://eggjs.org/zh-cn/advanced/framework.html)，可以配置 package.json 的 egg.framework 或指定该参数。
- `--ignore-stderr` 忽略启动期的报错。
- `--https.key` 指定 HTTPS 所需密钥文件的完整路径。
- `--https.cert` 指定 HTTPS 所需证书文件的完整路径。
- 所有 [egg-cluster](https://github.com/eggjs/egg-cluster) 的 Options 都支持透传，如 --port 等。



更多参数可查看 [egg-scripts](https://github.com/eggjs/egg-scripts) 和 [egg-cluster](https://github.com/eggjs/egg-cluster) 文档。


:::info
使用 egg-scripts 部署的日志会存放在 **用户目录 **下**，**比如 `/home/xxxx/logs` 。
:::


## 部署为 Serverless 应用


Midway 可以将现有的 Web 项目部署为 Serverless 应用，这里以部署到阿里云函数计算作为示例。


### 部署到 Serverless 环境


1、添加 `f.yml` 文件到你的项目根目录。
```
➜  my_midway_app tree
.
├── src
├── dist
├── f.yml  								# Midway Serverless 部署配置文件
├── package.json
└── tsconfig.json
```
```yaml
service: my-midway-app  ## 应用发布到云平台的名字，一般指应用名

provider:
  name: aliyun        ## 发布的云平台，aliyun，tencent 等

deployType: egg       ## 部署的应用类型
```
应用类型选项如下：

|  |  |  |
| --- | --- | --- |
| @midwayjs/web 项目 | egg |  |
| @midwayjs/experss 项目 | express |  |
| @midwayjs/koa 项目 | koa |  |

2、添加发布时的构建钩子


在 `package.json` 加入下面的这段，用于在发布时自动执行 `npm run build` 。
```json
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"scripts": {
  	"deploy": "midway-bin deploy"
  },
  "egg":{
    "framework": "@midwayjs/web"
  }
```
:::info
如果使用了自己的 egg 上层框架，这里的 egg.framework 可以变为自己的包名。
:::


3、执行 `npm run deploy` 即可，发布后，阿里云会输出一个临时可用的域名，打开浏览器访问即可。
![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#height=193&id=s5j4s&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&originalType=binary&ratio=1&size=35152&status=done&style=none&width=1219)
如需更详细的发布文档，请查阅 [**Serverless 发布 FAQ**](https://www.yuque.com/midwayjs/faas/deploy_aliyun_faq)。


### 部署到 Serverless 平台的限制


- 1、不支持 egg-socketio 等网关**不支持的协议**
- 2、不支持 **文件上传 **等网关无法支持的能力
- 3、不支持 **定时任务**（可以使用组合 Timer 触发器的方式）
- 3、还有一些，请参考 [**应用迁移 faq**](https://www.yuque.com/midwayjs/faas/migrate_faq)



如需发布到腾讯云环境，请查看 [**发布到腾讯云**](deploy_to_tencent)。


另外这里还有一些 [**常见问题**](deploy_aliyun_faq)，请查阅。


## 使用 Docker 部署
### 编写 Dockerfile，构建镜像


步骤一：在当前目录下新增Dockerfile:
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


步骤三：package.json 文件的 scripts 里面新增 online，对比 start，把 `--daemon` 去掉。如下图
![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608881958246-5b5da75e-2f60-4582-81b8-1b0645c91bd7.png#height=39&id=SeRTA&margin=%5Bobject%20Object%5D&name=image.png&originHeight=55&originWidth=904&originalType=binary&ratio=1&size=92433&status=done&style=none&width=634)


这里使用的是 egg-scripts 部署，当使用 pm2 部署时，请将命令修改为 `pm2-runtime start` ，pm2 行为请参考 [pm2 容器部署说明](https://www.npmjs.com/package/pm2#container-support)。


步骤四：构建docker镜像
```bash
$ docker build -t helloworld .
```


步骤五：运行docker镜像
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
1、我们可以采用更精简的docker image 的基础镜像：例如node:12-alpine，
2、其中的源码最终也打在了镜像中，其实这块我们可以不需要。


然后我们同时结合docker的multistage功能，这个功能请注意要在Docker 17.05版本之后才能使用。


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
然后我们看到结果只有207MB。相比原有的1.26G省了很多的空间。
### 结合 Docker-Compose 运行


在 docker 部署的基础上，还可以结合 docker-compose 部署一些跟自己服务相关的服务。


**步骤一**
****

按照 Docker 方式部署的方式新增 dockerfile


**步骤二**
****

新增docker-compose.yml文件，内容如下：（此处我们模拟我们的midway项目需要使用redis）

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

这个代码比较好理解，相当于访问 `127.0.0.1:7001/update` 接口，会去调用 redisService 新增一个 key，对应的 value 为 hello world


然后访问 `127.0.0.1:7001`  ，会调用redisService获取key为foo的值，并返回给页面。

如下：

![image.png](https://cdn.nlark.com/yuque/0/2020/png/187105/1608886309353-2a65279f-8164-45c0-ab41-a759d31f1492.png#height=92&id=APR77&margin=%5Bobject%20Object%5D&name=image.png&originHeight=184&originWidth=686&originalType=binary&ratio=1&size=26724&status=done&style=none&width=343)

关于更多关于 docker-compose 的详情，可以查看网上关于 docker-compose 的使用方法。
