# 部署到 AWS Lambda

AWS Lambda是Amazon Web Services (AWS)提供的无服务器计算服务。它允许您在无需预配或管理服务器的情况下运行代码。您可以为几乎任何类型的应用程序或后端服务运行代码，全部无需管理。

下面我们将介绍如何将 Midway 标准应用部署到 AWS Lambda。



### 1、创建项目

需要创建 Midway koa/express/express 项目。

初始化项目请参考 [创建第一个应用](/docs/quickstart)，下面以 koa 应用为例。



### 2、调整端口

为了避免影响本地开发，我们仅在入口 `bootstrap.js` 处增加端口，比如 `8080`。

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');

// 显式以组件方式引入用户代码
Bootstrap.configure({
  globalConfig: {
    koa: {
      port: 8080,
    }
  }
}).run()
```

不同的框架修改端口请参考：

* [koa 修改端口](/docs/extensions/koa)
* [Egg 修改端口](/docs/extensions/egg)
* [Express 修改端口](/docs/extensions/express)



### 3、安装和配置 AWS 工具

- [安装 AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [配置AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
- [安装 AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)



### 4、编写 template.yaml

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Resources:
  EasySchoolBackendFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./dist.zip
      Handler: dist/index/index.handler
      Runtime: nodejs14.x
      Timeout: 900
      PackageType: Zip
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{any+}
            Method: ANY

```



### 4、构建和部署

```bash
$ cd sam
$ sam build # builds sam 
$ sam local start-api # start local api
```

