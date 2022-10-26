# Life cycle

Under normal circumstances, we want to do some initialization or other pre-processing things when the application starts, such as creating a database connection and pre-generating some configuration, instead of processing it when requesting a response.



## Project life cycle

The framework provides these lifecycle functions for developers to handle:

- Configuration file loading, we can modify the configuration here (`onConfigLoad`)
- When the dependent injection container is ready, most things can be done at this stage (`onReady`)
- After the service is started, you can get the server( `onServerReady`)
- The application is about to be shut down. Here, clean up the resources (`onStop` ).


Midway's life cycle is to implement the ILifeCycle interface through the `src/configuration.ts` file, which can be automatically loaded when the project starts.


The interface is defined as follows.


```typescript
interface ILifeCycle {
	/**
  * Execute after the application configuration is loaded
  */
  onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

	/**
   * Execute when relying on the injection container ready
   */
  onReady(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

	/**
   * Execute after the application service is started
   */
  onServerReady?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

 	/**
   * Execute when the application stops
   */
  onStop?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
}
```



### onConfigLoad

Generally used to modify the configuration file of the project.

For example.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onConfigLoad(): Promise<void> {
    // The data returned directly will be automatically merged into the configuration.
    return {
      test: 1
    }
  }
}
```

In this case, the `@Config` configuration contains the returned data. For more information, see [Asynchronous initialization configuration](./env_config# Asynchronous Initialization Configuration).



### onReady

onReady is a life cycle that is used in most scenarios.

:::info
Note that ready here refers to the dependency injection container ready, not the application ready, so you can make any extension to the application, such as adding middleware, connecting databases, etc.
:::


We need to connect a database in advance during initialization. Since it is in the class, we can also inject the connection tool class of a database such as db through the `@Inject` decorator. This instance contains two functions, connect and close:


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    // Establish a database connection
    await this.db.connect();
  }

  async onStop(): Promise<void> {
	// Close database connection
    await this.db.close();
  }
}
```


In this way, we can establish the database connection when the application starts, rather than creating it when the response is requested. At the same time, when the application is stopped, the database connection can also be closed gracefully.


In addition, in this way, the default injected objects can be expanded.


```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as sequelize from 'sequelize';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onReady(container: IMidwayContainer): Promise<void> {
    // Three-party package object
    container.registerObject('sequelize', sequelize);
  }
}
```


It can be directly injected into other classes.


```typescript
export class IndexHandler {

  @Inject()
  sequelize;

  async handler() {
  	console.log(this.sequelize);
  }
}
```



### onServerReady

This lifecycle is needed when you want to get information about the framework's service objects, ports, and so on.

Let's take `@midwayjs/koa` as an example to get its Server at startup.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa]
})
export class MainConfiguration implements ILifeCycle {

  async onServerReady(container: IMidwayContainer): Promise<void> {
    // Obtain the exposed Framework in koa
    const framework = await container.getAsync(koa.Framework);
    const server = framework.getServer();
    // ...

  }
}
```



### onStop

We can clean up some resources at this stage, such as closing the connection.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa]
})
export class MainConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    // Establish a database connection
    await this.db.connect();
  }

  async onStop(): Promise<void> {
    // Close database connection
    await this.db.close();
  }
}
```



## Global Object Lifecycle

The so-called object life cycle refers to the event that each object is created and destroyed in the dependency injection container. Through these life cycles, we can do some operations when the object is created and destroyed.

```typescript
export interface IObjectLifeCycle {
  onBeforeObjectCreated(/**...**/);
  onObjectCreated(/**...**/);
  onObjectInit(/**...**/);
  onBeforeObjectDestroy(/**...**/);
}
```

These stages are already included in the `ILifeCycle` definition.

:::caution

Note that the object lifecycle API will affect the entire dependency injection container and the use of the business. Please operate with caution.

:::

### onBeforeObjectCreated

Before the business object instance is created, some objects inside the framework cannot be intercepted because they have been initialized.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectBeforeCreatedOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onBeforeObjectCreated(Clzz: new (...args), options: ObjectBeforeCreatedOptions): Promise<void> {
    // ...
  }
}
```

There are two parameters in the entry parameter:

- `Clzz` is the prototype class of the object to be created.
- `options` some parameters

The parameters are as follows:

| Property | Type | Description |
| ----------------------- | ----------------- | ---------------- |
| options.context | IMidwayContainer | Dependent injection container itself |
| options.definition | IObjectDefinition | Object definition |
| options.constructorArgs | any[] | Constructor input parameter |



### onObjectCreated

Execute after the object instance is created, this stage can replace the created object.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectCreatedOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectCreatedOptions): Promise<void> {
    // ...
  }
}
```

There are two parameters in the entry parameter:

- `ins` is the object created by the builder.
- `options` some parameters

The parameters are as follows:

| Property | Type | Description |
| ----------------------- | ------------------ | ------------------ |
| options.context | IMidwayContainer | Dependent injection container itself |
| options.definition | IObjectDefinition | Object definition |
| options.replaceCallback | (ins: any) => void | Callback method for object replacement |

**Example: dynamically add attributes**

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectInitOptions): Promise<void> {
    // Each created object will add a_name attribute
    ins._name = 'xxxx';
    // ...
  }
}
```

**Example: Replace an object**

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectInitOptions): Promise<void> {
    // Each created object will be replaced with {bbb: 'aaa'}
    options.replaceCallback({
      bbb: 'aaa'
    });

    // ...
  }
}
```



### onObjectInit

Execute after the asynchronous initialization method is executed after the object instance is created.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectInit(ins: any, options: ObjectInitOptions): Promise<void> {
    // ...
  }
}
```

There are two parameters in the entry parameter:

- `ins` is the object created by the builder.
- `options` some parameters

The parameters are as follows:

| Property | Type | Description |
| ------------------ | ----------------- | ---------------- |
| options.context | IMidwayContainer | Dependent injection container itself |
| options.definition | IObjectDefinition | Object definition |

:::info

At this stage, you can also dynamically attach attributes, methods, etc. to objects. The difference with `onObjectCreated` is that this stage is after the initialization method is executed.

:::



### onBeforeObjectDestroy

Execute before the object instance is destroyed.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, ObjectBeforeDestroyOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onBeforeObjectDestroy(ins: any, options: ObjectBeforeDestroyOptions): Promise<void> {
    // ...
  }
}
```

There are two parameters in the entry parameter:

- `ins` is the object created by the builder.
- `options` some parameters

The parameters are as follows:

| Property | Type | Description |
| ------------------ | ----------------- | ---------------- |
| options.context | IMidwayContainer | Dependent injection container itself |
| options.definition | IObjectDefinition | Object definition |

