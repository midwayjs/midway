import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deploy to Alibaba Cloud Function Compute

Alibaba Cloud Serverless is one of the first teams in China to provide serverless computing services. It relies on Alibaba Cloud's powerful cloud infrastructure service capabilities to continuously achieve technological breakthroughs. At present, Taobao, Alipay, DingTalk, AutoNavi, etc. have applied Serverless to production business. Serverless products on the cloud have been successfully implemented in tens of thousands of companies such as Pumpkin Movie, NetEase Cloud Music, iQiyi Sports, and Lilith.

Alibaba Cloud Serverless includes many products, such as Function Compute FC, Lightweight Application Engine SAE, etc. This article mainly uses its **Function Compute** part.

The following are common methods of using, testing, and deploying function triggers.



## Deployment type

Alibaba Cloud has many types of function computing deployments, including the following types according to the different containers they run.

| Name             | Functional limitations                                       | Description                                                  | Deployment Media       |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------- |
| Built-in runtime | Streaming requests and responses are not supported; requests and responses that are too large are not supported. | Only function interfaces can be deployed, no custom ports are required, zip packages are built for platform deployment | zip package deployment |
| Custom Runtime   |                                                              | You can deploy standard applications, start port 9000, use the system image provided by the platform, and build a zip package for platform deployment | zip package deployment |
| Custom Container |                                                              | You can deploy standard applications, start port 9000, control all environmental dependencies yourself, and build a Dockerfile for platform deployment | Dockerfile deployment  |

There are three ways to create functions on the platform.

![](https://img.alicdn.com/imgextra/i1/O1CN01JrlhOw1EJBZmHklbq_!!6000000000330-2-tps-1207-585.png)



## Pure function development (built-in runtime)

Below we will use the **"built-in runtime deployment"** pure function as an example.



### Trigger code

<Tabs groupId="triggers">
<TabItem value="event" label="Event">

Publish a function that does not contain a trigger. This is the simplest type. You can manually trigger parameters directly through event, or you can bind other triggers on the platform.

Bind event triggers via the `@ServerlessTrigger` decorator directly in code.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.EVENT)
   async handleEvent(event: any) {
     return event;
   }
}
```

</TabItem>

<TabItem value="http" label="HTTP">

Alibaba Cloud's HTTP triggers are different from those of other platforms. They are another set of triggers independent of the API gateway that serve HTTP scenarios. This trigger is easier to use and configure than API Gateway.

Bind HTTP triggers via the `@ServerlessTrigger` decorator directly in code.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.HTTP, {
     path: '/',
     method: 'get',
   })
   async handleHTTPEvent(@Query() name = 'midway') {
     return `hello ${name}`;
   }
}
```

</TabItem>

<TabItem value="apigw" label="API Gateway">

The API gateway is special in the Alibaba Cloud function system. It is similar to creating a trigger-free function and binding it to a specific path through the platform gateway.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
     path: '/api_gateway_aliyun',
     method: 'post',
   })
   async handleAPIGatewayEvent(@Body() name) {
     return `hello ${name}`;
   }
}
```

</TabItem>

<TabItem value="timer" label="Timer">

Scheduled task triggers are used to execute a function regularly.

:::info
Warm reminder, please turn off trigger automatic execution in time after testing the function to avoid excessive deductions.
:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type { TimerEvent } from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.TIMER)
   async handleTimerEvent(event: TimerEvent) {
     this.ctx.logger.info(event);
     return 'hello world';
   }
}
```

**Event Structure**

The structure returned by the Timer message is as follows, described in the `TimerEvent` type.

```json
{
   triggerTime: new Date().toJSON(),
   triggerName: 'timer',
   payload: '',
}
```

</TabItem>

<TabItem value="oss" label="OSS">

