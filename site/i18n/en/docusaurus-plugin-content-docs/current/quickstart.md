# Create the first application


## Technical selection

Midway has multiple sets of technical solutions to choose from. We will distinguish them by deployment:

| Technical selection | Description |
| --------------- | ------------------------------------------------------------ |
| Pure Node.js project | Midway traditional project, pure Node.js research and development, modules represented by `@midwayjs/koa`, supports back-end projects in the most complete way, and uses **dependency injection + Class** as the technology stack.  |
| Serverless project | Midway is a technology stack developed separately for Serverless scenarios. Modules represented by `@midwayjs/faas` are connected to different Serverless platforms in a lightweight way.  |
| Integration project | Midway's innovative technology scheme adopts the integrated development method of front and back ends to save the time of front and back ends. For modules represented by `@midwayjs/hooks`, **functional** is used as the main coding paradigm.  |

:::tip
This chapter and subsequent documents will use the **pure Node.js project** as the basic example. If you need to use the Serverless project, please jump to the [Serverless](serverless/serverless_intro). If you need to learn about the integration project, please visit [integration](hooks/intro).
:::



## Fast initialization


Use `npm init midway` to view the complete list of scaffolds. After a project is selected, Midway automatically creates sample directories, codes, and installation dependencies.

```bash
$ npm init midway
```

For a v3 project, select `koa-v3`, pay attention to [Node.js environment requirements](/docs/intro#environmental-preparation).

The example will create a directory structure similar to the following, where the simplest Midway project example is as follows.

```
➜  my_midway_app tree
.
├── src                            ## midway project source code
│   └── controller                 ## Web Controller Directory
│       └── home.controller.ts
├── test
├── package.json
└── tsconfig.json
```
The whole project includes some of the most basic files and directories.


- `src` is the source directory of the entire Midway project.
- The test directory of the `test` project. All the test files are available here.
- `package the` package management profile of the. json Node.js project Foundation
- `tsconfig.json` Compile Configuration File TypeScript


In addition to the entire directory, we have some other directories, such as the `controller` directory.


## Development habits


Midway has no special restrictions on directories, but we will follow some simple development habits and classify some commonly used files into some default folders.


The following ts source code folders are in the `src` directory.


Commonly used are:


- `controller` Web Controller directory
- `middleware` middleware directory
- `filter`
- `aspect` interceptor
- `service` service logical directory
- `entity` or `model` database entity directory
- `config`
- The directory where the `util` tool class is stored.
- `decorator` custom decorator directory
- `interface.ts` definition file for ts business



With the emergence of different scenarios, directory habits will continue to increase, and the specific directory content will be reflected in different component functions.


## Web framework selection


Midway was designed to be compatible with a variety of upper-level frameworks, such as common `Express`, `Koa` and `EggJS`.

Starting with v3, we use Koa to demonstrate the basic example.

These upper-level frameworks are provided in Midway with component capabilities, and all of them can use the decorator capabilities provided by Midway, but Midway will not encapsulate specific capabilities, such as the plugin system of Egg.js, or the middleware capabilities of Express, If you are familiar with one of these frameworks, or want to use the capabilities of a particular framework, you can choose it as your workhorse web framework.


| Name | Description |
| --- | --- |
| @midwayjs/koa | By default, Koa is a Express alternative framework, which supports asynchronous middleware and other capabilities by default, and is the second most common Node.js Web framework.  |
| @midwayjs/web | Egg.js is a relatively commonly used Web framework in China, including some default plug-ins.  |
| @midwayjs/express | Express is a well-known node.js minimalist Web framework.  It's a well-tested, productive library with a lot of community resources.  |


If you want to replace the default Web framework, please refer to the corresponding [egg](extensions/egg) or [express](extensions/express) section.


## Start the project


```bash
$ npm run dev
$ open http://localhost:7001
```
Midway will start the HTTP server, open the browser, access `http:// 127.0.0.1:7001`, and the browser will print out the `Hello midwayjs!`  The information.


![image.png](https://img.alicdn.com/imgextra/i2/O1CN01KoUxO91jydMw41Vv4_!!6000000004617-2-tps-1268-768.png)


If you need to modify the development startup port, you can modify it in the scripts paragraph of the `package.json`, such as 6001:

```typescript
"scripts": {
  //...
  "dev": "cross-env NODE_ENV=local midway-bin dev --ts --port=6001",
},
```

## Frequently Asked Questions

### Python compilation error

:::caution
Executing `npm install/i` command under node15/npm7 to install dependency may cause Python compilation errors

**Projects created using npm init midway will automatically install dependencies without this problem.**

**Solution**: Add the `--legacy-peer-deps` parameter when run `npm i`.
**Reason**: The test framework Jest relies on jsdom. Npm7 automatically installs the canvas package that its peerDependencies depends on. The installation and compilation of canvas requires a python3 environment.
:::

### windows eslint error

:::caution
Windows may encounter the problem of eslint error. Please pay attention to [the problem of line wrapping under windows](faq/git_problem#XCAgm).
:::
