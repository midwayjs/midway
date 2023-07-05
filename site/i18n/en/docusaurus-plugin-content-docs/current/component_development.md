# Custom component

A component (Component) is a reusable and multi-frame module package, which is generally used in several scenarios:

- 1. Package the code called downstream, and package the three-party module to simplify the use, such as orm (database call),swagger (simplified use), etc.
- 2. Reusable business logic, such as abstract public Controller,Service, etc.

Components can be loaded locally or packaged together and published into an npm package. Components can be used in midway v3/Serverless. You can put reusable business codes or functional modules into components for maintenance. Almost all Midway general capabilities can be used in components, including but not limited to configuration, life cycle, controller, interceptor, etc.

When designing components, we should face all upper-level frame scenarios as much as possible, so we only rely on `@midwayjs/core` as much as possible.

Starting from v3, the framework (Framework) has also become part of the component, and the usage and component are unified.



## Development component

### Boilerplate

Just execute the script below and select the `component-v3` template in the template list to quickly generate a sample component.

```bash
$ npm init midway
```

Note [Node.js environment requirements](/docs/intro#environmental-preparation).


### Component directory

The structure of the component is the same as the recommended directory structure of midway. The directory structure of the component is not specifically specified and can be consistent with the application or function. Simply understood, a component is a "mini application".

A recommended component directory structure is as follows.

```
.
├── package.json
├── src
│   ├── index.ts			 					// Entry export file
│   ├── configuration.ts			 	// Component behavior configuration
│   └── service                	// Logical Code
│       └── bookService.ts
├── test
├── index.d.ts                  //  component extension definition
└── tsconfig.json
```

For components, the only specification is the `Configuration` attribute exported by the entry, which must be a Class with a `@Configuration` decorator.

Generally speaking, our code is TypeScript standard directory structure, which is the same as Midway system.

At the same time, it is an ordinary Node.js package, which needs to use the `src/index.ts` file as the entry to export the content

Let's take a very simple example to demonstrate how to write a component.



### Component Lifecycle

Like the application, the component also uses `src/configuration.ts` as the entry startup file (or the application is a large component).

The code and application are exactly the same.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'book'
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

The only difference is that you need to add a `namespace` as the namespace for the component.

The code for each component is a separate scope so that even if a class with the same name is exported, it will not conflict with other components.

It is the same as the [lifecycle extension](lifecycle) capability that is common to the entire Midway.



### Component logic code

Same as the application, write the class export, and the dependent injection container is responsible for management and loading.

```typescript
// src/service/book.service.ts
import { Provide } from '@midwayjs/core';

@Provide()
export class BookService {
  async getBookById() {
    return {
      data: 'hello world',
    }
  }
}
```

:::info
A component does not rely on a clear upper-level framework. In order to reuse in different scenarios, it only depends on the common `@midwayjs/core`.
:::



### Component configuration

The configuration is the same as that of the application. For more information, see [Configure multiple environments](env_config).

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  namespace: 'book',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig
    }
  ]
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

There is an important feature in v3. After the component is loaded, the `MidwayConfig` definition will include the definition of the component configuration.

To do this, we need to write the definition of the configuration independently.

Add the configuration definition to the `index.d.ts` file in the root directory.

```typescript
// Because the default type export position is modified, additional types under dist need to be exported
export * from './dist/index';

// Standard extension statement
declare module '@midwayjs/core/dist/interface '{

  // Merge the configuration into the MidwayConfig
  interface MidwayConfig {
    book ?: {
      // ...
    };
  }
}

```

At the same time, the `package.json` of the component is also modified.

```json
{
  "name": "****",
  "main": "dist/index.js",
  "typings": "index.d.ts",			// The type export file here uses the project root directory's
  // ...
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts",
    "index.d.ts"								// This file needs to be brought with you when you publish it.
  ],
}
```



### Component convention

The components and the application itself are slightly different, mainly in the following aspects.