OSS is used to store some resource files and is Alibaba Cloud's resource storage product. When a file is created or updated in OSS, the corresponding function will be triggered and executed.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type { OSSEvent } from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.OS)
   async handleOSSEvent(event: OSSEvent) {
     //xxx
   }
}
```



**Event Structure**

The structure returned by OSS messages is as follows, which is described in the `FC.OSSEvent` type.

```json
{
   "events": [
     {
       "eventName": "ObjectCreated:PutObject",
       "eventSource": "acs:oss",
       "eventTime": "2017-04-21T12:46:37.000Z",
       "eventVersion": "1.0",
       "oss": {
         "bucket": {
           "arn": "acs:oss:cn-shanghai:123456789:bucketname",
           "name": "testbucket",
           "ownerIdentity": "123456789",
           "virtualBucket": ""
         },
         "object": {
           "deltaSize": 122539,
           "eTag": "688A7BF4F233DC9C88A80BF985AB7329",
           "key": "image/a.jpg",
           "size": 122539
         },
         "ossSchemaVersion": "1.0",
         "ruleId": "9adac8e253828f4f7c0466d941fa3db81161e853"
       },
       "region": "cn-shanghai",
       "requestParameters": {
         "sourceIPAddress": "140.205.128.221"
       },
       "responseElements": {
         "requestId": "58F9FF2D3DF792092E12044C"
       },
       "userIdentity": {
         "principalId": "123456789"
       }
     }
   ]
}
```

</TabItem>

<TabItem value="mns" label="MNS">

:::info

* 1. Alibaba Cloud Message Queue will incur certain fees for Topic and Queue.
* 2. The default message queue format provided is JSON

:::



```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type {MNSEvent} from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
   @Inject()
   ctx: Context;

   @ServerlessTrigger(ServerlessTriggerType.MQ)
   async handleMNSEvent(event: MNSEvent) {
     // ...
   }
}
```



**Event Structure**

The structure returned by the MNS message is as follows, described in the `FC.MNSEvent` type.

```json
{
   "Context": "user custom info",
   "TopicOwner": "1186202104331798",
   "Message": "hello topic",
   "Subscriber": "1186202104331798",
   "PublishTime": 1550216302888,
   "SubscriptionName": "test-fc-subscibe",
   "MessageMD5": "BA4BA9B48AC81F0F9C66F6C909C39DBB",
   "TopicName": "test-topic",
   "MessageId": "2F5B3C281B283D4EAC694B7425288675"
}
```

</TabItem>

</Tabs>

:::info

More configurations of triggers are platform-related and will be written in `s.yaml`, such as the time interval of scheduled tasks, etc. For more details, please see the deployment paragraph below.

:::



### Type definition

The definition of FC will be exported by the adapter. In order for the definition of `ctx.originContext` to remain correct, it needs to be added to `src/interface.ts`.

```typescript
// src/interface.ts
import type {} from '@midwayjs/fc-starter';
```

Additionally, definitions for various Event types are provided.

```typescript
//Event type
import type {
   OSSEvent,
   MNSEvent,
   SLSEEvent,
   CDNEvent,
   TimerEvent,
   APIGatewayEvent,
   TableStoreEvent,
} from '@midwayjs/fc-starter';
// InitializeContext type
import type { InitializeContext } from '@midwayjs/fc-starter';
```



### Local development

HTTP triggers and API Gateway types can be developed locally through local `npm run dev` and development methods similar to traditional applications. Other types of triggers cannot be developed locally using dev and can only be tested by running `npm run test`.



### Local testing

Similar to traditional application testing, use the `createFunctionApp` method to create a function app and use the `close` method to close it.

```typescript
import { Application, Context, Framework } from '@midwayjs/faas';
import { mockContext } from '@midwayjs/fc-starter';
import { createFunctionApp } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from event trigger', async () => {
    
     // create app
     const app: Application = await createFunctionApp<Framework>(join(__dirname, '../'), {
       initContext: mockContext(),
     });
    
     // ...
    
     await close(app);
   });
});
```

The `mockContext` method is used to simulate a FC Context data structure. You can customize a similar structure or modify some data.

```typescript
import { Application, Context, Framework } from '@midwayjs/faas';
import { mockContext } from '@midwayjs/fc-starter';
import { createFunctionApp } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from event trigger', async () => {
    
     // create app
     const app: Application = await createFunctionApp<Framework>(join(__dirname, '../'), {
       initContext: Object.assign(mockContext(), {
         function: {
           name: '***',
           handler: '***'
         }
       }),
     });
    
     // ...
    
     await close(app);
   });
});
```

Different triggers have different testing methods. Some common triggers are listed below.

<Tabs groupId="triggers">
<TabItem value="event" label="Event">

Obtain the class instance through `getServerlessInstance`, directly call the instance method, and pass in the parameters for testing.

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from event trigger', async () => {
     // ...
     const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
     expect(await instance.handleEvent('hello world')).toEqual('hello world');
     // ...
   });
});
```

