# Development function

## Initialization code

Let's develop the first pure HTTP function to try to deploy it to the cloud environment (don't worry, functions now have a free quota, usually at no cost).

```bash
$ npm -v

# if it is npm v6
$ npm init midway --type=faas-v3 my_midway_app

# if it is npm v7
$ npm init midway -- --type=faas-v3 my_midway_app
```

You can also run `npm init midway` and select `faas` scaffolding.

## Directory structure

The following is the simplest structure of a function. The core will include a standardized `f.yml` function file and the TypeScript project structure.

```bash
.
├── f.yml           	# standardized spec file
├── package.json    	# Project Dependency
├── src
│   └── function
│       └── hello.ts	# function file
└── tsconfig.json
```

Let's take a brief look at the contents of the document.

- `f.yml` function definition file
- `tsconfig.json` profile TypeScript
- `src` function source directory
- `src/function/hello.ts` sample function file

We put the function in the `function` directory to better separate it from other types of code.

## Function file

Let's first look at the function file. The traditional function is a `function`. In order to better conform to the midway system and use our dependency injection, it is turned into Class here.

With the `@ServerlessTrigger` decorator, we label the method as an HTTP interface and mark the `path` and `method` attributes.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midway') {
    return 'hello ${name}';
  }
}
```

In addition to triggers, we can also use the `@ServerlessFunction` decorator to describe meta-information at the function level, such as function name, concurrency, etc.


In this way, when we use multiple triggers on a function, we can set it like this.

```typescript
import { Provide, Inject, ServerlessFunction, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloServerlessService {
  @Inject()
  ctx: Context;

  // Multiple triggers for one function
  @ServerlessFunction({
    functionName: 'abcde',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'every',
    value: '5m',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'every',
    value: '10m',
  })
  async handleTimerEvent() {
    // TODO
  }
}
```

:::caution
Note that some platforms cannot place different types of triggers in the same function. For example, Alibaba Cloud stipulates that HTTP triggers and other triggers cannot take effect in the same function at the same time.
:::

## Function definition file

`f.yml` is the definition file of a function. This file is used to generate files that can be recognized by different platforms during construction. The content of the file in the example is as follows.

```yaml
service:
  name: the name of the midway-faas-examples ## function group, which can be understood as the application name.

provider:
  Name: aliyun ## released platform, here is ariyun

custom:
  customDomain:
    domainName: auto ## due to the release of HTTP service, domain names are automatically generated here and can be bound separately in the future.
```



## Trigger decorator parameters

The `@ServerlessTrigger` decorator is used to define different triggers. Its parameters are each trigger information and common trigger parameters.


The trigger is consistent with the [f.yml definition](/docs/serverless_yml). please refer to the [interface](https://github.com/midwayjs/midway/blob/2.x/packages/decorator/src/interface.ts#L141) of each trigger for the current definition.

For example, the name of the trigger is changed to abc.

```typescript
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    name: 'abc',
    type: 'every',
    value: '5m',
  })
```

## Function decorator parameters

The `@ServerlessFunction` decorator is used to define functions through which function names can be modified.


The function trigger is consistent with the [f.yml definition](/docs/serverless_yml#f1568472). please refer to the [interface](https://github.com/midwayjs/midway/blob/2.x/packages/decorator/src/interface.ts#L141) of each trigger for the current definition.


For example:

```typescript
@ServerlessFunction({
  functionName: 'abcde',
  initTimeout: 3, // initialization timeout, only valid for Aliyun fc, default 3s
  timeout: 3 // function execution timeout, default 3s
})
```

## Local development

The local development of HTTP functions is the same as that of traditional Web. Enter the following command.

```bash
$ npm run dev
$ open http://localhost:7001
```

Midway will start the HTTP server, open the browser, access [http:// 127.0.0.1:7001](http://127.0.0.1:7001), and the browser will print the `Hello midwayjs` information.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1615045887650-73a90be7-1d49-4024-82c4-fd6b5192e75e.png#height=384&id=X8Jmz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=768&originWidth=1268&originalType=binary&ratio=1&size=85174&status=done&style=none&width=634" width="634" />

## Deployment function

Deploy functions. You can use the release command to package and deploy functions:

```bash
$ npm run deploy
```

:::info
If you enter the wrong information, you can re-execute the `npx midway-bin deploy -- resetConfig` modification.
:::

Here, we use the Alibaba Cloud FC platform to demonstrate. For more information about how to deploy to Tencent Cloud, see [Tencent Cloud Deployment](deploy_to_tencent).

Alibaba Cloud deployment needs to configure `accountId`, `accountKey`, `accountSecret` for the first time

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png)

For related configuration, please refer to the picture below:

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png)

Click [Security Settings](https://account.console.aliyun.com/#/secure).

---

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png)

Click the [AccessKey page](https://usercenter.console.aliyun.com/#/manage/ak) of Alibaba Cloud.

The overall deployment effect is as follows:

![](https://cdn.nlark.com/yuque/0/2021/svg/501408/1618722302423-d7d159b3-45b0-4a93-a2b1-daf50f46bc9f.svg)

after publishing, obtain the current url from the console to access it.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618722353090-bf9e0061-ea62-46a2-a77e-57236a4e4024.png)

Since the automatic domain name is turned on, Aliyun will add a temporary domain name for development and debugging free of charge, and then you can bind the new domain name yourself.