- 1. The code of the component needs to export a `Configuration` attribute, which must be a Class with a `@Configuration` decorator to configure the component's own capabilities
- 2. All  **explicitly exported codes** will be loaded by the dependent injection container. Simply put, all classes **decorated by decorators** need to be exported, including controllers, services, middleware, etc.

For example:

```typescript
// src/index.ts
export { BookConfiguration as Configuration } from './configuration';
export * from './service/book.service';
```

:::info
In this way, only the `service/book.service.ts` file in the project will be scanned and loaded by the dependent injection container.
:::

And specify the main path in the `package.json`.

```typescript
"main": "dist/index"
```

In this way, the component can be loaded by the upper scene dependency.



### Test components

Testing a single service can be executed by starting an empty business and specifying the current component.

```typescript
import { createLightApp } from '@midwayjs/mock';
import * as custom from '../src';

describe('/test/index.test.ts', () => {
  it('test component', async () => {
    const app = await createLightApp ('', {
      imports: [
        custom
      ]
    });
    const bookService = await app.getApplicationContext().getAsync(custom.BookService);
    expect(await bookService.getBookById()).toEqual('hello world');
  });
});

```

If the component is part of the Http protocol process and strongly relies on context and must rely on an Http framework, then use a complete project example and use `createApp` to test.

```typescript
import { createApp, createHttpRequest } from '@midwayjs/mock';
import * as custom from '../src';

describe('/test/index.test.ts', () => {
  it('test component', async () => {
    // In the sample project, you need to rely on @midwayjs/koa or other peer-to-peer frameworks.
    const app = await createApp(join(__dirname, 'fixtures/base-app'), {
      imports: [
        custom
      ]
    });

    const result = await createHttpRequest(app).get('/');
    // ...

  });
});


```



### Depends on other components

If a component depends on a class in another component and is the same as the application, it needs to be declared at the entrance, and the framework will load and handle the duplication in the order of the module.

If you explicitly rely on a class in a component, it must be a strong dependency of that component.

For example:

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';

