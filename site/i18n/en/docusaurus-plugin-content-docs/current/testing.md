# Test

In application development, testing is very important. In the period of rapid iteration of traditional Web products, each test case provides a guarantee for the stability of the application.  API upgrade, test cases can well check whether the code is backwards compatible.  For all possible inputs, once the test covers, its output can be clarified.  After the code changes, you can judge whether the code changes affect the determined results through the test results.


Therefore, the Controller, Service and other codes of the application must have corresponding unit tests to ensure the code quality.  Of course, each functional change and refactoring of the framework and components requires corresponding unit tests, and the modified code is required to be covered by the 100% as much as possible.



## Test directory structure


We agree that the `test` directory is the directory where all test scripts are stored, and the `fixtures` used for testing and related auxiliary scripts should be placed in this directory.


The test script file is named `${filename}.test.ts` and must be suffixed with `.test.ts`.


An example of an application's test directory:
```text
➜  my_midway_app tree
.
├── src
├── test
│   └── controller
│       └── home.controller.test.ts
├── package.json
└── tsconfig.json
```



## Test Run Tool


By default, Midway provides the `midway-bin` command to run the test script. In the new version, Midway replaces mocha with Jest by default. It is more powerful and more integrated, which allows us to **focus on writing test code** instead of choosing those test peripheral tools and modules.


You only need to configure the `scripts.test` on the `package.json`.


```json
{
  "scripts": {
    "test": "midway-bin test --ts"
  }
}
```


Then you can run the test according to the standard `npm test`. By default, we have already provided this command in the scaffold, so you can run the test out of the box.
```bash
➜  my_midway_app npm run test

> my_midway_project@1.0.0 test /Users/harry/project/application/my_midway_app
> midway-bin test

Testing all *.test.ts...
 PASS  test/controller/home.controller.test.ts
 PASS  test/controller/api.controller.test.ts

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.26 s
Ran all test suites matching /\/test\/[^.]*\.test\.ts$/i.
```



## Assertion library


Jest has a powerful `expect` assertion library, which can be directly used in the global.


For example, commonly used.


```typescript
Expect (result.status).toBe(200); // Whether the value is equal to a certain value, the reference is equal
expect(result.status).not.toBe(200);
Expect (result).toEqual('hello'); //Simple match, the same object attribute is also true
Expect (result).toStrictEqual('hello'); // Strictly match
Expect (['lime', 'apple']).toContain('lime'); //Judge whether it is in an array
```


