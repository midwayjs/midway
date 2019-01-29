# Midway


[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midwayjs/midway/blob/master/LICENSE)
[![GitHub tag](https://img.shields.io/github/tag/midwayjs/midway.svg)]()
[![Build Status](https://travis-ci.org/midwayjs/midway.svg?branch=develop)](https://travis-ci.org/midwayjs/midway)
[![Test Coverage](https://img.shields.io/codecov/c/github/midwayjs/midway/master.svg)](https://codecov.io/gh/midwayjs/midway/branch/master)
[![Package Quality](http://npm.packagequality.com/shield/midway.svg)](http://packagequality.com/#?package=midway)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Known Vulnerabilities](https://snyk.io/test/npm/midway/badge.svg)](https://snyk.io/test/npm/midway)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/856737478fa94e78bce39d5fc2315cec)](https://www.codacy.com/app/czy88840616/midway?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=midwayjs/midway&amp;utm_campaign=Badge_Grade)
[![Backers on Open Collective](https://opencollective.com/midway/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/midway/sponsors/badge.svg)](#sponsors)

Midway is a Node.js Web framework written by typescript, which uses the IoC injection mechanism to decouple the business logic of the application and make the development of large Node.js application easier and more natural.

## Installation

```bash
$ npm install midway --save
```
Node.js >= 8.0.0 required.

## Features

- ✔︎ Sophisticated group Middleware Architecture and compatibility
- ✔︎ Scalable plug-in capabilities and group plug-in Ecology
- ✔︎ Good application layering and decoupling capability
- ✔︎ Good development experience for the future
- ✔︎ Support Egg plugins and koa middleware


## Getting Started

Follow the commands listed below.

```bash
$ npm install midway-init -g
$ midway-init
$ npm install
$ npm run dev
$ open http://localhost:7001
```

## Docs & Community

- [Website && Documentations](https://midwayjs.org/midway/)
- [All Egg Plugins](https://github.com/search?q=topic%3Aegg-plugin&type=Repositories)

## Examples

See [midway-examples](https://github.com/midwayjs/midway-examples).

## Packages

midway is comprised of many specialized packages. This repository contains all these packages. Below you will find a summary of each package.

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|----------|
| [`midway`](https://github.com/midwayjs/midway/tree/master/packages/midway) | [![npm (scoped)](https://img.shields.io/npm/v/midway.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/packages/midway/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway)](https://david-dm.org/midwayjs/midway?path=packages/midway#info=devDependencies) |
| [`midway-web`](https://github.com/midwayjs/midway/tree/master/packages/midway-web) | [![npm (scoped)](https://img.shields.io/npm/v/midway-web.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-web/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-web)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-web) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-web)](https://david-dm.org/midwayjs/midway?path=packages/midway-web#info=devDependencies) |
| [`midway-core`](https://github.com/midwayjs/midway/tree/master/packages/midway-core) | [![npm (scoped)](https://img.shields.io/npm/v/midway-core.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-core/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-core)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-core) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-core)](https://david-dm.org/midwayjs/midway?path=packages/midway-core#info=devDependencies) |
| [`midway-mock`](https://github.com/midwayjs/midway/tree/master/packages/midway-mock) | [![npm (scoped)](https://img.shields.io/npm/v/midway-mock.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-mock/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-mock)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-mock) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-mock)](https://david-dm.org/midwayjs/midway?path=packages/midway-mock#info=devDependencies) |
| [`midway-init`](https://github.com/midwayjs/midway/tree/master/packages/midway-init) | [![npm (scoped)](https://img.shields.io/npm/v/midway-init.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-init/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-init)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-init) |  [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-init)](https://david-dm.org/midwayjs/midway?path=packages/midway-init#info=devDependencies) |
| [`midway-bin`](https://github.com/midwayjs/midway/tree/master/packages/midway-bin) | [![npm (scoped)](https://img.shields.io/npm/v/midway-bin.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-bin/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-bin)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-bin) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-bin)](https://david-dm.org/midwayjs/midway?path=packages/midway-bin#info=devDependencies) |
| [`midway-schedule`](https://github.com/midwayjs/midway/tree/master/packages/midway-schedule) | [![npm (scoped)](https://img.shields.io/npm/v/midway-schedule.svg?maxAge=86400)](https://github.com/midwayjs/midway/tree/master/midway-schedule/CHANGELOG.md) | [![Dependency Status](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-schedule)](https://david-dm.org/midwayjs/midway.svg?path=packages/midway-schedule) | [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-schedule)](https://david-dm.org/midwayjs/midway?path=packages/midway-schedule#info=devDependencies) |

Globally: [![Build Status](https://img.shields.io/travis/midwayjs/midway/master.svg?style=flat)](https://travis-ci.org/midwayjs/midway) [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg)](https://david-dm.org/midwayjs/midway#info=devDependencies)

## Contributors

Please let us know how can we help. Do check out [issues](http://github.com/midwayjs/midway/issues) for bug reports or suggestions first.

To become a contributor, please follow our contributing guide.

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/midwayjs/midway/graphs/contributors"><img src="https://opencollective.com/midway/contributors.svg?width=890&button=false" /></a>

## License

[MIT](http://github.com/midwayjs/midway/blob/master/LICENSE)
