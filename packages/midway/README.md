# Midway


[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midwayjs/midway/blob/master/LICENSE)
[![GitHub tag](https://img.shields.io/github/tag/midwayjs/midway.svg)]()
[![Build Status](https://travis-ci.org/midwayjs/midway.svg?branch=develop)](https://travis-ci.org/midwayjs/midway)
[![Test Coverage](https://img.shields.io/codecov/c/github/midwayjs/midway/master.svg)](https://codecov.io/gh/midwayjs/midway/branch/master)
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
Node.js >= 10.16.0 required.

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

| Package | Version | Dependencies | DevDependencies | quality |
|--------|-------|------------|----------|----------|
| [`midway`] | [![midway-svg]][midway-ch] | [![midway-d-svg]][midway-d-link] | [![midway-dd-svg]][midway-dd-link] | [![midway-q-svg]][midway-q-link] |
| [`midway-web`] | [![web-svg]][web-ch] | [![web-d-svg]][web-d-link] | [![web-dd-svg]][web-dd-link] | [![web-q-svg]][web-q-link] | 
| [`midway-core`] | [![core-svg]][core-ch] | [![core-d-svg]][core-d-link] | [![core-dd-svg]][core-dd-link] | [![core-q-svg]][core-q-link] |
| [`midway-mock`] | [![mock-svg]][mock-ch] | [![mock-d-svg]][mock-d-link] | [![mock-dd-svg]][mock-dd-link] | [![mock-q-svg]][mock-q-link] |
| [`midway-init`] | [![init-svg]][init-ch] | [![init-d-svg]][init-d-link] | [![init-dd-svg]][init-dd-link] | [![init-q-svg]][init-q-link] |
| [`midway-bin`] | [![bin-svg]][bin-ch] | [![bin-d-svg]][bin-d-link] | [![bin-dd-svg]][bin-dd-link] | [![bin-q-svg]][bin-q-link] |
| [`midway-schedule`] | [![sch-svg]][sch-ch] | [![sch-d-svg]][sch-d-link] | [![sch-dd-svg]][sch-dd-link] | [![sch-q-svg]][sch-q-link] |

Globally: [![Build Status](https://img.shields.io/travis/midwayjs/midway/master.svg?style=flat)](https://travis-ci.org/midwayjs/midway) [![devDependency Status](https://david-dm.org/midwayjs/midway/dev-status.svg)](https://david-dm.org/midwayjs/midway#info=devDependencies)

## Contributors

Please let us know how can we help. Do check out [issues](http://github.com/midwayjs/midway/issues) for bug reports or suggestions first.

To become a contributor, please follow our contributing guide.

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/midwayjs/midway/graphs/contributors"><img src="https://opencollective.com/midway/contributors.svg?width=890&button=false" /></a>

## License

[MIT](http://github.com/midwayjs/midway/blob/master/LICENSE)


[`midway`]: https://github.com/midwayjs/midway/tree/master/packages/midway
[`midway-web`]: https://github.com/midwayjs/midway/tree/master/packages/midway-web
[`midway-core`]: https://github.com/midwayjs/midway/tree/master/packages/midway-core
[`midway-mock`]: https://github.com/midwayjs/midway/tree/master/packages/midway-mock
[`midway-init`]: https://github.com/midwayjs/midway/tree/master/packages/midway-init
[`midway-bin`]: https://github.com/midwayjs/midway/tree/master/packages/midway-bin
[`midway-schedule`]: https://github.com/midwayjs/midway/tree/master/packages/midway-schedule

[midway-svg]: https://img.shields.io/npm/v/midway.svg?maxAge=86400
[midway-ch]: https://github.com/midwayjs/midway/tree/master/packages/midway/CHANGELOG.md
[midway-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway
[midway-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway
[midway-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway
[midway-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway#info=devDependencies
[midway-q-svg]: https://npm.packagequality.com/shield/midway.svg
[midway-q-link]: https://packagequality.com/#?package=midway

[web-svg]: https://img.shields.io/npm/v/midway-web.svg?maxAge=86400
[web-ch]: https://github.com/midwayjs/midway/tree/master/midway-web/CHANGELOG.md
[web-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-web
[web-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-web
[web-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-web
[web-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-web#info=devDependencies
[web-q-svg]: https://npm.packagequality.com/shield/midway-web.svg
[web-q-link]: https://packagequality.com/#?package=midway-web

[core-svg]: https://img.shields.io/npm/v/midway-core.svg?maxAge=86400
[core-ch]: https://github.com/midwayjs/midway/tree/master/midway-core/CHANGELOG.md
[core-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-core
[core-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-core
[core-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-core
[core-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-core#info=devDependencies
[core-q-svg]: https://npm.packagequality.com/shield/midway-core.svg
[core-q-link]: https://packagequality.com/#?package=midway-core

[mock-svg]: https://img.shields.io/npm/v/midway-mock.svg?maxAge=86400
[mock-ch]: https://github.com/midwayjs/midway/tree/master/midway-mock/CHANGELOG.md
[mock-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-mock
[mock-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-mock
[mock-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-mock
[mock-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-mock#info=devDependencies
[mock-q-svg]: https://npm.packagequality.com/shield/midway-mock.svg
[mock-q-link]: https://packagequality.com/#?package=midway-mock

[init-svg]: https://img.shields.io/npm/v/midway-init.svg?maxAge=86400
[init-ch]: https://github.com/midwayjs/midway/tree/master/midway-init/CHANGELOG.md
[init-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-init
[init-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-init
[init-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-init
[init-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-init#info=devDependencies
[init-q-svg]: https://npm.packagequality.com/shield/midway-init.svg
[init-q-link]: https://packagequality.com/#?package=midway-init

[bin-svg]: https://img.shields.io/npm/v/midway-bin.svg?maxAge=86400
[bin-ch]: https://github.com/midwayjs/midway/tree/master/midway-bin/CHANGELOG.md
[bin-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-bin
[bin-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-bin
[bin-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-bin
[bin-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-bin#info=devDependencies
[bin-q-svg]: https://npm.packagequality.com/shield/midway-bin.svg
[bin-q-link]: https://packagequality.com/#?package=midway-bin

[sch-svg]: https://img.shields.io/npm/v/midway-schedule.svg?maxAge=86400
[sch-ch]: https://github.com/midwayjs/midway/tree/master/midway-schedule/CHANGELOG.md
[sch-d-svg]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-schedule
[sch-d-link]: https://david-dm.org/midwayjs/midway.svg?path=packages/midway-schedule
[sch-dd-svg]: https://david-dm.org/midwayjs/midway/dev-status.svg?path=packages/midway-schedule
[sch-dd-link]: https://david-dm.org/midwayjs/midway?path=packages/midway-schedule#info=devDependencies
[sch-q-svg]: https://npm.packagequality.com/shield/midway-schedule.svg
[sch-q-link]: https://packagequality.com/#?package=midway-schedule
