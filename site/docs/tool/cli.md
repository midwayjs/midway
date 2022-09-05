---
title: midwayjs/cli
---
`@midwayjs/cli` 是新版本的 Midway 体系工具链，和 Serverless，以及原应用的工具链进行了整合。


## 基础入口

`@midwayjs/cli` 提供了两个入口命令。 `midway-bin` 和 `mw` 命令。

当 `@midwayjs/cli` 安装到全局时，一般使用 `mw` 命令，比如 `mw dev` 。当安装到项目中，做 cli 工具时，我们一般使用 `midway-bin` 命令，但是请记住，这两个命令是相同的。



## dev 命令

以当前目录启动本地开发命令。

```bash
$ mw dev
  --baseDir          应用目录，一般为 package.json 所在文件夹，默认为 process.cwd()
  --sourceDir        ts代码目录，默认会自动分析
  -p, --port         dev侦听的端口，默认为 7001
  --ts							 TS模式运行代码
  --fast             极速模式
  --framework        指定框架，默认会自动分析
  -f, --entryFile    指定使用入口文件来启动 bootstrap.js
  --watchFile        更多的文件或文件夹修改侦听
  --notWatch         代码变化时不自动重启
```

### **标准启动**

```bash
$ midway-bin dev --ts
```

### **修改启动端口**

针对 HTTP 场景， `-p` 或者 `--port` 可以临时修改端口。

```bash
$ midway-bin dev --ts --port=7002
```

### **修改启动路径**

指定应用根目录，一般为 package.json 所在文件夹，默认为 process.cwd()

```shell
$ midway-bin dev --ts --baseDir=./app
```

### **修改ts源码路径**

指定ts代码目录，默认会自动分析

```shell
$ midway-bin dev --ts --sourceDir=./app/src
```

### **更快的启动方式**

默认的启动方式为 ts-node，在文件数量特别多的情况下会比较慢，可以切换为 swc 等新的编译方式。

```shell
// 使用 ts-node 的快速dev模式
$ midway-bin dev --ts --fast 

// 使用 swc 的快速dev模式
$ midway-bin dev --ts --fast=swc
```

### 监听文件变化

`--watchFile` 用于指定更多的文件或文件夹修改侦听，默认侦听 `sourceDir` 目录中 `.ts`、`.yml`和 `.json`结尾的文件（可通过 --watchExt 参数指定更多扩展名），以及 `baseDir` 目录中的 `f.yml` 文件

```shell
// 指定多个文件，使用英文逗号分隔
$ midway-bin dev --ts --watchFile=./a.txt,./b.txt

// 指定多个文件夹和文件，使用英文逗号分隔
$ midway-bin dev --ts --watchFile=./test,./b.txt
```


- `--watchExt`：指定更多的侦听文件扩展名，默认为  `.ts`、`.yml`和 `.json`

```shell
// 指定多个文件扩展名，使用英文逗号分隔
midway-bin dev --ts --watchExt=.js,.html
```


### 本地单步Debug调试

 `--debug` 参数启动 debug 模式，可以通过 `chrome devtools` 进行单步代码调试：