</TabItem>

<TabItem value="http" label="HTTP">

Similar to the application, create a function app through `createFunctionApp` and test it through `createHttpRequest`.

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from http trigger', async () => {
     // ...
     const result = await createHttpRequest(app).get('/').query({
       name: 'zhangting',
     });
     expect(result.text).toEqual('hello zhangting');
     // ...
   });
});
```

</TabItem>

<TabItem value="apigw" label="API Gateway">

The same as HTTP testing, create a function app through `createFunctionApp` and test it through `createHttpRequest`.

```typescript
import { createHttpRequest } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from http trigger', async () => {
     // ...
     const result = await createHttpRequest(app).post('api_gateway_aliyun').send({
       name: 'zhangting',
     });

     expect(result.text).toEqual('hello zhangting');
     // ...
   });
});
```

</TabItem>

<TabItem value="timer" label="Timer">

Different from HTTP testing, create a function app through `createFunctionApp`, obtain an instance of the entire class through `getServerlessInstance`, and call a specific method for testing.

The structure passed by the platform can be quickly created through the `mockTimerEvent` method.

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockTimerEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from timer trigger', async () => {
     // ...
     const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
     expect(await instance.handleTimerEvent(mockTimerEvent())).toEqual('hello world');
     // ...
   });
});
```

</TabItem>

<TabItem value="oss" label="OSS">

Unlike HTTP testing, through `createFunctionApp`Create a function app, get an instance of the entire class through `getServerlessInstance`, and call a specific method for testing.

The structure passed by the platform can be quickly created through the `createOSSEvent` method.

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockOSSEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {
   it('should get result from oss trigger', async () => {
     // ...
     const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
     expect(await instance.handleOSSEvent(mockOSSEvent())).toEqual('hello world');
     // ...
   });
});
```

</TabItem>

<TabItem value="mns" label="MNS">

Different from HTTP testing, create a function app through `createFunctionApp`, obtain an instance of the entire class through `getServerlessInstance`, and call a specific method for testing.

The structure passed in by the platform can be quickly created through the `createMNSEvent` method.

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockMNSEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from oss trigger', async () => {
     // ...
     const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
     expect(await instance.handleMNSEvent(mockMNSEvent())).toEqual('hello world');
     // ...
   });
});
```

</TabItem>

</Tabs>

## Pure function deployment (built-in runtime)

The following will briefly describe how to use Serverless Devs to deploy to Alibaba Cloud functions.

### 1. Confirm the launcher

In the `provider` section of `f.yml` in the project root directory, make sure the starter is `@midwayjs/fc-starter`.

```yaml
provider:
   name: aliyun
   starter: '@midwayjs/fc-starter'
```



### 2. Install Serverless Devs tools