For more information about assertion methods, see [https:// jestjs.io/docs/en/expect](https://jestjs.io/docs/en/expect).



## Create test


Different upper-level frameworks have different testing methods. Take the most commonly used HTTP service as an example. If you need to test an HTTP service, generally speaking, we need to create an HTTP service and then request it with the client.


Midway provides a basic set of `@midwayjs/mock` tools to help the upper framework test in this area. At the same time, it also provides convenient methods to create Framework,App and close.


The whole process approach is divided into several parts:


- `createApp` to create an app object for a Framework
- `close` closes a Framework or an app

In order to keep the test simple, the whole process currently reveals these two methods.
```typescript
// create app
const app = await createApp<Framework>();
```
The `Framework` passed in here is used to derive the type for the TypeScript. In this way, the main frame app instance can be returned.


After the app is run, you can use the `close` method to close the app.
```typescript
import { createApp, close } from '@midwayjs/mock';

await close(app);
```
In fact, `@midwayjs/bootstrap` is encapsulated in `createApp` method, and interested partners can read the source code.



## Test HTTP service


In addition to creating app, `@midwayjs/mock` also provides a simple client method for quickly creating test behaviors corresponding to various services.


For example, for HTTP, we encapsulate supertest and provide `createHttpRequest` methods to create HTTP clients.


```typescript
// Create a client request
const result = await createHttpRequest(app).get('/');
// Test returns results
expect(result.text).toBe('Hello Midwayjs!');
```


It is recommended to reuse the app instance in a test file. The complete test example is as follows.
```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/koa';
import * as assert from 'assert';

describe('test/controller/home.test.ts', () => {

  let app: Application;

  beforeAll(async () => {
    // Create app only once and can be reused.
    try {
      // Because the error of Jest will be ignored in the BeforeAll phase, a layer of catch is required.
      // refs: https://github.com/facebook/jest/issues/8688
      app = await createApp<Framework>();
    } catch(err) {
    	console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    // close app
    await close(app);
  });

  it('should GET /', async () => {
    // make request
    const result = await createHttpRequest(app)
      .get('/')
      .set('x-timeout', '5000');

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs!');

    // or use assert
    assert.deepStrictEqual(result.status, 200);
    assert.deepStrictEqual(result.text, 'Hello Midwayjs!');
  });

  it('should POST /', async () => {
    // make request
    const result = await createHttpRequest(app)
      .post('/')
      .send({id: '1'});

    // use expect by jest
    expect(result.status).toBe(200);
  });

});

```


**Example:**


Create a get request and pass the query parameter.
```typescript
const result = await createHttpRequest(app)
  .get('/set_header')
  .query({ name: 'harry' });
```


create a post request and pass the body parameter.
```typescript
const result = await createHttpRequest(app)
  .post('/user/catchThrowWithValidate')
  .send({id: '1'});
```


create a post request and pass the form body parameter.
```typescript
const result = await createHttpRequest(app)
  .post('/param/body')
  .type('form')
  .send({id: '1'})
```


Pass the header header.
```typescript
const result = await createHttpRequest(app)
  .get('/set_header')
	.set({
  	'x-bbb ': ' 123'
  })
  .query({ name: 'harry' });
```
Pass cookie.
```typescript
const cookie = [
  "koa.sess=eyJuYW1lIjoiaGFycnkiLCJfZXhwaXJlIjoxNjE0MTQ5OTQ5NDcyLCJfbWF4QWdlIjo4NjQwMDAwMH0=; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly ",
  "koa.sess.sig=mMRQWascH-If2-BC7v8xfRbmiNo; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly"
]

const result = await createHttpRequest(app)
  .get('/set_header')
  .set('Cookie', cookie)
  .query({ name: 'harry' });
```


## Test service


Outside the controller, sometimes we need to test a single service, which we can get from the dependency injection container.

Assume that a test `UserService` is required.


```typescript
// src/service/user.ts
import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserService {
	async getUser() {
  	// xxx
  }
}
```

Then write this in the test code.

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';
import * as assert from 'assert';
import { UserService } from '../../src/service/user';

describe('test/controller/home.test.ts', () => {

  it('should GET /', async () => {
    // create app
    const app = await createApp<Framework>();

    // Obtain instances based on dependency injection class (recommended)
    const userService = await app.getApplicationContext().getAsync<UserService>(UserService);
    // Get the instance based on the dependency injection Id.
    const userService = await app.getApplicationContext().getAsync<UserService>('userService');
    // Incoming class Ignoring Generics can also correctly derive
    const userService = await app.getApplicationContext().getAsync(UserService);

    // close app
    await close(app);
  });

});
```


If your service is associated with a request (ctx), you can use the request scope to get the service.


```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';
import * as assert from 'assert';
import { UserService } from '../../src/service/user';

describe('test/controller/home.test.ts', () => {

  it('should GET /', async () => {
    // create app
    const app = await createApp<Framework>();

    // Get the instance based on the dependency injection Id.
    const userService = await app.createAnonymousContext()
    					.requestContext.getAsync<UserService>('userService');

    // You can also pass in class to get an instance.
    const userService = await app.createAnonymousContext()
    					.requestContext.getAsync(UserService);

    // close app
    await close(app);
  });

});
```



## createApp option parameters

`createApp` method is used to create an app instance of a framework, and by passing in a generic framework type, the app we infer can be the app returned by the framework.


For example:

```typescript
import { Framework } from '@midwayjs/grpc';

// The app here can ensure that it is the app returned by the gRPC framework.
const app = await createApp<Framework>();
```
`createApp` method actually has parameters, and its method signature is as follows.
```typescript
async createApp (
  appDir = process.cwd()
  options: IConfigurationOptions = {}
)
```
The first parameter is the absolute root directory path of the project, which defaults to `process.cwd()`.
The second parameter is the Bootstrap startup parameter, such as the configuration of some global behaviors. for details, see TS definition.



## Close option parameter


The `close` method is used to close the framework related to the app instance.

```typescript
await close(app);
```

It has some parameters.

```typescript
export declare function close (
  app: IMidwayApplication | IMidwayFramework<any, any>
  options ?: {
  	cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
}): Promise<void>;
```
The first parameter is an instance of app or framework.


The second parameter is an object that can perform some behaviors when executing shutdown:


- 1. `cleanLogsDir` defaults to false, and deletes the logs directory after the control test is completed (except windows)
- 2. The default `cleanTempDir` is false, and some temporary directories (such as run directory generated by egg) are cleaned up.
- 3. The default value of `sleep` is 50, in milliseconds, and the delay time after the app is turned off (to prevent the logs from being written without success).

## Test with bootstrap files

In general, you don't need to use `bootstrap.js` to test. If you want to test directly using the `bootstrap.js` entry file, you can pass the entry file information during the test.

Unlike dev/test startup, startup using `bootstrap.js` is a real service that runs multiple frameworks at the same time and creates app instances of multiple frameworks.

`@midwayjs/mock` provides `createBootstrap` methods to test the startup file type. We can pass in the `bootstrap.js` of the entry file as a startup parameter, so that `createBootstrap` method starts the code through the entry file.

```typescript
it('should GET /', async () => {
  // create app
  const bootstrap = await createBootstrap(join(process.cwd(), 'bootstrap.js'));
  // Get an app instance based on the frame type.
  const app = bootstrap.getApp('koa');

  // expect and test

  // close bootstrap
  await bootstrap.close();
});
```



## Run a single test


Unlike the `only` of mocha, the `only` method of jest takes effect only for a single file.  `midway-bin` provides the ability to run a single file.
```bash
$ midway-bin test -f test/controller/api.ts
```
In this way, you can specify to run the test of a file, and then cooperate with the `describe.only` and `it.only`, so that you can run only a single test method in a single file.

`midway-bin test --ts` is equivalent to the following command using jest directly.

```bash
$ node --require=ts-node/register ./node_modules/.bin/jest
```



## Customize Jest file content


In general, the Midway tool chain has built-in jest configuration, so that users do not need to add this file. However, in some special scenarios, such as using VSCode or Idea editors, you may need to specify a `jest.config.js` scenario when you need to develop and test in the visualization area. In this case, Midway supports creating a custom jest configuration file.


Create a `jest.config.js` file in the root directory of the project.

```
➜  my_midway_app tree
.
├── src
├── test
│   └── controller
│       └── home.test.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```
The content is as follows. The configuration is the same as the standard jest.

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
  coveragePathIgnorePatterns: ['<rootDir>/test/']
};
```


## Common settings


If you need to run some code before a single test, you can add `jest.setup.js`.
```javascript
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
  coveragePathIgnorePatterns: ['<rootDir>/test/']
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // read jest.setup.js in advance
};
```

:::caution
Note that `jest.setup.js` can only use js files.
:::


### Example 1: The problem of long test code time


If the following error occurs in the test, it means that your code takes a long time to execute (such as connecting to the database, running tasks, etc.). If you are sure that there is no problem with the code, you need to extend the startup time.
```
Timeout - Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.Error: Timeout - Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.
```
The default time for jest is **5000ms(5 seconds)**. You can adjust it to more.


You can write the following code in the `jest.setup.js` file to adjust the jest timeout period.

```javascript
// jest.setup.js
jest.setTimeout(30000);
```


### Example 2: Global Environment Variables


Similarly, `jest.setup.js` can also run custom code, such as setting global environment variables.

```javascript
// jest.setup.js
process.env.MIDWAY_TS_MODE = 'true';
```
### Example 3: Processing where the program cannot exit normally


Sometimes, because some codes (timers, listeners, etc.) run in the background, the process cannot be exited after a single test run. For this case, jest provides the `-forceExit` parameter.


```bash
$ midway-bin test --ts --forceExit
$ midway-bin cov --ts --forceExit
```
You can also add attributes to a custom file.

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
  coveragePathIgnorePatterns: ['<rootDir>/test/']
  forceExit: true
};
```

### Example 4: Parallel Change to Serial Execution


By default, jest processes each test file in parallel. If there are scenarios such as startup ports in the test code, parallel processing may cause port conflicts and report errors. At this time, you need to add the `-runInBand` parameter. Note that this parameter can only be loaded in the command.
```bash
$ midway-bin test --ts --runInBand
$ midway-bin cov --ts --runInBand
```



## Editor configuration


### Jetbrain Webstorm/Idea configuration


In the Jetbrain editor, the "jest" plug-in needs to be enabled. Since the sub-process is used to start, we still need to specify the load `-require = ts-node/register` at startup.

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01Wa6UaE1p0zU82gnpL_!!6000000005299-2-tps-1500-951.png)


### VSCode configuration


Search the plug-in first and install Jest Runner.
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01D6zTxi1GiwwrqhHVW_!!6000000000657-2-tps-1242-877.png)
Open the configuration and configure the jest command path.


![image.png](https://img.alicdn.com/imgextra/i4/O1CN017BK54o1n2FL7x8hI0_!!6000000005031-2-tps-1266-849.png)


Enter `node -- require = ts-node/register ./node_modules/.bin/jest` at the jest command.


Or set settings.json in the workspace folder. vscode.

```json
{
  "jest.pathToJest": "node --require=ts-node/register ./node_modules/.bin/jest --detectOpenHandles ",
  "jestrunner.jestCommand": "node --require=ts-node/register ./node_modules/.bin/jest --detectOpenHandles"
}
```


Since the debugging of the jest runner plug-in uses the debugging of VSNode, the launch.json of VSNode needs to be configured separately.


Set launch.json in the folder. vscode

```json
{
  "version": "0.0.1 ",
  "configurations": [
    {
      "name": "Debug Jest Tests ",
      "type": "node ",
      "request": "launch ",
      "runtimeArgs": [
        "--inspect-brk ",
        "--require=ts-node/register ",
        "${workspaceRoot}/node_modules/.bin/jest ",
        "--runInBand ",
        "--detectOpenHandles"
      ],
      "console": "integratedTerminal ",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```



## Configure alias paths

Tsc does not convert the module path of import when compiling ts into js, so when you configure paths in `tsconfig.json`, if you use paths in ts and import the corresponding module, there is a high probability that the module cannot be found when compiling js.


The solution is to either use paths, or use paths to import some declarations instead of specific values, or use [tsconfig-paths](https://github.com/dividab/tsconfig-paths) to hook out the module path resolution logic in node to support paths in `tsconfig.json`.

```bash
$ npm i tsconfig-paths --save-dev
```

The use tsconfig-paths can be introduced in `src/configuration.ts`.

```typescript
// src/configuration.ts

import 'tsconfig-paths/register';
// ...
```


:::info
The above method will only take effect for dev phase (ts-node).
:::


In the test, due to Jest's special environment, alias needs to be processed again. `moduleNameMapper` functions in Jest's configuration file can be used to replace the loaded modules to realize alias functions in disguise.

```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
  coveragePathIgnorePatterns: ['<rootDir>/test/']
  moduleNameMapper: {
  	'^@/(.*)$': '<rootDir>/src/$1'
  }
};

```
Note that the alias prefix used here is the @symbol. If it is another alias name, please modify it yourself.



## Use mocha instead of jest


Some students have a soft spot for mocha and want to use mocha as a testing tool.


Mocha mode can be used for testing.
```bash
$ midway-bin test --ts --mocha
```


When you use mocha for a single test, you must manually install the `mocha` and `@types/mocha` dependencies in the `devDependencies`: `npm I mocha @types/mocha -D`.

### Configure alias paths
When you configure paths in `tsconfig.json` and module package import uses paths, there will be mocha for unit testing, which will cause the path to be unresolved and cannot be resolved by importing the `tsconfig-paths/register`.
```typescript
// src/configuration.ts

import 'tsconfig-paths/register';
// ...
```

`tsconfig-paths` need to be added and referenced for processing during testing.

```bash
$ npm install --save-dev tsconfig-paths
```

```bash
$ midway-bin test --ts --mocha -r tsconfig-paths/register
```

:::info
Note that since mocha does not have its own assertion tool, other tools such as assert and chai need to be used for assertion.
:::



## About mock data

Simulation data is a capability that can be used in both development and testing. For more information, see [Simulation data](./mock).
