# Midway Faas

## Getting started

Serverless CLI v1.26.1+. You can get it by running:

```shell script
npm i -g serverless
```

## Example

You can install the following example:

### For Aliyun Fc

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/aliyun
```

### For Tencent SCF

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/scf
```

### Bootstrap

Install npm dependencies.

```shell script
$ npm i
```

## Usage

### Local invoke & debug

```shell script
serverless invoke -f index

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

#### for aliyun

阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`

![](https://gw.alicdn.com/tfs/TB1EPINp.H1gK0jSZSyXXXtlpXa-1152-514.png)

相关配置获取，可参照下方图片（可点击跳转）：

<a href="https://account.console.aliyun.com/#/secure" >![](https://gw.alicdn.com/tfs/TB1QoQapV67gK0jSZPfXXahhFXa-1832-696.png)</a>

<a href="https://usercenter.console.aliyun.com/#/manage/ak" target="_blank">![](https://gw.alicdn.com/tfs/TB1LgQPp1L2gK0jSZFmXXc7iXXa-2406-592.png)</a>