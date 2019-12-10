# Midway Faas

## Getting started

Serverless CLI v1.26.1+. You can get it by running:

```shell script
npm i -g serverless
```

## Example

You can install the following example:

### For aliyun

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/aliyun
```

### For Tencent SCF

```shell script
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/scf
```

### Install Plugin

Install `@midwayjs/serverless-midway-plugin` to your service.

```shell script
$ serverless plugin install --name serverless-midway-plugin
```

### Bootstrap

Install npm dependencies.

```shell script
$ npm i
```

## Usage

### Local invoke

```shell script
serverless invoke -f index
```

### Local debug

```shell script
serverless invoke -f index --debug
```

### package to zip file

```shell script
serverless package
```

### deploy to online

```shell script
serverless deploy
```
