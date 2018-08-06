# midway-bin

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
 
add `build` command for new midway.

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

## License

[MIT](LICENSE)
