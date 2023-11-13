# Development tools

Based on the standard tsc module, midway has developed a simple tool for developing and building ts files locally.

Its usage is almost identical to standard tsc.

```bash
$ npx mwtsc
```

Equivalent to executing the `tsc` command.



## Common commands

Since mwtsc is developed based on tsc, it can use all tsc commands.

for example

```bash
# Listening mode
$ npx mwtsc --watch

# Use different tsconfig files
$ npx mwtsc --project tsconfig.production.json
```

More parameters can be consulted [tsc cli tool](https://www.typescriptlang.org/docs/handbook/compiler-options.html).

The following introduces more new parameters of midway.



## Run command

In order to make tsc effective during the code development period, midway provides a `run` parameter, which is used to execute a file after tsc is compiled successfully, which is similar to the `tsc-watch` module.

for example

```bash
$ mwtsc --watch --run @midwayjs/mock/app.js
```

The above command will execute the following logic:

* 1. Compile the code and execute the `@midwayjs/mock/app.js` file after successful compilation
* 2. If you modify the code, compilation will be automatically triggered. After killing the last executed file, the `@midwayjs/mock/app.js` file will be automatically executed.

The `run` parameter can execute any js file, and midway relies on this parameter for local development.

for example

```bash
$ npx mwtsc --watch --run ./bootstrap.js
```

Of course, it can also be used with other parameters.

```bash
$ npx mwtsc --watch --project tsconfig.production.json --run ./bootstrap.js
```

Note that the `run` command must be placed at the end, and all parameters after it will be passed to the child process.