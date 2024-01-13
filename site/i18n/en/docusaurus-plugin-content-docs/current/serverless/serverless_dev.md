# Develop function

## Initialization code

Let's develop our first pure HTTP function and try to deploy it to a cloud environment.

Execute `npm init midway` and select the `faas` scaffolding.



## Directory Structure

The following is the most streamlined structure of a function. The core will include a `f.yml` standardized function file and the TypeScript project structure.

```bash
.
├── f.yml             # Standardized spec file
├── package.json      # Project dependencies
├── src
│   └── function
│       └── hello.ts	# Function file
└── tsconfig.json
```

Let’s take a brief look at the file contents.

- `f.yml` function definition file
- `tsconfig.json` TypeScript configuration file
- `src` function source code directory
- `src/function/hello.ts` sample function file

We place functions in the `function` directory to better separate them from other types of code.

## Function file

Let’s first take a look at the function file. The traditional function is a `function`. In order to be more consistent with the midway system and use our dependency injection, it is turned into a Class here.

Through the `@ServerlessTrigger` decorator, we mark the method as an HTTP interface and mark the `path` and `method` attributes.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/core';
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
     return `hello ${name}`;
   }
}
```

In addition to triggers, we can also use the `@ServerlessFunction` decorator to describe function-level meta-information, such as function name, concurrency, etc.


In this way, when we use multiple triggers on a function, we can set it up like this.

```typescript
import { Provide, Inject, ServerlessFunction, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
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
     name: 'timer'
   })
   async handleTimerEvent() {
     //TODO
   }
}
```

:::caution
Note that some platforms cannot put different types of triggers in the same function. For example, Alibaba Cloud stipulates that HTTP triggers and other triggers cannot take effect in the same function at the same time.
:::

## Function definition file

`f.yml` is a file with framework identification function information, the content is as follows.

```yaml
provider:
   name: aliyun #Publishing platform, here is Alibaba Cloud
   starter: '@midwayjs/fc-starter'

```

The `@midwayjs/fc-starter` here is the adapter that adapts to the aliyun function.



## Trigger decorator parameters

The `@ServerlessTrigger` decorator is used to define different triggers. Its parameters are each trigger information and general trigger parameters.

For example, the trigger name is changed to abc.

```typescript
   @ServerlessTrigger(ServerlessTriggerType.TIMER, {
     name: 'abc', // Trigger name
   })
```

If there is only one trigger, you can write the function name information to the trigger.

```typescript
   @ServerlessTrigger(ServerlessTriggerType.TIMER, {
   functionName: 'hello' // If there is only one trigger, you can omit a decorator
     name: 'abc',
   })
```



## Function decorator parameters

The `@ServerlessFunction` decorator is used to define functions. If there are multiple triggers, the function name can be modified uniformly.


for example:

```typescript
@ServerlessFunction({
   functionName: 'abcde' // function name
})
```

## Local development

Local development of HTTP functions is the same as traditional Web. Enter the following command.

```shell
$ npm rundev
$ open http://localhost:7001
```

Midway will start the HTTP server, open the browser, visit [http://127.0.0.1:7001](http://127.0.0.1:7001), the browser will print out the `Hello midwayjs` information.

Non-HTTP functions cannot be triggered directly. Instead, you can write test functions for execution.