![69456694-513D-4388-B52F-001562D4A520.png](https://cdn.nlark.com/yuque/0/2021/png/128621/1635994136312-f1eda8ba-165d-4322-82b8-b21d3b9c6beb.png#clientId=u32db4720-b7d0-4&crop=0&crop=0&crop=1&crop=1&from=ui&height=177&id=z4u1f&margin=%5Bobject%20Object%5D&name=69456694-513D-4388-B52F-001562D4A520.png&originHeight=666&originWidth=1538&originalType=binary&ratio=1&rotation=0&showTitle=false&size=276022&status=done&style=none&taskId=ud161d835-1e96-4246-8061-c795e9a0ff1&title=&width=409)
您可以通过 `chrome://inspect/` 打开 `nodejs devtools` 进行断点调试：

![image.png](https://cdn.nlark.com/yuque/0/2021/png/128621/1635995391144-a9ec0d4a-c6fb-4638-a292-615a3588d33d.png#clientId=u069cda7c-313b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=236&id=u4986bfa4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1948&originalType=binary&ratio=1&rotation=0&showTitle=false&size=572568&status=done&style=none&taskId=u07555349-8e09-42b2-bd94-f93160b0431&title=&width=488)

![image.png](https://cdn.nlark.com/yuque/0/2021/png/128621/1635995418427-282d256a-de65-4eba-9a83-b474d3d74f9f.png#clientId=u069cda7c-313b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=445&id=u83271ad1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1280&originWidth=2280&originalType=binary&ratio=1&rotation=0&showTitle=false&size=710504&status=done&style=none&taskId=uc2614db9-dea9-48d7-b87d-8cb608c8770&title=&width=792)
您也可以直接通过 chrome 浏览器打开命令行中输出的 `devtools` 协议的链接，给对应代码添加断点后调试：

![10016148-385E-46A4-8B3A-0A0110BECD18.png](https://cdn.nlark.com/yuque/0/2021/png/128621/1635994137067-f663409a-483d-41f5-bc86-4798182edb38.png#clientId=u32db4720-b7d0-4&crop=0&crop=0&crop=1&crop=1&from=ui&height=135&id=GooAh&margin=%5Bobject%20Object%5D&name=10016148-385E-46A4-8B3A-0A0110BECD18.png&originHeight=950&originWidth=2878&originalType=binary&ratio=1&rotation=0&showTitle=false&size=744085&status=done&style=none&taskId=u892d9925-9206-4946-a1ed-cb6043c557d&title=&width=409)

如果您使用 `vscode` ，那么您可以使用 vscode 的 js debug terminal，在其中执行 dev 命令（无需添加 `--debug` 参数）启动就可以打断点调试了。![image.png](https://cdn.nlark.com/yuque/0/2021/png/128621/1625237917317-8e7bf448-fded-4bc7-b743-6aade0ebcba2.png#clientId=u7c8a3183-c32b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=650&id=u75e3aec7&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1300&originWidth=2868&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1140427&status=done&style=none&taskId=ubcffa6c8-02eb-4256-ba7e-7ab3128c1ee&title=&width=1434)


## test 命令

以当前目录启动测试，默认使用 jest 工具，可以使用 --mocha 参数指定使用 mocha。

```bash
$ midway-bin test --ts
  -c, --cov    获取代码测试覆盖率
  -f, --file   指定测试文件，例如 ./test/index.test.ts
  --ts				 TS模式运行单测
  --forceExit  jest forceExit
  --runInBand  jest runInBand
  -w, --watch  watch模式
  --mocha			 使用 mocha 进行单测
```

使用 mocha 进行单测时，需要手动安装 `mocha` 和 `@types/mocha` 两个依赖到 `devDependencies` 中：`npm i mocha @types/mocha -D` 。

:::info
如果项目中使用了 TypeScript 的 path alias，请参考：[测试](../testing#配置-alias-paths)
:::




## cov 命令

以当前目录启动测试，并输出覆盖率信息，默认使用 jest 工具，可以使用 --mocha 参数指定使用 mocha。

```bash
$ midway-bin cov --ts
```

当使用 mocha 进行单测覆盖率时，您需要安装以下额外依赖。

```bash
$ npm i mocha @types/mocha nyc --save-dev
```




## check 命令
自动分析代码中存在的问题，并给出修复建议。

```bash
$ midway-bin check
```

目前已提供 `32` 项问题的校验。




## build 命令

使用 mwcc（tsc）进行 ts 代码编译，适用于标准项目，Serverless 项目请使用 package。


```bash
$ midway-bin build -c

  -c, --clean    清理构建结果目录
  --srcDir       源代码目录，默认 src
  --outDir       构建输出目录，默认为 tsconfig 中的 outDir 或 dist 
  --tsConfig     tsConfig json 字符串或文件位置
  --buildCache	 保留构建缓存
```




## deploy 命令

适用于 Serverless 项目发布到 Aliyun FC、Tencent SCF、Aws Lambda 等运行时。

执行 deploy 命令会自动执行 package。


```bash
$ midway-bin deploy

  -y, --yes     		 发布的确认都是yes
  --resetConfig			 重置发布配置，AK/AK/Region等
  --serverlessDev    使用 Serverless Dev 进行aliyun fc函数发布，目前默认为 funcraft
  ...兼容package命令的所有参数
```



#### 函数发布时域名配置

在 `f.yml` 中配置 `custom.customDomain` 为 `auto` ，则在发布时会配置一个临时的自动域名：

```yaml
custom:
     customDomain: auto
```

如果要取消自动的域名，将 `customDomain` 改为 `false`：

```yaml
custom:
    customDomain: false
```

如果有自定义域名，在 `customDomain` 中配置即可：

```yaml
custom:
	customDomain:
    domainName: test.example.com
```

如果自定义的域名，需要使用 https，那么在 云控制台 配置好 https 证书之后，需要将 customDomain 设置为 false，避免下次发布时重置成 http：

```cpp
custom:
	customDomain: false
```



#### 每个路由都部署成了一个函数
可以使用高密度方案，合并成一个函数，f.yml 加如下配置

```cpp
aggregation:
  main:
    functionsPattern:
      - '*'
```


#### 

#### aliyun 发布 AK 错误问题
在第一次进行aliyun发布或使用 `--resetConfig`参数的时候都可以重置 ak。

不过要注意的是每次 ak 都会默认创建一个新的 `access` 分组，在修改配置时会自动生成分组名，如果要覆盖之前的 AK 需要手动输入，如图：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/128621/1645609990378-8a7f92c0-bda4-46e0-93a6-4d6feb6ec66d.png#clientId=u9f50c864-5385-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=122&id=u8a756167&margin=%5Bobject%20Object%5D&name=image.png&originHeight=122&originWidth=693&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17245&status=done&style=none&taskId=u3b825703-abe6-4a2b-ae5f-86a88027cf8&title=&width=693)

发布时默认使用的分组为 `default`，如果您在修改配置时如上图使用了 `default-2`，那么需要在发布的时候通过 `--access`参数指定使用 `default-2`：

```cpp
midway-bin deploy --access=default-2
```



## package 命令

适用于 Serverless 项目构建

```bash
$ midway-bin package
  --npm     		 		 npm client，默认为自动识别添加registry
  --sourceDir				 源代码所在目录，默认会自动分析
  --buildDir				 构建结果目标目录
  --sharedTargetDir	 共享文件目标目录，默认为static，参考 --sharedDir 参数
  --sharedDir				 构建时会拷贝此目录到结果目录内的 $sharedTargetDir 目录
  --skipZip					 跳过zip打包
  --skipBuild				 跳过ts代码构建
  --tsConfig    		 tsConfig json 字符串或文件位置
  --function				 指定打包哪几个函数，多个使用英文 , 分隔
```


#### 参数详解

- `--function`：指定打包哪几个函数，多个函数使用英文 , 分隔

```shell
// 打包
midway-bin package --function=a,b,c

// 发布
midway-bin deploy --function=a,b,c
```




#### 函数构建打包时文件拷贝逻辑

默认拷贝的内容包含 `后端代码文件夹` （一般为 `src` 、faas前后端一体化一般为 `src/apis`）内的所有非 `.ts` 后缀的文件，以及 `项目根目录` 下的以 `.js`、`.json`、`.yml` 为扩展名的所有文件和 `config` 、`app` 文件夹内的所有文件。

如果要拷贝额外的文件，可以通过在 `f.yml` 文件中添加 `package`字段 中的 `include` 来指定，可以配置文件名，也可以通过 `fast-glob` [语法↗](https://github.com/mrmlnc/fast-glob#pattern-syntax) 匹配，使用示例如下：

```cpp
# ...已省略其他属性的展示

package:
  include:			# 通过 include 属性指定额外打包文件配置
    - static 		# 项目根目录下的 static 文件夹
    - a.json 		# 项目根目录下的 a.json 文件
    - a/b/c.js		# 项目根目录下的 a 目录下的 b 目录下的 c.js 文件
    - a/b/c.json	# 项目根目录下的 a 目录下的 b 目录下的 c.js 文件
    - xxx/**/*.js	# 项目根目录下的 xxx 目录下的所有 js 文件
```



## 实验性功能

在 `f.yml` 中通过 `experimentalFeatures` 配置开启实验性功能

### 1. ignoreTsError
在构建时忽略ts error，不中断构建过程。
```yaml
experimentalFeatures:
	ignoreTsError: true
```


### 2. removeUselessFiles
在构建时移除大量无效文件，例如 `LICENSE`、`*.ts.map`、`**/test/` 等文件，可以有效减少构建包尺寸。
```yaml
experimentalFeatures:
	removeUselessFiles: true
```



### 3. fastInstallNodeModules
在构建时从当前的 devDependencies 中挑选出 production 依赖进行发布，可能会显著提升发布速度。

```yaml
experimentalFeatures:
	fastInstallNodeModules: true
```



## CLI 扩展

### 1. 生命周期扩展

用户可以在 `package.json` 中添加 `midway-integration` 字段来根据各个命令的生命周期扩展 cli 的行为。

比如，在 package 命令 `installDevDep` 的后面添加自定义逻辑：


```bash
{
	"midway-integration": {
  	"lifecycle": {
    	"after:package:installDevDep": "npm run build"
    }
  }
}
```

其中 `lifecycle` 的格式为 `${ 'before' | 'after' | '' }:${ 命令 }:${ 命令生命周期 }` 。

package命令的声明周期列表：

```bash
 'cleanup', // 清理构建目录
 'installDevDep', // 安装开发期依赖
 'copyFile', // 拷贝文件: package.include 和 shared content
 'compile', //
 'emit', // 编译函数  'package:after:tscompile'
 'analysisCode', // 分析代码
 'copyStaticFile', // 拷贝src中的静态文件到dist目录，例如 html 等
 'checkAggregation', // 检测高密度部署
 'generateSpec', // 生成对应平台的描述文件，例如 serverless.yml 等
 'generateEntry', // 生成对应平台的入口文件
 'installLayer', // 安装layer
 'installDep', // 安装依赖
 'package', // 函数打包
 'finalize', // 完成
```




### 2. 通过插件进行扩展

用户可以自己编写 cli 插件，通过插件来实现更为复杂的 cli 的行为，也可以添加自定义命令。
目前支持两种插件：

- npm 插件，插件是一个npm包
- local 插件，插件在本地位置
- 


通过在 f.yml 文件中配置 `plugins` 字段使 cli 加载插件：

```yaml
plugins:
  - npm::test-plugin-model
  - local::./test/plugin
```

plugin 配置格式为： `${ 'npm' | 'local' }:${ provider || '' }:${ pluginName || path }` 

插件的代码参考：

```typescript
// src/index.ts

import { BasePlugin } from '@midwayjs/command-core';

export class TestLalalaPlugin extends BasePlugin {
  commands = {
    lalala: {
      usage: '自定义命令',
      lifecycleEvents: [
        'a', // 自定义生命周期
        'b',
      ],
      // 暂无
      options: {
        name: {
          usage: '参数 name, 例如: mw lalala --name=123',
          shortcut: 'n', // 参数缩写
        },
      },
    },
  };

  hooks = {
    // 添加当前插件内的命令生命周期扩展
    // lalala 命令的 a 生命周期
   	'lalala:a': async () => {

      // 输出
    	this.core.cli.log('lalala command hook');
      
      // 获取用户输入的参数
      this.core.cli.log(this.core.options);
      
      // f.yml 内容
      this.core.cli.log(this.core.service);
      
      // 仅在 -V 参数下输出的内容
      this.core.debug('lalala');
    },

    // 添加其他插件内的命令生命周期扩展
    // 在 package 命令的  copyFile 生命周期 “之前” 执行
    'before:package:copyFile': async () => {
    	console.log('package command hook');
    },
    
  };
}
```
