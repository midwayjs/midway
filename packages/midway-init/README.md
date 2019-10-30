# midway-init

[![Package Quality](http://npm.packagequality.com/shield/midway-init.svg)](http://packagequality.com/#?package=midway-init)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.

Document: [https://midwayjs.org/midway](https://midwayjs.org/midway)

## Install

```bash
$ npm i midway-init -g
$ midway-init -h
```

## Create a boilerplate by type

```bash
$ midway-init --type midway-ts
```

## Or select a boilerplate by yourself

```bash
$ midway-init
? Hello, traveller.
  Which template do you like? … 
❯ midway-ts - Simple midway application boilerplate by ts.(by @midwayJs)
  midway-demo - Simple example boilerplate for find bug or submit to midway-examples.(by @midwayJs)
  midway-ts-strict - Simple midway application boilerplate by ts with ng style and strict eslint rules.(by @waitingsong)
  midway-ts-ant-design-pro - A front-end and back-end separation project includes midway(ts) and ant-design-pro.(by @tw93)

```
## Command
```
Usage: midway-init
Options:
  --type          boilerplate type                                                [string]
  --dir           target directory                                                [string]
  --template      local path to boilerplate                                       [string]
  --package       boilerplate package name                                        [string]
  --registry, -r  npm registry, support china/npm/custom, default to auto detect  [string]
  --version       Show version number                                             [boolean]
  -h, --help      Show help                                                       [boolean]
```

## Custom Template

You can custom your boilerplate by [light-generator](https://github.com/midwayjs/light-generator#%E6%A8%A1%E6%9D%BF%E8%A7%84%E5%88%99) and use it by command `midway-init --package [your package name]`

Example

```bash
midway-init --package=midway-boilerplate-typescript
```

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