@Configuration({
  namespace: 'book',
  imports: [axios]
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

There is also a case of weak dependencies, which do not need to be explicitly declared, but require additional judgment.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { IMidwayContainer } from '@midwayjs/core';

@Configuration({
  namespace: 'book',
})
export class BookConfiguration {
  async onReady(container: IMidwayContainer) {
    // ...
    if (container.hasNamespace('axios')) {
      // Execute only when axios component is loaded
    }
    // ...
  }
}
```

Increase dependency.

```json
// package.json
{
  "dependencies": {
    "@midwayjs/axios": "xxxx"
  }
}
```

In the `index.d.ts` directory of the root directory, add the component definitions that are dependent on the explicit import.

```typescript
// Explicitly import dependent components
import '@midwayjs/axios';
export * from './dist/index';

// ...

```

:::tip

If the main application does not explicitly rely on axios, the code execution is normal, but the typescript axios definition will not be scanned, resulting in no axios definition when writing the configuration. the above code can solve this problem.

:::


### Development components in applications

It is recommended to use [lerna](https://github.com/lerna/lerna) and enable lerna's hoist mode to write components. If you want to develop a component in a non-lerna scenario, make sure that the component is in the `src` directory. Otherwise, the component may fail to be loaded.

#### Use lerna

Development using lerna is relatively simple, and the specific directory structure is similar to the following.

```
.
├── src
├── packages/
│    ├── component-A
│    │   └── package.json
│    ├── component-B
│    │   └── package.json
│    ├── component-C
│    │   └── package.json
│    └── web
│        └── package.json
├── lerna.json
└── package.json
```

#### Non-lerna

The following is a common component development method. The sample structure is to develop two components at the same time during application code development. Of course, you can also customize the directory structure you like.

```
.
├── package.json
├── src																				 	// source directory
│   ├── components
│   │   ├── book                								// book component code
│   │   │    ├── src
│   │   │    │   ├── service
│   │   │    │   │   └── bookService.ts
│   │   │    │   ├── configuration.ts
│   │   │    │   └── index.ts
│   │   │    └── package.json
│   │   │
│   │   └── school
│   │        ├── src
│   │        │   ├── service                		// school component code
│   │        │   │    └── schoolService.ts
│   │        │   └── configuration.ts
│   │        └── package.json
│   │
│   ├── configuration.ts			 // Application Behavior Profile
│   └── controller             // Application Routing Directory
├── test
└── tsconfig.json
```

Component behavior configuration.

```typescript
// src/components/book/src/bookConfiguration.ts
import { Configuration } from '@midwayjs/core';

@Configuration()
export class BookConfiguration {}
```

In order for components to export, we need to export `Configuration` attributes at the entry of the component `src/components/book/src/index.ts`.

```typescript
// src/components/book/src/index.ts
export { BookConfiguration as Configuration } from './bookConfiguration/src';

```

:::info
Note that the place quoted here is "./xxxx/src", because generally the main field in our package.json points to dist/index. If you want the code not to be modified, then the main field should point to src/index, and it will be published in Remember to modify it back to dist.

The directory introduced by the component is pointed to src so that the save takes effect automatically (restart).
:::

In addition, scanning conflicts may occur in the new version. The dependency injection conflict checking function in `configuration.ts` can be turned off.



### Use components

In any midway series application, this component can be introduced in the same way.

First, add dependencies to the application.

```json
// package.json
{
  "dependencies": {
    "midway-component-book": "*"
  }
}
```

This component is then introduced in the application (function).

```typescript
// src/configuration.ts of application or function
import { Configuration } from '@midwayjs/core';
import * as book from 'midway-component-book';

@Configuration({
  imports: [book]
})
export class MainConfiguration {}
```

At this point, our preparations have been completed and we will start to use them.

Class injection that directly introduces components.

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { BookService } from 'midway-component-book';

@Provide()
export class Library {

  @Inject();
  bookService: BookService;

}
```

For the rest, if the component has specific capabilities, please refer to the documentation of the component itself.



### Component publishing

A component is an ordinary Node.js package that can be compiled and published to npm for distribution.

```bash
## Compile and publish the corresponding component
$ npm run build && npm publish
```



### Component example

[Here](https://github.com/czy88840616/midway-test-component) is an example of a component. It has been published to npm and can be tried to directly introduce it into the project to start execution.



## Development Framework (Framework)

In v3, components can contain a Framework to provide different services. Using the life cycle, we can extend the provision of gRPC,Http and other protocols.

The Framework here is just a special business logic file in the component.

For example:

```
.
├── package.json
├── src
│   ├── index.ts			 					// Entry export file
│   ├── configuration.ts			 	// Component behavior configuration
│   └── framework.ts            // Framework code
│
├── test
├── index.d.ts                  // Component extension definition
└── tsconfig.json
```





### Expand existing Framework

As mentioned above, the Framework is part of the component and also follows the component specification, which can be injected and extended.

Let's take the extension `@midwayjs/koa` as an example.

First, create a custom component, which is the same as a common application. Because `@midwayjs/koa` needs to be extended, we need to rely on `@midwayjs/koa` in the component.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  namespace: 'myKoa',
  imports: [koa]
})
export class MyKoaConfiguration {
  async onReady() {
    // ...
  }
}
```

Then, we can inject the framework exported by `@midwayjs/koa` for extension.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  namespace: 'myKoa',
  imports: [koa]
})
export class MyKoaConfiguration {
  @Inject()
  framework: koa.Framework;

  async onReady() {
    // Add middleware, app.useMiddleware in koa actually proxy the framework method
    this.framework.useMiddleware(/* ... */);

    // Add filter, app.useFilter in koa actually proxy the framework method
    this.framework.useFilter(/* ... */);

    // koa's own expansion capabilities, such as expansion context
    const app = this.framework.getApplication();
    Object.defineProperty(app.context, 'user', {
      get() {
        // ...
        return 'xxx';
      },
      enumerable: true
    });
    // ...
  }

  async onServerReady() {
    const server = this.framework.getServer();
    // server.xxxx
  }
}
```

This is a method of scaling based on existing Framework.

- If the context is extended in the component, refer to the [extended context definition](./context_definition).
- For more information about how to configure a widget, see [Configure a widget](# Component Configuration).

After the component is released, such as `@midwayjs/my-koa`, the business can directly use your component without introducing `@midwayjs/koa`.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
// Your own components
import * as myKoa from '@midwayjs/my-koa';

@Configuration({
  imports: [myKoa],
})
export class MyConfiguration {
  async onReady() {
    // ...
  }
}
```

If you want to fully define your own components, such as different protocols, you need to fully customize the Framework.



### Write Framework

The frameworks all follow the `IMidwayFramewok` interface definitions and the following conventions.

- Each framework has a separate start-stop process to be customized.
- Each framework needs to define its own independent `Application`, `Context`
- Each framework can have its own independent middleware capabilities

In order to simplify development, Midway provides a basic `BaseFramework` class for inheritance.

```typescript
import { Framework } from '@midwayjs/core';
import { BaseFramework, IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';

// Define Context
export interface Context extends IMidwayContext {
  // ...
}

// Define Application
export interface Application extends IMidwayApplication<Context> {
  // ...
}

// Frame configuration
export interface IMidwayCustomConfigurationOptions extends IConfigurationOptions {
	// ...
}

// Implement a custom framework and inherit the basic framework
@Framework()
export class MidwayCustomFramework extends BaseFramework<Application, Context, IMidwayCustomConfigurationOptions> {

  // Process initialization configuration
  configure() {
    // ...
  }

  // app initialization
  async applicationInitialize() {
    // ...
  }

  // Framework startup, such as listen
  async run() {
    // ...
  }
}
```



### Custom example

Next, we will take the implementation of a basic HTTP service framework as an example.

```typescript
import { BaseFramework, IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as http from 'http';

// Define the definitions to be used by some upper-level businesses.
export interface Context extends IMidwayContext {}

export interface Application extends IMidwayApplication<Context> {}

export interface IMidwayCustomConfigurationOptions extends IConfigurationOptions {
  port: number;
}

// Implement a custom framework that inherits the base framework
export class MidwayCustomHTTPFramework extends BaseFramework<Application, Context, IMidwayCustomConfigurationOptions> {

  configure(): IMidwayCustomConfigurationOptions {
    return this.configService.getConfiguration('customKey');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    // Create an app instance
    this.app = http.createServer((req, res) => {
      // Create a request context with logger, request scope, etc.
      const ctx = this.app.createAnonymousContext();
      // Get the injected service from the request context
      ctx.requestContext
        .getAsync('xxxx')
        .then((ins) => {
          // Call service
          return ins.xxx();
        })
        .then(() => {
          // End of request
          res.end();
        });
    });

    // Some methods needed to bind midway framework to app, such as getConfig, getLogger, etc.
    this.defineApplicationProperties();
  }

  async run() {
    // Startup parameters, only the HTTP port that is started is defined here.
    if (this.configurationOptions.port) {
      new Promise<void>((resolve) => {
        this.app.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }
}
```

We define a `MidwayCustomHTTPFramework` class, inherit the `BaseFramework`, and implement both `applicationInitialize` and `run` methods.

In this way, the most basic framework is completed.

Finally, we just need to export the Framework as agreed.

```typescript
export {
  Application,
  Context,
  MidwayCustomHTTPFramework as Framework,
  IMidwayCustomConfigurationOptions
} from './custom';
```

The above is an example of the simplest framework. In fact, all Midway frameworks are written in this way.
