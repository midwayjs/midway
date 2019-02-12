# midway-bin

[![Package Quality](http://npm.packagequality.com/shield/midway-bin.svg)](http://packagequality.com/#?package=midway-bin)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.

midway developer tool, extends [egg-bin].

---

## Install

```bash
$ npm i midway-bin --save-dev
```

## Usage

Add `midway-bin` to `package.json` scripts like [egg-bin], but just replace command by `midway-bin:

```json
{
  "scripts": {
    "dev": "midway-bin dev",
    "debug": "midway-bin debug",
    "test-local": "midway-bin test",
    "test": "npm run lint -- --fix && npm run midway-local",
    "cov": "midway-bin cov",
    "lint": "eslint .",
    "pkgfiles": "midway-bin pkgfiles",
    "autod": "midway-bin autod",
    "ci": "npm run lint && npm run autod -- --check && npm run pkgfiles -- --check && npm run cov"
  }
}
```

## Command

`midway-bin` add new command

- build
- clean
- doc
 
### build

build typescript source file to dist directory like `tsc`  and copy js/css/html file to same place.

```bash
$ midway-bin build
```

#### options

- `--clean -c` clean dist directory before build

#### copy static file

we can copy static file when ts file compiling.

```js
// in package.json
  "midway-bin-build": {
    "include": [
      "app/public",
      "app/view"
    ]
  }
```

it will be copy `src/app/public` to `${outDir}/app/public`.

The `outDir` field is configured in the `tsconfig.json` File, see [compiler-options](https://www.typescriptlang.org/docs/handbook/compiler-options.html).

### clean

clean a dist directory by build

```bash
$ midway-bin clean
```

### doc

generate application document by typedoc

```bash
$ midway-bin doc
```

#### options

like typedoc, see [link](https://typedoc.org/guides/arguments/)

- `--options [typedoc.js]` Specify a js option file that should be loaded.
- `--out [outPath]` Specifies the location the documentation should be written to.
- `--mode` default value is `file`, Specifies the output mode the project is used to be compiled with.
- `--exclude` Exclude files by the given pattern when a path is provided as source.
- `--theme` default value is `default` Specify the path to the theme that should be used.
- `--excludeExternals` default value is `true` Prevent externally resolved TypeScript files from being documented.
- `--ignoreCompilerErrors` default value is `true` Generates documentation, even if the project does not TypeScript compile.
- `--hideGenerator` default value is `true` Do not print the TypeDoc link at the end of the page.

> Tips: If the options parameter is supplied, the other default parameters are invalid

## License

[MIT](LICENSE)
