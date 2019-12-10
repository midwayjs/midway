# Midway Faas

## Getting started

Serverless CLI v1.26.1+. You can get it by running `npm i -g serverless`

## Example

You can install the following example:

### For aliyun

```shell
$ serverless install --url https://github.com/midwayjs/midway-faas/tree/development/packages/serverless-function-examples/aliyun
```

Install npm dependencies.
```shell
$ npm i
```

## Usage

### Local invoke
```
serverless invoke -f index
```

### Local debug
```
serverless invoke -f index --debug
```

### package to zip file
```
serverless package
```


### deploy to online
```
serverless deploy
```