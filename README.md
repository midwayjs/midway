# Midway Faas

## Getting started

> 国内用户建议使用 `cnpm` 加速npm，`npm install -g cnpm --registry=https://registry.npm.taobao.org`

Serverless CLI v1.26.1+. You can get it by running:

```shell script
npm i -g serverless
```

## 快速开始

### 第一步：创建项目

#### For 阿里云 fc 

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/aliyun
```

#### For 腾讯云 scf

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/scf
```

### 第二步：进入目录

#### For 阿里云 fc 

```shell script
$ cd aliyun
```

#### For 腾讯云 scf

```shell script
$ cd scf
```

### 第三步：安装npm依赖

Install npm dependencies.

```shell script
$ npm i
```

## 如何使用

### 本地调用 & 本地调试

```shell script
serverless invoke -f index

// debug 需要 node 10.15 +
serverless invoke -f index --debug
```

| option | explain |
| -- | -- |
| -f / --function funcName| Specifies the function name to call |
| --debug=debugPort?| Enable step debugging and specifies debug port，default port is 9229 |


### package to zip file

```shell script
serverless package
```

| option | explain |
| -- | -- |
| --package | Specify the package file(zip) address, e.g. `--package=dist` |
| --npm=npmName| Specify the npm mirror, e.g. `--npm=cnpm` |
| --skipZip | Package result does not generate zip package |

### deploy to online

```shell script
serverless deploy
```

Support all `package` options.

| option | explain |
| -- | -- |
| --resetConfig | use new account |

#### for aliyun

阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`

![](https://gw.alicdn.com/tfs/TB1EPINp.H1gK0jSZSyXXXtlpXa-1152-514.png)

相关配置获取，可参照下方图片（可点击跳转）：

<a href="https://account.console.aliyun.com/#/secure" target="_blank">![](https://gw.alicdn.com/tfs/TB1QoQapV67gK0jSZPfXXahhFXa-1832-696.png)</a>

<a href="https://usercenter.console.aliyun.com/#/manage/ak" target="_blank">![](https://gw.alicdn.com/tfs/TB1LgQPp1L2gK0jSZFmXXc7iXXa-2406-592.png)</a>

#### For Tencent SCF

1. 用户信息认证：
    - 腾讯云在部署时，如果是首次部署，则控制台会展示相应二维码，扫码即可完成认证，后续会默认复用该配置
    - 后续如想修改部署时的使用的用户，可手动在 serverless.yml 中设置当前用户的认证信息，教程：https://cloud.tencent.com/document/product/1154/38811
2. 部署网关设置
    - 腾讯云在部署时，会为函数默认创建网关触发器
    - 如果想避免重复创建，可按下列教程操作


发布完成后，控制台会默认显示腾讯云此次创建的网关 serviceId（如下图所示）
![](https://gw.alicdn.com/tfs/TB1OqwRp7L0gK0jSZFtXXXQCXXa-2670-410.png)
        
此时需要修改 serverless.yml 的配置文件，serviceId 可以配在以下两处：

1. provider

此处配置则对**所有函数生效**，所有函数共享一个网关 serviceId

```yaml
provider:
  name: tencent
  runtime: Nodejs8.9
  serviceId: <控制台返回的 ServiceId>
```

2. events/http

此处配置则对**指定函数生效**

```yaml
functions:
  index:
    initializer: index.initializer
    handler: index.handler
    events:
      - http:
          method: get
          serviceId: <控制台返回的 ServiceId>
```