aliyun uses [Serverless Devs tool](https://www.serverless-devs.com/) for function deployment.

You can install it globally.

```bash
$ npm install @serverless-devs/s -g
```

Refer to the [Key Configuration](https://docs.serverless-devs.com/serverless-devs/quick_start) document for configuration.



### 3. Write a Serverless Devs description file

Create a `s.yaml` in the root directory and add the following content.

```yaml
edition: 1.0.0
name: "midwayApp" # project name
access: "default" # Secret key alias

vars:
   service:
     name: fc-build-demo
     description: 'demo for fc-deploy component'
services:
   project-0981cd9b07:
     component: devsapp/fc
     props:
       region: cn-hangzhou
       service: ${vars.service}
       function:
         name: hello # function name
         handler: helloHttpService.handleHTTPEvent
         codeUri: '.'
         initializer: helloHttpService.initializer
       customDomains:
         - domainName: auto
           protocol: HTTP
           routeConfigs:
             - path: /*
               serviceName: ${vars.service.name}
               functionName: helloHttpService-handleHTTPEvent
       triggers:
         - name: http
           type: http
           config:
             methods:
               -GET
             authType: anonymous

```

Every time you add a function, you need to adjust the `s.yaml` file. For this reason, Midway provides a `@midwayjs/serverless-yaml-generator` tool to write the decorator function information into `s.yaml`.

```diff
{
"scripts": {
+ "generate": "serverless-yaml-generator",
   },
   "devDependencies": {
+ "@midwayjs/serverless-yaml-generator": "^1.0.0",
   },
}
```

By executing the following command, you can fill existing function information into `s.yaml` and generate an entry file to facilitate troubleshooting.

```bash
$ npm run generate
```

The tool will look for the configuration in `s.yaml` using the function name as the key.

* 1. If there is a function, it will cover specific fields, such as handler, http trigger methods
* 2. If the function does not exist, a new function will be added
* 3. The tool will not write the http routing method. To simplify subsequent updates, you can provide a `/*` route (as an example)

We recommend that users only define the basic function name, function handler, and basic trigger information (such as the path and method of the http trigger) in the decorator, and write the rest in `yaml`.

The complete configuration of `s.yaml` is more complicated. For details, please refer to [Description File Specification](https://docs.serverless-devs.com/serverless-devs/yaml).



### 4. Write a deployment script

Since deployment has multiple steps such as building and copying, we can write a deployment script to unify this process.

For example, create a new `deploy.sh` file in the project root directory with the following content.

```bash
#!/bin/bash

set -e

# Build product directory
export BUILD_DIST=$PWD/.serverless
#Build start time in milliseconds
export BUILD_START_TIME=$(date +%s%3N)

echo "Building Midway Serverless Application"

#Print the current directory cwd
echo "Current Working Directory: $PWD"
#Print result directory BUILD_DIST
echo "Build Directory: $BUILD_DIST"

#Install current project dependencies
npm i

# Execute build
./node_modules/.bin/tsc || return 1
# Generate entry file
./node_modules/.bin/serverless-yaml-generator || return 1

# If the .serverless folder exists, delete it and recreate it
if [ -d "$BUILD_DIST" ]; then
   rm -rf $BUILD_DIST
fi

mkdir $BUILD_DIST

# Copy dist, *.json, *.yml to the .serverless directory
cp -r dist $BUILD_DIST
cp *.yaml $BUILD_DIST 2>/dev/null || :
cp *.json $BUILD_DIST 2>/dev/null || :
# Move the entry file to the .serverless directory
mv *.js $BUILD_DIST 2>/dev/null || :

# Enter the .serverless directory
cd $BUILD_DIST
# Install online dependencies
npm install --production

echo "Build success"

# Deploy in the .serverless directory
s deploy

```

You can put this `deploy.sh` file in the `deploy` command of `package.json`, and execute `npm run deploy` for subsequent deployment.

```json
{
   "scripts": {
     "deploy": "sh deploy.sh"
   }
}
```

:::tip

* 1. `deploy.sh` is only tested on mac, other platforms can be adjusted by yourself.
* 2. The script content can be adjusted according to business logic, such as copied files, etc.

:::



## Custom runtime deployment

### 1. Create a project

Custom runtimes can be deployed using standard projects. Since port 9000 needs to be provided, the Midway koa/express/express project needs to be created.

For initialization projects, please refer to [Creating the first application](/docs/quickstart).

### 2. Adjust the port

In order to avoid affecting local development, we only add ports at the entrance `bootstrap.js`.

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');

// Explicitly introduce user code as a component
Bootstrap.configure({
   globalConfig: {
     koa: {
       port: 9000,
     }
   }
}).run()
```

For different framework modification ports, please refer to:

* [koa modification port](/docs/extensions/koa)
* [Egg modification port](/docs/extensions/egg)
* [Express modification port](/docs/extensions/express)

### 3. Platform deployment configuration

* 1. Select the running environment, such as `Node.js 18`
* 2. Select the code upload method, for example, you can upload a zip package locally
* 3. The startup command specifies node bootstrap.js
* 4. Listening port 9000

![](https://img.alicdn.com/imgextra/i3/O1CN010JA2GU1lxNeqm81AR_!!6000000004885-2-tps-790-549.png)

After the configuration is completed, upload the compressed package to complete the deployment.
