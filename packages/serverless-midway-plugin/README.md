# `serverless-midway-plugin`

## invoke 调用函数

### 如何本地测试使用？
安装serverless框架 `npm i serverless -g`
进入到 `/test/invoke` 目录，执行 `serverless invoke -f index`

调用函数的流程：
1. 触发默认provider的invoke:invoke
  在其中判断是否为本地，如果不是本地调用则跳过
2. 判断provider是否与 serverless.yml 中的provider一致
  判断是否为远程调用，如果不是则跳过

### 参数

#### f(function) 指定调用函数
```shell
> serverless invoke -f index
```

#### remote 远程调用
默认为本地调用
```shell
> serverless invoke -f index --remote
```

## package 打包

### 如何本次测试使用？
安装serverless框架 `npm i serverless -g`
进入到 `/test/deployAliyun` 目录，执行 `serverless package`


### 打包函数的流程
  'midway-cleanup',
  'midway-compileFunctions',
  'midway-spec',
  'midway-wrapper',
  'midway-copyFile',
  'midway-layerInstall',
  'midway-depInstall',
  'midway-package',
  'midway-finalize'
支持 `--npm=cnpm` 参数来指定npm镜像加速打包

1. midway-cleanup
  清理函数构建目录
  确保函数构建目录存在
  支持 `--skipClean=true` 参数跳过清理目录
1. midway-spec
  生成对应平台的spec描述文件
1. midway-wrapper
  生成对应平台的handler包裹文件
1. midway-copyFile
  拷贝文件到待打包目录
  主要是在 `serverless.yml` 的 `package.include` 中指定的文件及文件夹列表
  默认会将 `package.json` 文件进行拷贝

1. midway-layerInstall
  安装layer
1. midway-depInstall
  安装`全局的依赖列表(globalDependencies)`进行依赖安装
  按照`package.json`中的`dependencies`进行依赖安装
  按照`package.json`中的`localDependencies`安装本地依赖
    ```json
      {
        "localDependencies": {
          "@midwayjs/rumtime": "../../faas"
        }
      }
    ```
  等价于 `Object.assign({}, pkg.dependencies, globalDependencies, pkg.localDependencies);`
1. midway-compileFunctions
  函数编译，主要是typescript编译，支持使用 `--ncc=true` 参数使用ncc打包为一个文件
1. midway-package
  打包生成zip文件
  支持 `--skipZip=true` 参数跳过构建生成zip包
1. midway-finalize
  打包结束

## deploy 部署
### 如何本次测试使用？
1. 需要先进入 `../faas` 、`../runtime-engine`、`../serverless-scf-starter` 和 `../serverless-fc-starter` 目录分别执行 `npm install --production`
2. 安装serverless框架 `npm i serverless -g`
3. 如果部署到阿里云：进入到 `/test/deployAliyun` 目录，执行 `serverless deploy`
3. 如果部署到腾讯云：进入到 `/test/deployTencent` 目录，执行 `serverless deploy`