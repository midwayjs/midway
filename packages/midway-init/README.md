midway-init
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-init.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-init
[travis-image]: https://img.shields.io/travis/eggjs/egg-init.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-init
[codecov-image]: https://codecov.io/gh/eggjs/egg-init/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-init
[david-image]: https://img.shields.io/david/eggjs/egg-init.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-init
[snyk-image]: https://snyk.io/test/npm/egg-init/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-init
[download-image]: https://img.shields.io/npm/dm/egg-init.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-init

Init egg app helper tools.

## Install

```bash
$ npm i midway-init -g
$ midway-init -h
```

## Create a `simple` type application

```bash
$ midway-init --type simple [destination directory]
```

## Or select a boilerplate by yourself

```bash
$ midway-init dest
? Please select a boilerplate type (Use arrow keys)
❯ simple - Simple midway app
  plugin - midway plugin
```

## Command

```
Initializing midway project from boilerplate.
Usage: midway-init [dir] --type=simple

Options:
  --type          boilerplate type                                      [string]
  --dir           target directory                                      [string]
  --force, -f     force to override directory                          [boolean]
  --template      local path to boilerplate                             [string]
  --package       boilerplate package name                              [string]
  --registry, -r  npm registry, support china/npm/custom, default to auto detect
                                                                        [string]
  --silent        don't ask, just use default value                    [boolean]
  --version       Show version number                                  [boolean]
  -h, --help      Show help                                            [boolean]
```

## Custom a boilerplate

We use npm package to manager boilerplate, you can follow this steps:

- Create a new repo like [egg-boilerplate-plugin](https://github.com/eggjs/egg-boilerplate-plugin)
- Put all files under `boilerplate` dir
- Use `midway-init --template=PATH` to check
- `index.js` can define variables which can be useed on template, like `{{name}}`, but `\{{name}}` will ignore.

    ```js
    module.exports = {
      name: {
        desc: 'package-name',
      },
      pluginName: {
        desc: 'plugin-name',
        default(vars) {
          return vars.name;
        },
        filter(v) {
          return 'egg-' + v;
        },
      },
      description: {
        desc: 'my best plugin',
      },
      author: {
        desc: 'author',
        default: 'eggjs team'
      },
    };
    ```
- Write unit test, see `npm scripts` at [egg-boilerplate-simple](https://github.com/eggjs/egg-boilerplate-simple/blob/master/package.json#L5)
- Add your package name to [egg-init-config](https://github.com/eggjs/egg-init-config)'s package.json `config.boilerplate` property
- Publish your package to npm

## License

[MIT](LICENSE)
