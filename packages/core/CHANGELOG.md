# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.7.0](https://github.com/midwayjs/midway/compare/v3.6.1...v3.7.0) (2022-10-29)

### Bug Fixes

- framework loaded by import sequence ([#2394](https://github.com/midwayjs/midway/issues/2394)) ([c87f125](https://github.com/midwayjs/midway/commit/c87f1253c8ae217940f24efb7f97fe6fe61d20e4))

### Features

- **core:** add custom route param decorator ([#2400](https://github.com/midwayjs/midway/issues/2400)) ([#2441](https://github.com/midwayjs/midway/issues/2441)) ([d5895bf](https://github.com/midwayjs/midway/commit/d5895bf09f454b34345fc11b642e4529a555b19b))
- support default data source name ([#2430](https://github.com/midwayjs/midway/issues/2430)) ([b953a15](https://github.com/midwayjs/midway/commit/b953a153bf09869a0ad3ff5e9617ca6a3db5bf77))

# [3.6.0](https://github.com/midwayjs/midway/compare/v3.5.3...v3.6.0) (2022-10-10)

### Features

- add casbin module ([#2358](https://github.com/midwayjs/midway/issues/2358)) ([a7d2786](https://github.com/midwayjs/midway/commit/a7d27863b756dcf81abc4d7dedaf35c517c2c1e3))
- add filter params for add controller ([#2359](https://github.com/midwayjs/midway/issues/2359)) ([1805011](https://github.com/midwayjs/midway/commit/1805011d3b2d86f04d6a887f4a86afb093a2a75f))
- add guard ([#2345](https://github.com/midwayjs/midway/issues/2345)) ([1b952a1](https://github.com/midwayjs/midway/commit/1b952a1b09adbb88ff3cff9a2974eb1e37ce53a5))

## [3.5.3](https://github.com/midwayjs/midway/compare/v3.5.2...v3.5.3) (2022-09-25)

### Bug Fixes

- make addAspect public ([#2317](https://github.com/midwayjs/midway/issues/2317)) ([ded7a07](https://github.com/midwayjs/midway/commit/ded7a0798b4f94936f851b202e2406d6dd3902e6))

## [3.5.1](https://github.com/midwayjs/midway/compare/v3.5.0...v3.5.1) (2022-09-06)

### Bug Fixes

- glob with pattern ([#2293](https://github.com/midwayjs/midway/issues/2293)) ([1e05d41](https://github.com/midwayjs/midway/commit/1e05d41240094b0849caef53f10ef53a54e752ab))

### Features

- support receiver to bind this ([#2292](https://github.com/midwayjs/midway/issues/2292)) ([159184c](https://github.com/midwayjs/midway/commit/159184c87087cf9f76bc55a5cda46f90771bf7db))

# [3.5.0](https://github.com/midwayjs/midway/compare/v3.4.13...v3.5.0) (2022-08-29)

### Features

- add retry wrapper for invoke some remote data ([#2271](https://github.com/midwayjs/midway/issues/2271)) ([1c47338](https://github.com/midwayjs/midway/commit/1c473386937293104369cc8e5727c5330de4f85c))
- **core:** config option for validating database connection during initialization ([#2234](https://github.com/midwayjs/midway/issues/2234)) ([cf5d360](https://github.com/midwayjs/midway/commit/cf5d360d7300db12f12cc3e1ce67806ad082a7b1))

## [3.4.13](https://github.com/midwayjs/midway/compare/v3.4.12...v3.4.13) (2022-08-24)

### Bug Fixes

- passport strategy this missing ([#2264](https://github.com/midwayjs/midway/issues/2264)) ([2e5467a](https://github.com/midwayjs/midway/commit/2e5467a7c1cd4b7aa5574ddab624861dea54346b))

## [3.4.12](https://github.com/midwayjs/midway/compare/v3.4.11...v3.4.12) (2022-08-20)

### Bug Fixes

- service factory client & clients merge ([#2248](https://github.com/midwayjs/midway/issues/2248)) ([cfdee64](https://github.com/midwayjs/midway/commit/cfdee6449cb2770bc238e74fd754b783c331b822))

## [3.4.11](https://github.com/midwayjs/midway/compare/v3.4.10...v3.4.11) (2022-08-16)

### Bug Fixes

- IMiddleware interface ([#2242](https://github.com/midwayjs/midway/issues/2242)) ([1b435fb](https://github.com/midwayjs/midway/commit/1b435fb86f1ae141f2906b64c236fb8926c4c380))

## [3.4.10](https://github.com/midwayjs/midway/compare/v3.4.9...v3.4.10) (2022-08-12)

**Note:** Version bump only for package @midwayjs/core

## [3.4.9](https://github.com/midwayjs/midway/compare/v3.4.8...v3.4.9) (2022-08-10)

### Bug Fixes

- middleware repeat execute in request ([#2210](https://github.com/midwayjs/midway/issues/2210)) ([0466046](https://github.com/midwayjs/midway/commit/0466046a8843168459bcd5dedee4d17bad83301d))
- query parser with array ([#2207](https://github.com/midwayjs/midway/issues/2207)) ([94ddd69](https://github.com/midwayjs/midway/commit/94ddd691e2c0a8e06d88704d4e85a39443deef52))

### Features

- **core:** createInstance() accepts 3rd param cacheInstance (default true) ([#2208](https://github.com/midwayjs/midway/issues/2208)) ([a9149c2](https://github.com/midwayjs/midway/commit/a9149c2ae49a60085c910d8daaf2224aeef92c67))

### Performance Improvements

- move body patch without middleware ([#2209](https://github.com/midwayjs/midway/issues/2209)) ([97c9301](https://github.com/midwayjs/midway/commit/97c930107c6fa93d8209516b15348c988848ca3d))

## [3.4.7](https://github.com/midwayjs/midway/compare/v3.4.6...v3.4.7) (2022-08-01)

### Bug Fixes

- middleware disable in express ([#2187](https://github.com/midwayjs/midway/issues/2187)) ([8cad157](https://github.com/midwayjs/midway/commit/8cad157c84bf808763afa2d648c502fdd4264a54))
- unexpected token 'export' in load \*\*.d.ts file in prod mode ([#2185](https://github.com/midwayjs/midway/issues/2185)) ([6d634ce](https://github.com/midwayjs/midway/commit/6d634ce9361dd319e9d710118702e5543e42d4f0))

## [3.4.6](https://github.com/midwayjs/midway/compare/v3.4.5...v3.4.6) (2022-07-31)

### Bug Fixes

- sls metadata npe ([#2167](https://github.com/midwayjs/midway/issues/2167)) ([98bf8b5](https://github.com/midwayjs/midway/commit/98bf8b5ec4d47f69dd8e53dae9a702a9c550a9b1))

### Performance Improvements

- **core:** destroy connection concurrently within DataSourceManager.… ([#2169](https://github.com/midwayjs/midway/issues/2169)) ([53bcf65](https://github.com/midwayjs/midway/commit/53bcf65dc2699857a41a6400b4c04e0c46b30948))

## [3.4.4](https://github.com/midwayjs/midway/compare/v3.4.3...v3.4.4) (2022-07-25)

### Bug Fixes

- add config filter and modify sequelize & mongoose config ([#2150](https://github.com/midwayjs/midway/issues/2150)) ([5db3b9b](https://github.com/midwayjs/midway/commit/5db3b9b56b6eac393820acf9f089e6f8cdd6a8b6))

## [3.4.3](https://github.com/midwayjs/midway/compare/v3.4.2...v3.4.3) (2022-07-21)

### Bug Fixes

- sequelize typings and filter empty metadata([#2140](https://github.com/midwayjs/midway/issues/2140)) ([eaa360c](https://github.com/midwayjs/midway/commit/eaa360c028dca67d0df79efa61eed605d784c58d))
- throw error when authenticate ([#2141](https://github.com/midwayjs/midway/issues/2141)) ([730a282](https://github.com/midwayjs/midway/commit/730a28209162bb18b989cb783b54936a4bb747e0))

## [3.4.1](https://github.com/midwayjs/midway/compare/v3.4.0...v3.4.1) (2022-07-20)

### Bug Fixes

- class name and controller prefix conflict ([#2137](https://github.com/midwayjs/midway/issues/2137)) ([f6607ca](https://github.com/midwayjs/midway/commit/f6607cac43ff19cf669f03978817f13cc1da00fd))

# [3.4.0](https://github.com/midwayjs/midway/compare/v3.4.0-beta.12...v3.4.0) (2022-07-20)

**Note:** Version bump only for package @midwayjs/core

# [3.4.0-beta.12](https://github.com/midwayjs/midway/compare/v3.4.0-beta.11...v3.4.0-beta.12) (2022-07-20)

**Note:** Version bump only for package @midwayjs/core

# [3.4.0-beta.11](https://github.com/midwayjs/midway/compare/v3.4.0-beta.10...v3.4.0-beta.11) (2022-07-19)

### Bug Fixes

- async context manager key ([099e4a0](https://github.com/midwayjs/midway/commit/099e4a0a03465b258671b2de48e64df6109b08a5))

# [3.4.0-beta.10](https://github.com/midwayjs/midway/compare/v3.4.0-beta.9...v3.4.0-beta.10) (2022-07-18)

### Features

- add get current context manager global method ([#2129](https://github.com/midwayjs/midway/issues/2129)) ([2ac829f](https://github.com/midwayjs/midway/commit/2ac829fe4cb26851a21a211d17d9bfc2195beab6))

# [3.4.0-beta.9](https://github.com/midwayjs/midway/compare/v3.4.0-beta.8...v3.4.0-beta.9) (2022-07-14)

### Bug Fixes

- ignore middleware can't return in resolve ([#2112](https://github.com/midwayjs/midway/issues/2112)) ([ec018a3](https://github.com/midwayjs/midway/commit/ec018a3365b06c1cc809e014afede0a24ce1dd74))
- when `resolve` return null, the current loop should end, otherwi… ([#2114](https://github.com/midwayjs/midway/issues/2114)) ([cae3c8b](https://github.com/midwayjs/midway/commit/cae3c8b325d57b1da982eec55216eceaf4596cf9))

### Features

- add context manager with middleware ([#2116](https://github.com/midwayjs/midway/issues/2116)) ([99ba506](https://github.com/midwayjs/midway/commit/99ba506b82b1061af26bf333892ae90b654a7b31))

# [3.4.0-beta.8](https://github.com/midwayjs/midway/compare/v3.4.0-beta.7...v3.4.0-beta.8) (2022-07-12)

**Note:** Version bump only for package @midwayjs/core

# [3.4.0-beta.7](https://github.com/midwayjs/midway/compare/v3.4.0-beta.6...v3.4.0-beta.7) (2022-07-12)

### Bug Fixes

- regexp for root path match ([#2105](https://github.com/midwayjs/midway/issues/2105)) ([97ccc03](https://github.com/midwayjs/midway/commit/97ccc0391cd1436ef5106a7e35f0d81dca4477dd))

# [3.4.0-beta.6](https://github.com/midwayjs/midway/compare/v3.4.0-beta.5...v3.4.0-beta.6) (2022-07-07)

### Features

- add matched method in router service ([#2098](https://github.com/midwayjs/midway/issues/2098)) ([6c00665](https://github.com/midwayjs/midway/commit/6c006656d06587deee808160d536d785412f0c6d))

# [3.4.0-beta.5](https://github.com/midwayjs/midway/compare/v3.4.0-beta.4...v3.4.0-beta.5) (2022-07-07)

### Bug Fixes

- koa dynamic router case ([#2094](https://github.com/midwayjs/midway/issues/2094)) ([646ee6e](https://github.com/midwayjs/midway/commit/646ee6e95995136b7795c1f821a7b6e74ffdbbcd))

# [3.4.0-beta.4](https://github.com/midwayjs/midway/compare/v3.4.0-beta.3...v3.4.0-beta.4) (2022-07-04)

### Bug Fixes

- config export default case ([#2089](https://github.com/midwayjs/midway/issues/2089)) ([15c66d8](https://github.com/midwayjs/midway/commit/15c66d894e42bf488e3cb74084a1ecb17a42752b))

## [3.3.5](https://github.com/midwayjs/midway/compare/v3.3.4...v3.3.5) (2022-04-27)

### Bug Fixes

- throw error if config is invalid ([#1939](https://github.com/midwayjs/midway/issues/1939)) ([cc5fc1e](https://github.com/midwayjs/midway/commit/cc5fc1e0500554e52853246b90655c05f481fe6c))

## [3.3.4](https://github.com/midwayjs/midway/compare/v3.3.3...v3.3.4) (2022-04-21)

### Bug Fixes

- register app before framework init ([#1925](https://github.com/midwayjs/midway/issues/1925)) ([e2fd742](https://github.com/midwayjs/midway/commit/e2fd7425983e30b5ff61fe27db4215b05d33b778))

## [3.3.2](https://github.com/midwayjs/midway/compare/v3.3.1...v3.3.2) (2022-04-13)

### Bug Fixes

- main framework found ([#1903](https://github.com/midwayjs/midway/issues/1903)) ([8a22267](https://github.com/midwayjs/midway/commit/8a22267db744e2269e41089a27fd8e935c1f69e3))

## [3.3.1](https://github.com/midwayjs/midway/compare/v3.3.0...v3.3.1) (2022-04-11)

**Note:** Version bump only for package @midwayjs/core

# [3.3.0](https://github.com/midwayjs/midway/compare/v3.2.2...v3.3.0) (2022-04-07)

### Bug Fixes

- mapping prod and test config in object mode ([#1886](https://github.com/midwayjs/midway/issues/1886)) ([d00f622](https://github.com/midwayjs/midway/commit/d00f622f2a2dc095c8e829b862f2ac155a8e6c91))
- mock when app not start ([#1876](https://github.com/midwayjs/midway/issues/1876)) ([bd32f3e](https://github.com/midwayjs/midway/commit/bd32f3e3e366f5f81c05bfa2b00530ea5ec95744))

### Features

- upgrade ioredis to v5 ([#1893](https://github.com/midwayjs/midway/issues/1893)) ([42b3dc7](https://github.com/midwayjs/midway/commit/42b3dc723cd291d37f7fd40da90cf031a45f6d78))

## [3.2.2](https://github.com/midwayjs/midway/compare/v3.2.1...v3.2.2) (2022-03-30)

### Bug Fixes

- match and ignore method missing this ([#1868](https://github.com/midwayjs/midway/issues/1868)) ([4a3800a](https://github.com/midwayjs/midway/commit/4a3800a05a827b2beebc2e22d12ca8b16ffe0548))
- output error ([#1869](https://github.com/midwayjs/midway/issues/1869)) ([e804fc0](https://github.com/midwayjs/midway/commit/e804fc07e4eb07c49e28c8cd2d995401dee71dda))

# [3.2.0](https://github.com/midwayjs/midway/compare/v3.1.6...v3.2.0) (2022-03-25)

### Bug Fixes

- throw error when cluster exec ([#1848](https://github.com/midwayjs/midway/issues/1848)) ([bf0e209](https://github.com/midwayjs/midway/commit/bf0e209ec724ab41b5bc9b43b08d7c44d3b77e3b))

## [3.1.6](https://github.com/midwayjs/midway/compare/v3.1.5...v3.1.6) (2022-03-21)

**Note:** Version bump only for package @midwayjs/core

## [3.1.5](https://github.com/midwayjs/midway/compare/v3.1.4...v3.1.5) (2022-03-18)

**Note:** Version bump only for package @midwayjs/core

## [3.1.2](https://github.com/midwayjs/midway/compare/v3.1.1...v3.1.2) (2022-03-15)

### Bug Fixes

- add a inject for [@inject](https://github.com/inject) logger in singleton scope ([#1816](https://github.com/midwayjs/midway/issues/1816)) ([4e9cf96](https://github.com/midwayjs/midway/commit/4e9cf96793acff829a2a8ca6598081cc331d6d25))

### Features

- add otel component ([#1808](https://github.com/midwayjs/midway/issues/1808)) ([8fda71e](https://github.com/midwayjs/midway/commit/8fda71e82cedfcf05e590780c55fbff10c4132cb))

## [3.1.1](https://github.com/midwayjs/midway/compare/v3.1.0...v3.1.1) (2022-03-09)

### Bug Fixes

- default error dir and loadMidwayController ([#1791](https://github.com/midwayjs/midway/issues/1791)) ([4fd6b64](https://github.com/midwayjs/midway/commit/4fd6b643d683b85335f4bd314a9574ef8501a3f6))
- preload module position ([#1794](https://github.com/midwayjs/midway/issues/1794)) ([1456a83](https://github.com/midwayjs/midway/commit/1456a83fd2bd2afc1b3d92b4d1315ad6af7650df))

# [3.1.0](https://github.com/midwayjs/midway/compare/v3.0.13...v3.1.0) (2022-03-07)

### Bug Fixes

- egg logger create context logger case ([#1760](https://github.com/midwayjs/midway/issues/1760)) ([f9bebf1](https://github.com/midwayjs/midway/commit/f9bebf18cffbced4bd596d1ab39b585ea4d6a229))
- express use router and middleware ([#1777](https://github.com/midwayjs/midway/issues/1777)) ([21a69bb](https://github.com/midwayjs/midway/commit/21a69bbfc5535aaafcb3751f4c0c54ffcf109e9d))
- not transform when RouteParam got undefined ([#1762](https://github.com/midwayjs/midway/issues/1762)) ([d714e31](https://github.com/midwayjs/midway/commit/d714e317aec771c8971bf6093c767eba9bccc976))
- use hook to load egg application ([#1782](https://github.com/midwayjs/midway/issues/1782)) ([b47f27b](https://github.com/midwayjs/midway/commit/b47f27bf441431ddb1d0d35d5ee0ae80ae56fce8))

## [3.0.13](https://github.com/midwayjs/midway/compare/v3.0.12...v3.0.13) (2022-03-01)

### Bug Fixes

- **deps:** update dependency raw-body to v2.5.1 ([#1754](https://github.com/midwayjs/midway/issues/1754)) ([6d9d819](https://github.com/midwayjs/midway/commit/6d9d819a3628ac8ecf91e75120a73f0533ba4bc9))

## [3.0.11](https://github.com/midwayjs/midway/compare/v3.0.10...v3.0.11) (2022-02-25)

### Bug Fixes

- none level ([#1744](https://github.com/midwayjs/midway/issues/1744)) ([dccb726](https://github.com/midwayjs/midway/commit/dccb7260ad98f9e702392deea6984a65b9bef985))

## [3.0.10](https://github.com/midwayjs/midway/compare/v3.0.9...v3.0.10) (2022-02-24)

### Bug Fixes

- **deps:** update dependency raw-body to v2.5.0 ([#1731](https://github.com/midwayjs/midway/issues/1731)) ([6caec96](https://github.com/midwayjs/midway/commit/6caec96b976b9dce1a8cda4d3f809efd346ceaf5))
- remove configuration resolve handler and add detectorOptions ([#1740](https://github.com/midwayjs/midway/issues/1740)) ([7af24e8](https://github.com/midwayjs/midway/commit/7af24e8cc55f0ba798b4d774084ace4069a8a54c))

## [3.0.9](https://github.com/midwayjs/midway/compare/v3.0.8...v3.0.9) (2022-02-21)

### Bug Fixes

- redis on method missing ([#1729](https://github.com/midwayjs/midway/issues/1729)) ([61fde02](https://github.com/midwayjs/midway/commit/61fde024324b9774d51dd9ebd805883207f783b5))

## [3.0.7](https://github.com/midwayjs/midway/compare/v3.0.6...v3.0.7) (2022-02-17)

**Note:** Version bump only for package @midwayjs/core

## [3.0.6](https://github.com/midwayjs/midway/compare/v3.0.5...v3.0.6) (2022-02-13)

### Bug Fixes

- missing import component will be throw error ([#1694](https://github.com/midwayjs/midway/issues/1694)) ([c17f049](https://github.com/midwayjs/midway/commit/c17f049ef698ba55509e4ef5ea915668345dc50f))

## [3.0.4](https://github.com/midwayjs/midway/compare/v3.0.3...v3.0.4) (2022-02-09)

### Bug Fixes

- run in egg cluster mode ([#1645](https://github.com/midwayjs/midway/issues/1645)) ([d6146cc](https://github.com/midwayjs/midway/commit/d6146cccb4ffa9158d87c1f64199bce9f408b43c))
- supertest typings and createFunctionApp ([#1642](https://github.com/midwayjs/midway/issues/1642)) ([484f4f4](https://github.com/midwayjs/midway/commit/484f4f41b3b9e889d4d285f4871a0b37fa51e73f))

### Features

- move context format to user config ([#1673](https://github.com/midwayjs/midway/issues/1673)) ([db53b8e](https://github.com/midwayjs/midway/commit/db53b8eaf22b50df61945ff11086e1eb7aec99a1))

## [3.0.2](https://github.com/midwayjs/midway/compare/v3.0.1...v3.0.2) (2022-01-24)

### Bug Fixes

- singleton invoke request scope not valid ([#1622](https://github.com/midwayjs/midway/issues/1622)) ([f97c063](https://github.com/midwayjs/midway/commit/f97c0632107b47cf357d17774a4e4bb5233bba57))

## [3.0.1](https://github.com/midwayjs/midway/compare/v3.0.0...v3.0.1) (2022-01-24)

### Bug Fixes

- [#1610](https://github.com/midwayjs/midway/issues/1610) use origin args when parameter decorator throw error ([#1613](https://github.com/midwayjs/midway/issues/1613)) ([797ece6](https://github.com/midwayjs/midway/commit/797ece6364b1b512d64aeb82f51ddcb97ef42c0f))

# [3.0.0](https://github.com/midwayjs/midway/compare/v3.0.0-beta.17...v3.0.0) (2022-01-20)

**Note:** Version bump only for package @midwayjs/core

# [3.0.0-beta.17](https://github.com/midwayjs/midway/compare/v3.0.0-beta.16...v3.0.0-beta.17) (2022-01-18)

### Features

- add static file ([#1597](https://github.com/midwayjs/midway/issues/1597)) ([2e6baae](https://github.com/midwayjs/midway/commit/2e6baae852f338023e39c72801e6c89319dd2e2e))
- support multi root ([#1584](https://github.com/midwayjs/midway/issues/1584)) ([b23dda2](https://github.com/midwayjs/midway/commit/b23dda258563fba143f23c8779680df3ab8ec3d5))
- throw error when singleton invoke request scope ([#1589](https://github.com/midwayjs/midway/issues/1589)) ([e71bfa8](https://github.com/midwayjs/midway/commit/e71bfa8cc43317989adebd4a2f7b6a24a74e36be))

# [3.0.0-beta.16](https://github.com/midwayjs/midway/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2022-01-11)

**Note:** Version bump only for package @midwayjs/core

# [3.0.0-beta.15](https://github.com/midwayjs/midway/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2022-01-07)

### Bug Fixes

- serverless app run ([#1523](https://github.com/midwayjs/midway/issues/1523)) ([5a25eb7](https://github.com/midwayjs/midway/commit/5a25eb7ebb17bf9b0e2ba4feee5bc1649f70d56f))

### Features

- add data listener ([#1525](https://github.com/midwayjs/midway/issues/1525)) ([0bd0db8](https://github.com/midwayjs/midway/commit/0bd0db8c7f3338c754ae852619bbbb4f2336cc16))
- add secret filter ([#1531](https://github.com/midwayjs/midway/issues/1531)) ([ce77e48](https://github.com/midwayjs/midway/commit/ce77e4804aaffc18a0a091d3726e36d7ec1514b2))

# [3.0.0-beta.14](https://github.com/midwayjs/midway/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2022-01-04)

### Bug Fixes

- cos config definition & 3.x doc update ([#1515](https://github.com/midwayjs/midway/issues/1515)) ([0ac7ac5](https://github.com/midwayjs/midway/commit/0ac7ac5805b7ab8873f8792fc1712a74e3223172))

# [3.0.0-beta.13](https://github.com/midwayjs/midway/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2021-12-30)

### Features

- 404 error ([#1465](https://github.com/midwayjs/midway/issues/1465)) ([e7e8a9d](https://github.com/midwayjs/midway/commit/e7e8a9dedfa7198ac05b161b41024c2871f93965))
- add custom decorator filter ([#1477](https://github.com/midwayjs/midway/issues/1477)) ([97501a9](https://github.com/midwayjs/midway/commit/97501a989abc211b0c7400b1df45e050bb237c6a))

# [3.0.0-beta.12](https://github.com/midwayjs/midway/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2021-12-28)

### Features

- custom error code & add @Files/@Fields ([#1438](https://github.com/midwayjs/midway/issues/1438)) ([b0032af](https://github.com/midwayjs/midway/commit/b0032afd2fa9ea0416fe69f4bd0c1a58bea5314e))
- support throw err status ([#1440](https://github.com/midwayjs/midway/issues/1440)) ([7b98110](https://github.com/midwayjs/midway/commit/7b98110d65c5287a8fcb3eb5356dea2d7a32cee9))

# [3.0.0-beta.11](https://github.com/midwayjs/midway/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2021-12-21)

**Note:** Version bump only for package @midwayjs/core

# [3.0.0-beta.10](https://github.com/midwayjs/midway/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2021-12-20)

### Features

- default add session & bodyparser support for koa/express/faas ([#1420](https://github.com/midwayjs/midway/issues/1420)) ([cdaff31](https://github.com/midwayjs/midway/commit/cdaff317c3e862a95494a167995a28280af639bf))
- implement i18n for validate ([#1426](https://github.com/midwayjs/midway/issues/1426)) ([4c7ed2f](https://github.com/midwayjs/midway/commit/4c7ed2ff2e7ccf10f88f62abad230f92f5e76b97))

# [3.0.0-beta.9](https://github.com/midwayjs/midway/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2021-12-09)

### Bug Fixes

- faas missing config in framework ([#1413](https://github.com/midwayjs/midway/issues/1413)) ([7ab16a2](https://github.com/midwayjs/midway/commit/7ab16a24b29d5254a762bfffcdf18385effdf639))

# [3.0.0-beta.8](https://github.com/midwayjs/midway/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2021-12-08)

### Bug Fixes

- express routing middleware takes effect at the controller level ([#1364](https://github.com/midwayjs/midway/issues/1364)) ([b9272e0](https://github.com/midwayjs/midway/commit/b9272e0971003443304b0c53815be31a0061b4bd))

# [3.0.0-beta.7](https://github.com/midwayjs/midway/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2021-12-03)

### Bug Fixes

- add app.keys ([#1395](https://github.com/midwayjs/midway/issues/1395)) ([c44afc6](https://github.com/midwayjs/midway/commit/c44afc6cc6764a959d1fa7ae04d60099282d156a))
- middleware with ctx.body ([#1389](https://github.com/midwayjs/midway/issues/1389)) ([77af5c0](https://github.com/midwayjs/midway/commit/77af5c0b456f1843f4dcfd3dbfd2c0aa244c51bd))

# [3.0.0-beta.6](https://github.com/midwayjs/midway/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2021-11-26)

### Bug Fixes

- class transformer method missing ([#1387](https://github.com/midwayjs/midway/issues/1387)) ([074e839](https://github.com/midwayjs/midway/commit/074e8393598dc95e2742f735df75a2191c5fe25d))

# [3.0.0-beta.5](https://github.com/midwayjs/midway/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2021-11-25)

### Bug Fixes

- [@match](https://github.com/match) empty args ([#1384](https://github.com/midwayjs/midway/issues/1384)) ([6f90fc9](https://github.com/midwayjs/midway/commit/6f90fc993ff01e078288ff664833c61c02dede51))
- router sort ([#1383](https://github.com/midwayjs/midway/issues/1383)) ([f253887](https://github.com/midwayjs/midway/commit/f2538876d3eaf7dec55173d86b5b9caeeeb7be64))

# [3.0.0-beta.4](https://github.com/midwayjs/midway/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2021-11-24)

### Bug Fixes

- logger close before bootstrap close ([#1370](https://github.com/midwayjs/midway/issues/1370)) ([6cc2720](https://github.com/midwayjs/midway/commit/6cc2720ed3445e8ffccc96d124b80ed7e2517f08))

### Features

- add i18n ([#1375](https://github.com/midwayjs/midway/issues/1375)) ([bffefe0](https://github.com/midwayjs/midway/commit/bffefe07afe45777d49b5a76b9ab17fc2b9d9a55))
- auto transform args to type ([#1372](https://github.com/midwayjs/midway/issues/1372)) ([bb3f7d2](https://github.com/midwayjs/midway/commit/bb3f7d2028a034e1926d9df554849332354c3762))
- support global prefix url ([#1371](https://github.com/midwayjs/midway/issues/1371)) ([cc5fe44](https://github.com/midwayjs/midway/commit/cc5fe44e1d221590562dc71e1f33ae96093e0da7))

# [3.0.0-beta.3](https://github.com/midwayjs/midway/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2021-11-18)

### Features

- add component and framework config definition ([#1367](https://github.com/midwayjs/midway/issues/1367)) ([b2fe615](https://github.com/midwayjs/midway/commit/b2fe6157f99659471ff1333eca0b86bb889f61a3))

# [3.0.0-beta.2](https://github.com/midwayjs/midway/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2021-11-16)

**Note:** Version bump only for package @midwayjs/core

# [3.0.0-beta.1](https://github.com/midwayjs/midway/compare/v2.12.4...v3.0.0-beta.1) (2021-11-14)

### Bug Fixes

- circular inject for provide uuid ([#1285](https://github.com/midwayjs/midway/issues/1285)) ([34533bf](https://github.com/midwayjs/midway/commit/34533bfe9bf1c4acdffb1360ab24c716b5196de8))
- component env filter ([#1234](https://github.com/midwayjs/midway/issues/1234)) ([1ad365f](https://github.com/midwayjs/midway/commit/1ad365fd8ef5e0e7dae3d08a2427a2300038290a))
- correct aspect chain bug ([#1204](https://github.com/midwayjs/midway/issues/1204)) ([5de5284](https://github.com/midwayjs/midway/commit/5de5284c70b44acc73eaaad651fd2edc72d54f28))
- empty options in default ([#1241](https://github.com/midwayjs/midway/issues/1241)) ([802109d](https://github.com/midwayjs/midway/commit/802109ddd098afb04d6d540bff509e0aee85b806))
- functional configuration load async code ([#1300](https://github.com/midwayjs/midway/issues/1300)) ([32bcf03](https://github.com/midwayjs/midway/commit/32bcf030ed1ab04482dc557f8b0c6904e47b31e1))
- load component with enabledEnvironment ([#1329](https://github.com/midwayjs/midway/issues/1329)) ([3182271](https://github.com/midwayjs/midway/commit/3182271a1eab931e2bf872bff6e2725ebb906ad0))
- static prefix ([#1321](https://github.com/midwayjs/midway/issues/1321)) ([31fe961](https://github.com/midwayjs/midway/commit/31fe961931fed7656a144b1682ee4c4bb25fdff5))

### Features

- add mongoose component and support multi-instance for typegoose ([#1334](https://github.com/midwayjs/midway/issues/1334)) ([ca0b73f](https://github.com/midwayjs/midway/commit/ca0b73fec77e8871e4001b4c9d3e45397ce32450))
- add redis component ([#1270](https://github.com/midwayjs/midway/issues/1270)) ([09c993a](https://github.com/midwayjs/midway/commit/09c993ac308d26fa9c742a659471c3f4cf5c5782))

## [2.12.3](https://github.com/midwayjs/midway/compare/v2.12.2...v2.12.3) (2021-08-09)

### Features

- support object config load and async config ([#1212](https://github.com/midwayjs/midway/issues/1212)) ([a035ccb](https://github.com/midwayjs/midway/commit/a035ccbb513b0ba423bd2b48bc228b5e916c89e8))

## [2.12.1](https://github.com/midwayjs/midway/compare/v2.12.0...v2.12.1) (2021-08-01)

### Features

- add http client component ([#1098](https://github.com/midwayjs/midway/issues/1098)) ([4e2f90a](https://github.com/midwayjs/midway/commit/4e2f90a9de946fa5abc2af4cd8a0ad9ee4188991))

# [2.12.0](https://github.com/midwayjs/midway/compare/v2.11.7...v2.12.0) (2021-07-30)

### Features

- add oss component ([#1181](https://github.com/midwayjs/midway/issues/1181)) ([e83171c](https://github.com/midwayjs/midway/commit/e83171c73cdc1098796f06919dc652a6d83c3af4))

## [2.11.6](https://github.com/midwayjs/midway/compare/v2.11.5...v2.11.6) (2021-07-16)

**Note:** Version bump only for package @midwayjs/core

## [2.11.5](https://github.com/midwayjs/midway/compare/v2.11.4...v2.11.5) (2021-07-15)

**Note:** Version bump only for package @midwayjs/core

## [2.11.4](https://github.com/midwayjs/midway/compare/v2.11.3...v2.11.4) (2021-07-06)

### Bug Fixes

- @Func decorator with empty metadata ([#1137](https://github.com/midwayjs/midway/issues/1137)) ([621a99a](https://github.com/midwayjs/midway/commit/621a99a9ee77a8f370a28a395363f585057bd054))
- add target parameter ([#1139](https://github.com/midwayjs/midway/issues/1139)) ([5be4757](https://github.com/midwayjs/midway/commit/5be475710ee19e16a99643a355f7f1774f3435bc))

## [2.11.3](https://github.com/midwayjs/midway/compare/v2.11.2...v2.11.3) (2021-07-02)

### Bug Fixes

- uppercase for header decorator ([#1123](https://github.com/midwayjs/midway/issues/1123)) ([cfcfb1f](https://github.com/midwayjs/midway/commit/cfcfb1fb8860b110e2671e9bff57f6c537f11f90))

## [2.11.2](https://github.com/midwayjs/midway/compare/v2.11.1...v2.11.2) (2021-06-28)

**Note:** Version bump only for package @midwayjs/core

## [2.11.1](https://github.com/midwayjs/midway/compare/v2.11.0...v2.11.1) (2021-06-19)

### Bug Fixes

- ignore directory with app prefix ([#1100](https://github.com/midwayjs/midway/issues/1100)) ([0911635](https://github.com/midwayjs/midway/commit/09116355bf7f34892d1c7ad975047ed20e65bee5))

# [2.11.0](https://github.com/midwayjs/midway/compare/v2.10.19...v2.11.0) (2021-06-10)

**Note:** Version bump only for package @midwayjs/core

## [2.10.18](https://github.com/midwayjs/midway/compare/v2.10.17...v2.10.18) (2021-05-26)

### Features

- add decorator metadata ([#1072](https://github.com/midwayjs/midway/issues/1072)) ([db4de9c](https://github.com/midwayjs/midway/commit/db4de9cd787bdbe1effca61dfe162f6678ad5d66))

## [2.10.14](https://github.com/midwayjs/midway/compare/v2.10.13...v2.10.14) (2021-05-11)

### Bug Fixes

- serverless app more method ([#1034](https://github.com/midwayjs/midway/issues/1034)) ([9c44c3f](https://github.com/midwayjs/midway/commit/9c44c3f58930d0c12464d00eceee93cb9e7aaa62))

## [2.10.13](https://github.com/midwayjs/midway/compare/v2.10.12...v2.10.13) (2021-05-08)

### Bug Fixes

- remove zlib ([#1035](https://github.com/midwayjs/midway/issues/1035)) ([cc2cd40](https://github.com/midwayjs/midway/commit/cc2cd405a104b3388d93a09d981b59b472fd8ea1))

## [2.10.12](https://github.com/midwayjs/midway/compare/v2.10.11...v2.10.12) (2021-05-07)

### Bug Fixes

- change all requestMethod to real method for serverless http request ([#1028](https://github.com/midwayjs/midway/issues/1028)) ([23e2943](https://github.com/midwayjs/midway/commit/23e29436e3a1b3ab10484171f0dfcd5de068f124))
- throw error when router duplicate ([#1023](https://github.com/midwayjs/midway/issues/1023)) ([61bc58d](https://github.com/midwayjs/midway/commit/61bc58d29d637f1c9e54fec0a09f24d90c1286c9))

## [2.10.11](https://github.com/midwayjs/midway/compare/v2.10.10...v2.10.11) (2021-04-29)

### Bug Fixes

- lifecycle missing container when run onStop method ([#1016](https://github.com/midwayjs/midway/issues/1016)) ([3b6303c](https://github.com/midwayjs/midway/commit/3b6303c7bba0d28e821da8062ae71aa4c1029d63))
- load functional config ([#1017](https://github.com/midwayjs/midway/issues/1017)) ([51566c0](https://github.com/midwayjs/midway/commit/51566c08124275798b92d3c931b27a86a48a2ba7))

## [2.10.10](https://github.com/midwayjs/midway/compare/v2.10.9...v2.10.10) (2021-04-24)

### Bug Fixes

- router sort ([#1009](https://github.com/midwayjs/midway/issues/1009)) ([e9bf8ed](https://github.com/midwayjs/midway/commit/e9bf8ed0a6537714e3004a334e417994ea369aa9))

## [2.10.9](https://github.com/midwayjs/midway/compare/v2.10.8...v2.10.9) (2021-04-21)

### Bug Fixes

- revert missing code ([#1006](https://github.com/midwayjs/midway/issues/1006)) ([132bdbb](https://github.com/midwayjs/midway/commit/132bdbb96a88b92b7635072840e58c011ebfcb13))

## [2.10.8](https://github.com/midwayjs/midway/compare/v2.10.7...v2.10.8) (2021-04-21)

**Note:** Version bump only for package @midwayjs/core

## [2.10.7](https://github.com/midwayjs/midway/compare/v2.10.6...v2.10.7) (2021-04-17)

### Bug Fixes

- add event name args ([#986](https://github.com/midwayjs/midway/issues/986)) ([bfd8232](https://github.com/midwayjs/midway/commit/bfd82320aee8600d8fa30bd2821a0e68c80fd755))
- format ([#997](https://github.com/midwayjs/midway/issues/997)) ([456cc14](https://github.com/midwayjs/midway/commit/456cc14513bdb000d1aa3130e9719caf7a8a803f))
- inject class when use component by import string ([#996](https://github.com/midwayjs/midway/issues/996)) ([8bfda7d](https://github.com/midwayjs/midway/commit/8bfda7da4b4a0d34bf0b0d0291416ef4655fb8a5))

## [2.10.6](https://github.com/midwayjs/midway/compare/v2.10.5...v2.10.6) (2021-04-14)

**Note:** Version bump only for package @midwayjs/core

## [2.10.5](https://github.com/midwayjs/midway/compare/v2.10.4...v2.10.5) (2021-04-13)

### Bug Fixes

- configuration file path join on windows ([#984](https://github.com/midwayjs/midway/issues/984)) ([099e76c](https://github.com/midwayjs/midway/commit/099e76ca892decd02b536b97494590f598d140ac))

### Features

- support getCurrentApplicationContext API ([#981](https://github.com/midwayjs/midway/issues/981)) ([dd6ce11](https://github.com/midwayjs/midway/commit/dd6ce11d6f8eb2884eb1b03b171a069f55aec04f))

## [2.10.4](https://github.com/midwayjs/midway/compare/v2.10.3...v2.10.4) (2021-04-10)

### Bug Fixes

- clear container cache when test ([#978](https://github.com/midwayjs/midway/issues/978)) ([a202075](https://github.com/midwayjs/midway/commit/a202075b52d281e06f1ed7c6139e968fafc960f6))

## [2.10.3](https://github.com/midwayjs/midway/compare/v2.10.2...v2.10.3) (2021-04-07)

**Note:** Version bump only for package @midwayjs/core

## [2.10.2](https://github.com/midwayjs/midway/compare/v2.10.1...v2.10.2) (2021-04-05)

### Bug Fixes

- load config once and support load singleton service before framework start ([#970](https://github.com/midwayjs/midway/issues/970)) ([201dd59](https://github.com/midwayjs/midway/commit/201dd5930bd97f62e5717777b2941b47b54d68c6))

# [2.10.0](https://github.com/midwayjs/midway/compare/v2.9.3...v2.10.0) (2021-04-02)

### Bug Fixes

- directory filter and ignore test pattern ([#957](https://github.com/midwayjs/midway/issues/957)) ([dbd1a5a](https://github.com/midwayjs/midway/commit/dbd1a5a4bc712a5ce14c409a7f2aee96e34eea4f))

### Features

- use @ServerlessTrigger replace functions in f.yml ([#919](https://github.com/midwayjs/midway/issues/919)) ([a85af14](https://github.com/midwayjs/midway/commit/a85af14e06231e8cd82eff8755794ffd13c3ad95))

## [2.9.2](https://github.com/midwayjs/midway/compare/v2.9.1...v2.9.2) (2021-03-27)

**Note:** Version bump only for package @midwayjs/core

## [2.9.1](https://github.com/midwayjs/midway/compare/v2.9.0...v2.9.1) (2021-03-24)

**Note:** Version bump only for package @midwayjs/core

# [2.9.0](https://github.com/midwayjs/midway/compare/v2.8.13...v2.9.0) (2021-03-22)

### Bug Fixes

- create log dir in serverless environment ([#935](https://github.com/midwayjs/midway/issues/935)) ([8a15f69](https://github.com/midwayjs/midway/commit/8a15f694a19a6274bce5172f1dce716ef3d8c0a8))
- providerWrapper get empty object in component ([#926](https://github.com/midwayjs/midway/issues/926)) ([5e46d19](https://github.com/midwayjs/midway/commit/5e46d19386ae91820e9df71a02a3de7b3f54d3dc))

### Features

- add midway cache ([#911](https://github.com/midwayjs/midway/issues/911)) ([cc49eee](https://github.com/midwayjs/midway/commit/cc49eee739ba6d2c37b9270b6cf5239afde4a912))
- add socket.io-redis support ([#874](https://github.com/midwayjs/midway/issues/874)) ([2818920](https://github.com/midwayjs/midway/commit/2818920b9d3391c81666c5b8587a899b9b237d9e))
- run multi framework in one process ([#925](https://github.com/midwayjs/midway/issues/925)) ([330555f](https://github.com/midwayjs/midway/commit/330555f93b9af2a783771edd58bb9431a325938f))
- support bootstrap load config first ([#931](https://github.com/midwayjs/midway/issues/931)) ([ae9ed26](https://github.com/midwayjs/midway/commit/ae9ed261aacdb483d3a9a612be79fff384503bcc))

## [2.8.13](https://github.com/midwayjs/midway/compare/v2.8.12...v2.8.13) (2021-03-17)

### Bug Fixes

- add missing typings ([#924](https://github.com/midwayjs/midway/issues/924)) ([a17c8d8](https://github.com/midwayjs/midway/commit/a17c8d8655d3f7a93469b922529b7a1aba212c10))

## [2.8.11](https://github.com/midwayjs/midway/compare/v2.8.10...v2.8.11) (2021-03-12)

### Features

- compatible read config.prod and config.unittest ([#899](https://github.com/midwayjs/midway/issues/899)) ([f90cfe3](https://github.com/midwayjs/midway/commit/f90cfe3a28912ad43f371aff66d4a52e9efa3a68))

## [2.8.9](https://github.com/midwayjs/midway/compare/v2.8.8...v2.8.9) (2021-03-08)

### Bug Fixes

- delete method parse body and form body ([#891](https://github.com/midwayjs/midway/issues/891)) ([f5c1e70](https://github.com/midwayjs/midway/commit/f5c1e7042ed85656e323563421391a719999979e))

## [2.8.8](https://github.com/midwayjs/midway/compare/v2.8.7...v2.8.8) (2021-03-06)

### Bug Fixes

- app proxy ([#886](https://github.com/midwayjs/midway/issues/886)) ([e8fba77](https://github.com/midwayjs/midway/commit/e8fba77ea9920a9bc0b48011f85d77717cab77fd))
- handler ([#885](https://github.com/midwayjs/midway/issues/885)) ([89c6b53](https://github.com/midwayjs/midway/commit/89c6b53d2de8601394d1799c914dbf8177d37f5b))

## [2.8.7](https://github.com/midwayjs/midway/compare/v2.8.6...v2.8.7) (2021-03-04)

### Bug Fixes

- exports missing ([#884](https://github.com/midwayjs/midway/issues/884)) ([a360a0e](https://github.com/midwayjs/midway/commit/a360a0e645a9551cb9d90ceaf7871f3e0ab5b4d3))

## [2.8.6](https://github.com/midwayjs/midway/compare/v2.8.5...v2.8.6) (2021-03-03)

### Bug Fixes

- load custom framework in midwayjs/web ([#883](https://github.com/midwayjs/midway/issues/883)) ([7a11cac](https://github.com/midwayjs/midway/commit/7a11cac1cea753e781ac358a75277400f8aa87bf))

## [2.8.5](https://github.com/midwayjs/midway/compare/v2.8.4...v2.8.5) (2021-03-03)

### Bug Fixes

- empty framework ready ([#882](https://github.com/midwayjs/midway/issues/882)) ([a2dc36f](https://github.com/midwayjs/midway/commit/a2dc36f8dd785e7dce3a5499f5774b990dfd33c4))

## [2.8.4](https://github.com/midwayjs/midway/compare/v2.8.3...v2.8.4) (2021-03-03)

### Bug Fixes

- case ([df2efb6](https://github.com/midwayjs/midway/commit/df2efb6837ee1bdb877825bc7869b82d9e220fb1))
- check case ([4df51ed](https://github.com/midwayjs/midway/commit/4df51ed64157a7b3f76bc050825cf2b59182cc07))
- get singleton from shared context ([3ebcf13](https://github.com/midwayjs/midway/commit/3ebcf13ab0f4151e507b51cda219682859f648d3))
- multi framework run configuration ([44abb6c](https://github.com/midwayjs/midway/commit/44abb6c710e044d9256325c721cdeb8d9a7e0a7a))
- multi framework run configuration ([db98d6a](https://github.com/midwayjs/midway/commit/db98d6aba820aa86982b491835bb4167b3a1b6b2))
- property decorator and class decorator extends ([#845](https://github.com/midwayjs/midway/issues/845)) ([8d0227d](https://github.com/midwayjs/midway/commit/8d0227dfe946af6fefa832d574cdcfe976ed8ce2))

### Features

- add conflictCheck ([a892223](https://github.com/midwayjs/midway/commit/a8922234abb2c585d59e37aaa443b14d73a14b2f))

## [2.8.3](https://github.com/midwayjs/midway/compare/v2.8.2...v2.8.3) (2021-03-01)

### Bug Fixes

- router sort with param ([#877](https://github.com/midwayjs/midway/issues/877)) ([7405745](https://github.com/midwayjs/midway/commit/7405745330cbeedc74829bc7683686866d91b633))

## [2.8.2](https://github.com/midwayjs/midway/compare/v2.8.0...v2.8.2) (2021-02-27)

### Features

- support fun router ([#867](https://github.com/midwayjs/midway/issues/867)) ([01e673f](https://github.com/midwayjs/midway/commit/01e673f50d48d302e449ab88c2e419bcaeab1458))

# [2.8.0](https://github.com/midwayjs/midway/compare/v2.7.7...v2.8.0) (2021-02-24)

### Features

- add router collector and export router table ([#852](https://github.com/midwayjs/midway/issues/852)) ([3641ac9](https://github.com/midwayjs/midway/commit/3641ac9c78ed9888525ce0c87415b961d4602fa8))
- move context logger to @midwayjs/logger and add createFileL… ([#859](https://github.com/midwayjs/midway/issues/859)) ([49f568f](https://github.com/midwayjs/midway/commit/49f568f372b610494d59fa415f4f241c400c7db0))
- support queries decorator ([#858](https://github.com/midwayjs/midway/issues/858)) ([ddb080b](https://github.com/midwayjs/midway/commit/ddb080bbba0b24a4c1f826d8552966275f31ebeb))

## [2.7.5](https://github.com/midwayjs/midway/compare/v2.7.4...v2.7.5) (2021-02-08)

### Features

- add configuration functional support ([#843](https://github.com/midwayjs/midway/issues/843)) ([bfaa0aa](https://github.com/midwayjs/midway/commit/bfaa0aad9e8ce667a4bb98af60f1c706e09e7810))
- add enable method ([#847](https://github.com/midwayjs/midway/issues/847)) ([a85b99d](https://github.com/midwayjs/midway/commit/a85b99dd775b9cf69dec3a7fa78248d4d82ad814))

# [2.7.0](https://github.com/midwayjs/midway/compare/v2.6.13...v2.7.0) (2021-01-27)

### Features

- add midway gRPC framework ([#786](https://github.com/midwayjs/midway/issues/786)) ([d90362c](https://github.com/midwayjs/midway/commit/d90362c6bf15c00621ffc2981f19842f216395f8))
- support entry file in bootstrap ([#819](https://github.com/midwayjs/midway/issues/819)) ([49a5ff6](https://github.com/midwayjs/midway/commit/49a5ff662134bdd42dc3a80738b44a05138f8f7c))

## [2.6.13](https://github.com/midwayjs/midway/compare/v2.6.12...v2.6.13) (2021-01-21)

**Note:** Version bump only for package @midwayjs/core

## [2.6.10](https://github.com/midwayjs/midway/compare/v2.6.9...v2.6.10) (2021-01-10)

### Bug Fixes

- bootstrap missing create logger ([#797](https://github.com/midwayjs/midway/issues/797)) ([f7aac5f](https://github.com/midwayjs/midway/commit/f7aac5fcd9a59a3a36856af58c17ee1d0c9dfca4))

## [2.6.9](https://github.com/midwayjs/midway/compare/v2.6.8...v2.6.9) (2021-01-08)

**Note:** Version bump only for package @midwayjs/core

## [2.6.8](https://github.com/midwayjs/midway/compare/v2.6.7...v2.6.8) (2021-01-06)

**Note:** Version bump only for package @midwayjs/core

## [2.6.7](https://github.com/midwayjs/midway/compare/v2.6.6...v2.6.7) (2021-01-05)

**Note:** Version bump only for package @midwayjs/core

## [2.6.6](https://github.com/midwayjs/midway/compare/v2.6.5...v2.6.6) (2021-01-04)

**Note:** Version bump only for package @midwayjs/core

## [2.6.5](https://github.com/midwayjs/midway/compare/v2.6.4...v2.6.5) (2021-01-04)

**Note:** Version bump only for package @midwayjs/core

## [2.6.4](https://github.com/midwayjs/midway/compare/v2.6.3...v2.6.4) (2021-01-02)

### Bug Fixes

- definition fix for getLogger and getCoreLogger ([#783](https://github.com/midwayjs/midway/issues/783)) ([264b481](https://github.com/midwayjs/midway/commit/264b4819f8f96dccabd1e5cd6ad2c7b3b8277136))

## [2.6.3](https://github.com/midwayjs/midway/compare/v2.6.2...v2.6.3) (2020-12-30)

**Note:** Version bump only for package @midwayjs/core

## [2.6.2](https://github.com/midwayjs/midway/compare/v2.6.1...v2.6.2) (2020-12-30)

### Bug Fixes

- output logs dir when development env ([#780](https://github.com/midwayjs/midway/issues/780)) ([557d874](https://github.com/midwayjs/midway/commit/557d8743cf5183740b25a987b1a1135ea09c9d28))

## [2.6.1](https://github.com/midwayjs/midway/compare/v2.6.0...v2.6.1) (2020-12-29)

**Note:** Version bump only for package @midwayjs/core

# [2.6.0](https://github.com/midwayjs/midway/compare/v2.5.5...v2.6.0) (2020-12-28)

### Features

- add midway logger ([#743](https://github.com/midwayjs/midway/issues/743)) ([13e8cc7](https://github.com/midwayjs/midway/commit/13e8cc753d994e6f9f073688e22527f75d39984a))

## [2.5.5](https://github.com/midwayjs/midway/compare/v2.5.4...v2.5.5) (2020-12-15)

### Bug Fixes

- aspect wrapper requestContext instance ([#755](https://github.com/midwayjs/midway/issues/755)) ([84193a0](https://github.com/midwayjs/midway/commit/84193a0a50483a0ec8e25b25a17654d4fc77ed1d))

## [2.5.2](https://github.com/midwayjs/midway/compare/v2.5.1...v2.5.2) (2020-12-04)

### Bug Fixes

- definition for getAsync and get ([#740](https://github.com/midwayjs/midway/issues/740)) ([d40de78](https://github.com/midwayjs/midway/commit/d40de7899f3b816c61229dce463d9b2de6842259))

# [2.5.0](https://github.com/midwayjs/midway/compare/v2.4.8...v2.5.0) (2020-11-28)

### Bug Fixes

- koa response 204 ([#733](https://github.com/midwayjs/midway/issues/733)) ([2463d77](https://github.com/midwayjs/midway/commit/2463d77cf2d9b03216acff901839816be45c5e73))

## [2.4.7](https://github.com/midwayjs/midway/compare/v2.4.6...v2.4.7) (2020-11-23)

**Note:** Version bump only for package @midwayjs/core

## [2.4.5](https://github.com/midwayjs/midway/compare/v2.4.4...v2.4.5) (2020-11-19)

**Note:** Version bump only for package @midwayjs/core

## [2.4.3](https://github.com/midwayjs/midway/compare/v2.4.2...v2.4.3) (2020-11-16)

### Bug Fixes

- aspect mapping npe ([#722](https://github.com/midwayjs/midway/issues/722)) ([1954eed](https://github.com/midwayjs/midway/commit/1954eed145cbb8fc929394f6cb0c1bc8cb80c823))

## [2.4.2](https://github.com/midwayjs/midway/compare/v2.4.1...v2.4.2) (2020-11-13)

### Bug Fixes

- error pattern for ignore node_modules ([#717](https://github.com/midwayjs/midway/issues/717)) ([16f1292](https://github.com/midwayjs/midway/commit/16f1292359b8c65548eea3926de8eaaa13133538))

## [2.4.1](https://github.com/midwayjs/midway/compare/v2.4.0...v2.4.1) (2020-11-12)

### Bug Fixes

- load ignore node_modules ([#714](https://github.com/midwayjs/midway/issues/714)) ([ad13f13](https://github.com/midwayjs/midway/commit/ad13f1357263fad143ad18527a3c04bd4a629798))

# [2.4.0](https://github.com/midwayjs/midway/compare/v2.3.23...v2.4.0) (2020-11-11)

### Features

- support define custom egg framework ([#709](https://github.com/midwayjs/midway/issues/709)) ([f5baba1](https://github.com/midwayjs/midway/commit/f5baba18d10e3dc91ba9651effadd00b8f66cf8b))

## [2.3.23](https://github.com/midwayjs/midway/compare/v2.3.22...v2.3.23) (2020-11-03)

**Note:** Version bump only for package @midwayjs/core

## [2.3.22](https://github.com/midwayjs/midway/compare/v2.3.21...v2.3.22) (2020-10-31)

### Bug Fixes

- aspect bind missing ctx ([#694](https://github.com/midwayjs/midway/issues/694)) ([871ea80](https://github.com/midwayjs/midway/commit/871ea80b8090e28f02dc74405de5da3969ccf5c4))

## [2.3.20](https://github.com/midwayjs/midway/compare/v2.3.19...v2.3.20) (2020-10-29)

**Note:** Version bump only for package @midwayjs/core

## [2.3.19](https://github.com/midwayjs/midway/compare/v2.3.18...v2.3.19) (2020-10-28)

**Note:** Version bump only for package @midwayjs/core

## [2.3.18](https://github.com/midwayjs/midway/compare/v2.3.17...v2.3.18) (2020-10-27)

### Bug Fixes

- configuration inject plugin and more in production environment ([#680](https://github.com/midwayjs/midway/issues/680)) ([41bce5d](https://github.com/midwayjs/midway/commit/41bce5d8a60a6fde61ff62794612eecff2e260ed))

## [2.3.17](https://github.com/midwayjs/midway/compare/v2.3.16...v2.3.17) (2020-10-22)

**Note:** Version bump only for package @midwayjs/core

## [2.3.15](https://github.com/midwayjs/midway/compare/v2.3.14...v2.3.15) (2020-10-15)

**Note:** Version bump only for package @midwayjs/core

## [2.3.14](https://github.com/midwayjs/midway/compare/v2.3.13...v2.3.14) (2020-10-15)

**Note:** Version bump only for package @midwayjs/core

## [2.3.13](https://github.com/midwayjs/midway/compare/v2.3.12...v2.3.13) (2020-10-13)

### Bug Fixes

- [@plugin](https://github.com/plugin) inject undefined in web middleware ([#667](https://github.com/midwayjs/midway/issues/667)) ([cacb2fa](https://github.com/midwayjs/midway/commit/cacb2faa61258172ef445db0a86e45c3f19014a6))

## [2.3.11](https://github.com/midwayjs/midway/compare/v2.3.10...v2.3.11) (2020-10-08)

**Note:** Version bump only for package @midwayjs/core

## [2.3.10](https://github.com/midwayjs/midway/compare/v2.3.9...v2.3.10) (2020-10-08)

### Bug Fixes

- component inject global object and add case ([#663](https://github.com/midwayjs/midway/issues/663)) ([e768ee8](https://github.com/midwayjs/midway/commit/e768ee872ed9855252346920318a32133328c0fe))

### Features

- replace configuration.imports to object directly and deprecated string ([#657](https://github.com/midwayjs/midway/issues/657)) ([f1b42a1](https://github.com/midwayjs/midway/commit/f1b42a1b338a69cdfaf63e2d951a65333e4f3007))

## [2.3.9](https://github.com/midwayjs/midway/compare/v2.3.8...v2.3.9) (2020-10-05)

**Note:** Version bump only for package @midwayjs/core

## [2.3.8](https://github.com/midwayjs/midway/compare/v2.3.7...v2.3.8) (2020-10-05)

**Note:** Version bump only for package @midwayjs/core

## [2.3.7](https://github.com/midwayjs/midway/compare/v2.3.6...v2.3.7) (2020-10-04)

**Note:** Version bump only for package @midwayjs/core

## [2.3.6](https://github.com/midwayjs/midway/compare/v2.3.4...v2.3.6) (2020-10-02)

### Bug Fixes

- fix core pkg name ([#656](https://github.com/midwayjs/midway/issues/656)) ([2d26b0d](https://github.com/midwayjs/midway/commit/2d26b0d3cd6bb541295deb2b5b5c13d955f8587d))
- implement optional dep for amqplib in mock package ([#654](https://github.com/midwayjs/midway/issues/654)) ([3319872](https://github.com/midwayjs/midway/commit/33198727855ff042db7d96723992b49c632aa25d))

### Features

- add request path and ip decorator ([#655](https://github.com/midwayjs/midway/issues/655)) ([3354c26](https://github.com/midwayjs/midway/commit/3354c263c92957fd68b90c383c33afc6ad9ae967))

## [2.3.2](https://github.com/midwayjs/midway/compare/v2.3.1...v2.3.2) (2020-09-28)

### Bug Fixes

- component get config and merge egg config ([#649](https://github.com/midwayjs/midway/issues/649)) ([aa95a3e](https://github.com/midwayjs/midway/commit/aa95a3eb9ff70d691c2420e58b357e2889d03ebb))

## [2.3.1](https://github.com/midwayjs/midway/compare/v2.3.0...v2.3.1) (2020-09-27)

### Bug Fixes

- fix debugger logger create in every request ([#648](https://github.com/midwayjs/midway/issues/648)) ([8e70fb0](https://github.com/midwayjs/midway/commit/8e70fb0b57241bb6e0b2fcca5c4fa2b26fc2eb5e))

# [2.3.0](https://github.com/midwayjs/midway/compare/v2.2.10...v2.3.0) (2020-09-27)

### Features

- add rabbitmq ([#647](https://github.com/midwayjs/midway/issues/647)) ([2c03eb4](https://github.com/midwayjs/midway/commit/2c03eb4f5e979d309048a11f17f7579a1d299ba1))

## [2.2.10](https://github.com/midwayjs/midway/compare/v2.2.9...v2.2.10) (2020-09-24)

**Note:** Version bump only for package @midwayjs/core

## [2.2.9](https://github.com/midwayjs/midway/compare/v2.2.8...v2.2.9) (2020-09-24)

### Bug Fixes

- remove sourcemap and src in dist ([#645](https://github.com/midwayjs/midway/issues/645)) ([e561a88](https://github.com/midwayjs/midway/commit/e561a88f4a70af15d4be3d5fe0bd39487677d4ce))

## [2.2.8](https://github.com/midwayjs/midway/compare/v2.2.7...v2.2.8) (2020-09-23)

**Note:** Version bump only for package @midwayjs/core

## [2.2.7](https://github.com/midwayjs/midway/compare/v2.2.6...v2.2.7) (2020-09-20)

### Bug Fixes

- WebMiddleare to IWebMiddleware ([e69cf28](https://github.com/midwayjs/midway/commit/e69cf286fa76ab3144404806c5cbbe8642cdcd61))

## [2.2.6](https://github.com/midwayjs/midway/compare/v2.2.5...v2.2.6) (2020-09-18)

### Features

- add aop ([#640](https://github.com/midwayjs/midway/issues/640)) ([c3e15b3](https://github.com/midwayjs/midway/commit/c3e15b328c184318e364bf40d32fa4df6be2a30a))

## [2.2.5](https://github.com/midwayjs/midway/compare/v2.2.4...v2.2.5) (2020-09-17)

### Features

- add property for web params ([5c19644](https://github.com/midwayjs/midway/commit/5c1964482b4c8efe0ac23c3c1feb1f48ce5b7889))
- use midway cli replace egg-bin ([#639](https://github.com/midwayjs/midway/issues/639)) ([62bbf38](https://github.com/midwayjs/midway/commit/62bbf3852899476600a0b594cb7dc274b05e29ec))

## [2.2.4](https://github.com/midwayjs/midway/compare/v2.2.3...v2.2.4) (2020-09-15)

**Note:** Version bump only for package @midwayjs/core

## [2.2.3](https://github.com/midwayjs/midway/compare/v2.2.2...v2.2.3) (2020-09-14)

**Note:** Version bump only for package @midwayjs/core

## [2.2.2](https://github.com/midwayjs/midway/compare/v2.2.1...v2.2.2) (2020-09-14)

**Note:** Version bump only for package @midwayjs/core

## [2.2.1](https://github.com/midwayjs/midway/compare/v2.2.0...v2.2.1) (2020-09-14)

**Note:** Version bump only for package @midwayjs/core

# [2.2.0](https://github.com/midwayjs/midway/compare/v2.1.4...v2.2.0) (2020-09-13)

### Features

- complete 2.x beta ([#630](https://github.com/midwayjs/midway/issues/630)) ([b23cd00](https://github.com/midwayjs/midway/commit/b23cd00fe9cefc9057a2284d38d5419773539206))

## [2.1.4](https://github.com/midwayjs/midway/compare/v2.1.3...v2.1.4) (2020-06-17)

### Bug Fixes

- 2.x extends bug ([#498](https://github.com/midwayjs/midway/issues/498)) ([19ec029](https://github.com/midwayjs/midway/commit/19ec0292eedd94cb2e40e69af8897703fc8f55c7))

## [2.1.3](https://github.com/midwayjs/midway/compare/v2.1.2...v2.1.3) (2020-05-07)

### Bug Fixes

- configuration use package name ([#485](https://github.com/midwayjs/midway/issues/485)) ([a00cb18](https://github.com/midwayjs/midway/commit/a00cb189b10a7353f6e0545c17837e8c9b10ca2c))

## [2.1.2](https://github.com/midwayjs/midway/compare/v2.1.1...v2.1.2) (2020-05-02)

**Note:** Version bump only for package @midwayjs/core

## [2.1.1](https://github.com/midwayjs/midway/compare/v2.1.0...v2.1.1) (2020-04-30)

### Bug Fixes

- add metadata when configuration load controller ([#483](https://github.com/midwayjs/midway/issues/483)) ([e4e3c57](https://github.com/midwayjs/midway/commit/e4e3c5784df844a290a57a3d309a5f4e866e4831))

# [2.1.0](https://github.com/midwayjs/midway/compare/v2.0.17...v2.1.0) (2020-04-29)

### Features

- refactor hook & add @App ([#482](https://github.com/midwayjs/midway/issues/482)) ([3bfd300](https://github.com/midwayjs/midway/commit/3bfd300daf21fce96f2ff92be22ecb0f12bdd033))

## [2.0.17](https://github.com/midwayjs/midway/compare/v2.0.16...v2.0.17) (2020-04-21)

### Bug Fixes

- fix export service method ([#477](https://github.com/midwayjs/midway/issues/477)) ([586b0be](https://github.com/midwayjs/midway/commit/586b0be05ee9ef38cef9d312f19de4318c2b1701))

## [2.0.16](https://github.com/midwayjs/midway/compare/v2.0.15...v2.0.16) (2020-04-12)

**Note:** Version bump only for package @midwayjs/core

## [2.0.15](https://github.com/midwayjs/midway/compare/v2.0.14...v2.0.15) (2020-04-11)

### Bug Fixes

- Fix default env ([#468](https://github.com/midwayjs/midway/issues/468)) ([db9ffcf](https://github.com/midwayjs/midway/commit/db9ffcfcc412bfb7613d46eb3b3b30f44e3b553f)), closes [#450](https://github.com/midwayjs/midway/issues/450) [#454](https://github.com/midwayjs/midway/issues/454) [#379](https://github.com/midwayjs/midway/issues/379) [#455](https://github.com/midwayjs/midway/issues/455) [#463](https://github.com/midwayjs/midway/issues/463) [#464](https://github.com/midwayjs/midway/issues/464) [#466](https://github.com/midwayjs/midway/issues/466)

## [2.0.14](https://github.com/midwayjs/midway/compare/v2.0.13...v2.0.14) (2020-04-08)

**Note:** Version bump only for package @midwayjs/core

## [2.0.13](https://github.com/midwayjs/midway/compare/v2.0.12...v2.0.13) (2020-04-07)

**Note:** Version bump only for package @midwayjs/core

## [2.0.12](https://github.com/midwayjs/midway/compare/v2.0.11...v2.0.12) (2020-04-07)

### Bug Fixes

- 2.x fix conflicts ([#458](https://github.com/midwayjs/midway/issues/458)) ([2b0f44c](https://github.com/midwayjs/midway/commit/2b0f44c6d4c91154fb8a7779b6789acbb2635b1b))
- 2.x fix conflicts ([#459](https://github.com/midwayjs/midway/issues/459)) ([e9f689c](https://github.com/midwayjs/midway/commit/e9f689c07efec3078c77557f29ea9ecdb5659094))

## [2.0.11](https://github.com/midwayjs/midway/compare/v2.0.10...v2.0.11) (2020-04-07)

### Bug Fixes

- fix dfs circular ([#457](https://github.com/midwayjs/midway/issues/457)) ([8b91326](https://github.com/midwayjs/midway/commit/8b9132604df041dad5f1124389d49f75c288aff5))

## [2.0.10](https://github.com/midwayjs/midway/compare/v2.0.9...v2.0.10) (2020-03-31)

**Note:** Version bump only for package @midwayjs/core

## [2.0.9](https://github.com/midwayjs/midway/compare/v2.0.8...v2.0.9) (2020-03-30)

**Note:** Version bump only for package @midwayjs/core

## [2.0.8](https://github.com/midwayjs/midway/compare/v2.0.7...v2.0.8) (2020-03-30)

### Bug Fixes

- 2.x conflict 能力 ([#449](https://github.com/midwayjs/midway/issues/449)) ([6064ecf](https://github.com/midwayjs/midway/commit/6064ecf0fcf0f79ca9f9f177b06baef6d65ca7ea))

## [2.0.7](https://github.com/midwayjs/midway/compare/v2.0.6...v2.0.7) (2020-03-30)

**Note:** Version bump only for package @midwayjs/core

## [2.0.6](https://github.com/midwayjs/midway/compare/v2.0.5...v2.0.6) (2020-03-27)

### Bug Fixes

- configuration with ctx ([4c7ff6a](https://github.com/midwayjs/midway/commit/4c7ff6ade50a1048c465d50145f0aedcb1ec30d3))

## [2.0.5](https://github.com/midwayjs/midway/compare/v2.0.4...v2.0.5) (2020-03-22)

**Note:** Version bump only for package @midwayjs/core

## [2.0.4](https://github.com/midwayjs/midway/compare/v2.0.3...v2.0.4) (2020-03-19)

### Bug Fixes

- 2.x fix lifecycle bug ([#435](https://github.com/midwayjs/midway/issues/435)) ([22d3e12](https://github.com/midwayjs/midway/commit/22d3e121d98575e994282c93b7522ddcf76942be))

## [2.0.3](https://github.com/midwayjs/midway/compare/v2.0.2...v2.0.3) (2020-03-19)

**Note:** Version bump only for package @midwayjs/core

## [2.0.2](https://github.com/midwayjs/midway/compare/v2.0.1...v2.0.2) (2020-03-13)

**Note:** Version bump only for package @midwayjs/core

## [2.0.1](https://github.com/midwayjs/midway/compare/v2.0.0...v2.0.1) (2020-03-13)

### Features

- add hsf decorator ([#421](https://github.com/midwayjs/midway/issues/421)) ([d5afed3](https://github.com/midwayjs/midway/commit/d5afed3ace4e3570b29a2c789b2683f0cd4fd697))

# [2.0.0](https://github.com/midwayjs/midway/compare/v2.0.0-beta.16...v2.0.0) (2020-03-13)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.16](https://github.com/midwayjs/midway/compare/v2.0.0-beta.15...v2.0.0-beta.16) (2020-03-12)

### Bug Fixes

- 修复循环引用 bug ([#419](https://github.com/midwayjs/midway/issues/419)) ([8852c6c](https://github.com/midwayjs/midway/commit/8852c6c55de8975aea3df2978bf50425378379e6))

# [2.0.0-beta.15](https://github.com/midwayjs/midway/compare/v2.0.0-beta.14...v2.0.0-beta.15) (2020-03-06)

### Bug Fixes

- disable follow symbolic link ([#413](https://github.com/midwayjs/midway/issues/413)) ([99c30d7](https://github.com/midwayjs/midway/commit/99c30d72ae25001c17372ddd9981b6710af3a3a7))
- merge bug ([7f41fc9](https://github.com/midwayjs/midway/commit/7f41fc94adf1fc9e4465c5aefdf94346184e1efc))
- modified configuration load logic ([#415](https://github.com/midwayjs/midway/issues/415)) ([6e77d36](https://github.com/midwayjs/midway/commit/6e77d3624ed407893b8df1937482bef044b1f36b))

### Features

- 2.x lifecycle ([#414](https://github.com/midwayjs/midway/issues/414)) ([7313ab8](https://github.com/midwayjs/midway/commit/7313ab804091fd410b1b3118ea41f18cf05fb01f))
- MidwayRequestContainer 增加泛型标注 ([#407](https://github.com/midwayjs/midway/issues/407)) ([b206035](https://github.com/midwayjs/midway/commit/b20603577a99f31ece9720d5f7893c2af7905887))

# [2.0.0-beta.14](https://github.com/midwayjs/midway/compare/v2.0.0-beta.13...v2.0.0-beta.14) (2020-03-04)

### Features

- 2.x pipeline ([#406](https://github.com/midwayjs/midway/issues/406)) ([9eb3e10](https://github.com/midwayjs/midway/commit/9eb3e100ebac966cf58713d4d3f021cd44971150))

# [2.0.0-beta.13](https://github.com/midwayjs/midway/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2020-02-26)

### Bug Fixes

- configuration load config bug ([#404](https://github.com/midwayjs/midway/issues/404)) ([5e18763](https://github.com/midwayjs/midway/commit/5e187633b58e76b606a95063056d670e234c1d22))

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.12](https://github.com/midwayjs/midway/compare/v2.0.0-beta.11...v2.0.0-beta.12) (2020-02-25)

### Bug Fixes

- namespace @ bugfix ([#402](https://github.com/midwayjs/midway/issues/402)) ([e546219](https://github.com/midwayjs/midway/commit/e5462191ec293f98db46cfa59efc446124e2e381))

# [2.0.0-beta.11](https://github.com/midwayjs/midway/compare/v2.0.0-beta.10...v2.0.0-beta.11) (2020-02-25)

### Bug Fixes

- configuration bugs ([#401](https://github.com/midwayjs/midway/issues/401)) ([a6a18b2](https://github.com/midwayjs/midway/commit/a6a18b200252bb0cfa415cc000bcdd5ec5d85701))

# [2.0.0-beta.10](https://github.com/midwayjs/midway/compare/v2.0.0-beta.9...v2.0.0-beta.10) (2020-02-20)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.9](https://github.com/midwayjs/midway/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2020-02-20)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.8](https://github.com/midwayjs/midway/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2020-02-19)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.7](https://github.com/midwayjs/midway/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2020-02-18)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.6](https://github.com/midwayjs/midway/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2020-02-17)

**Note:** Version bump only for package @midwayjs/core

# [2.0.0-beta.5](https://github.com/midwayjs/midway/compare/v2.0.0-beta.4...v2.0.0-beta.5) (2020-02-17)

### Features

- 2.x namespace ([#388](https://github.com/midwayjs/midway/issues/388)) ([9c90eb1](https://github.com/midwayjs/midway/commit/9c90eb1))

## [1.17.1](https://github.com/midwayjs/midway/compare/v1.17.0...v1.17.1) (2020-02-17)

**Note:** Version bump only for package midway-core

# [1.17.0](https://github.com/midwayjs/midway/compare/v1.16.4...v1.17.0) (2020-02-17)

**Note:** Version bump only for package midway-core

# [2.0.0-beta.4](https://github.com/midwayjs/midway/compare/v1.16.4...v2.0.0-beta.4) (2020-02-16)

### Features

- add namespace feature ([#386](https://github.com/midwayjs/midway/issues/386)) ([bb2a8c8](https://github.com/midwayjs/midway/commit/bb2a8c8))

# [2.0.0-beta.3](https://github.com/midwayjs/midway/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2020-02-08)

### Bug Fixes

- fix build ([1d5a7c1](https://github.com/midwayjs/midway/commit/1d5a7c1))

# [2.0.0-beta.2](https://github.com/midwayjs/midway/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2020-02-04)

### Bug Fixes

- add missing dep module ([04ecc82](https://github.com/midwayjs/midway/commit/04ecc82))

# [2.0.0-beta.1](https://github.com/midwayjs/midway/compare/v1.16.3...v2.0.0-beta.1) (2020-02-04)

### Bug Fixes

- fix requestContext load configService ([f2c874f](https://github.com/midwayjs/midway/commit/f2c874f))

### Features

- support [@configuration](https://github.com/configuration) decorator ([0584494](https://github.com/midwayjs/midway/commit/0584494))
- support importConfigs and add test case ([753cfb4](https://github.com/midwayjs/midway/commit/753cfb4))
- transfor to new package ([9144b48](https://github.com/midwayjs/midway/commit/9144b48))

# [2.0.0-beta.3](https://github.com/midwayjs/midway/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2020-02-08)

### Bug Fixes

- fix build ([1d5a7c1](https://github.com/midwayjs/midway/commit/1d5a7c1))

# [2.0.0-beta.2](https://github.com/midwayjs/midway/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2020-02-04)

### Bug Fixes

- add missing dep module ([04ecc82](https://github.com/midwayjs/midway/commit/04ecc82))

# [2.0.0-beta.1](https://github.com/midwayjs/midway/compare/v1.16.3...v2.0.0-beta.1) (2020-02-04)

### Bug Fixes

- egg bin modify setup file rule ([#380](https://github.com/midwayjs/midway/issues/380)) ([4b9461d](https://github.com/midwayjs/midway/commit/4b9461d))
- fix requestContext load configService ([f2c874f](https://github.com/midwayjs/midway/commit/f2c874f))

### Features

- support [@configuration](https://github.com/configuration) decorator ([0584494](https://github.com/midwayjs/midway/commit/0584494))
- support importConfigs and add test case ([753cfb4](https://github.com/midwayjs/midway/commit/753cfb4))
- transfor to new package ([9144b48](https://github.com/midwayjs/midway/commit/9144b48))

## [1.16.4](https://github.com/midwayjs/midway/compare/v1.16.3...v1.16.4) (2020-02-11)

### Bug Fixes

- egg bin modify setup file rule ([#380](https://github.com/midwayjs/midway/issues/380)) ([4b9461d](https://github.com/midwayjs/midway/commit/4b9461d))

## [1.16.3](https://github.com/midwayjs/midway/compare/v1.16.2...v1.16.3) (2019-12-25)

**Note:** Version bump only for package midway-core

## [1.16.2](https://github.com/midwayjs/midway/compare/v1.16.1...v1.16.2) (2019-12-25)

**Note:** Version bump only for package midway-core

## [1.16.1](https://github.com/midwayjs/midway/compare/v1.16.0...v1.16.1) (2019-12-16)

**Note:** Version bump only for package midway-core

# [1.16.0](https://github.com/midwayjs/midway/compare/v1.15.1...v1.16.0) (2019-12-16)

**Note:** Version bump only for package midway-core

## [1.15.1](https://github.com/midwayjs/midway/compare/v1.15.0...v1.15.1) (2019-12-11)

**Note:** Version bump only for package midway-core

# [1.15.0](https://github.com/midwayjs/midway/compare/v1.14.4...v1.15.0) (2019-12-06)

**Note:** Version bump only for package midway-core

## [1.14.4](https://github.com/midwayjs/midway/compare/v1.14.3...v1.14.4) (2019-11-20)

**Note:** Version bump only for package midway-core

## [1.14.3](https://github.com/midwayjs/midway/compare/v1.14.2...v1.14.3) (2019-11-15)

**Note:** Version bump only for package midway-core

## [1.14.1](https://github.com/midwayjs/midway/compare/v1.14.0...v1.14.1) (2019-11-03)

**Note:** Version bump only for package midway-core

# [1.14.0](https://github.com/midwayjs/midway/compare/v1.13.0...v1.14.0) (2019-11-01)

**Note:** Version bump only for package midway-core

## [1.12.1](https://github.com/midwayjs/midway/compare/v1.12.0...v1.12.1) (2019-10-12)

**Note:** Version bump only for package midway-core

# [1.12.0](https://github.com/midwayjs/midway/compare/v1.11.6...v1.12.0) (2019-10-11)

**Note:** Version bump only for package midway-core

## [1.11.4](https://github.com/midwayjs/midway/compare/v1.11.3...v1.11.4) (2019-09-06)

**Note:** Version bump only for package midway-core

## [1.11.3](https://github.com/midwayjs/midway/compare/v1.11.2...v1.11.3) (2019-09-06)

**Note:** Version bump only for package midway-core

## [1.11.2](https://github.com/midwayjs/midway/compare/v1.11.1...v1.11.2) (2019-08-30)

**Note:** Version bump only for package midway-core

## [1.10.8](https://github.com/midwayjs/midway/compare/v1.10.7...v1.10.8) (2019-08-03)

**Note:** Version bump only for package midway-core

## [1.10.7](https://github.com/midwayjs/midway/compare/v1.10.6...v1.10.7) (2019-08-03)

**Note:** Version bump only for package midway-core

## [1.10.5](https://github.com/midwayjs/midway/compare/v1.10.4...v1.10.5) (2019-07-30)

**Note:** Version bump only for package midway-core

## [1.10.2](https://github.com/midwayjs/midway/compare/v1.10.1...v1.10.2) (2019-07-20)

**Note:** Version bump only for package midway-core

# [1.9.0](https://github.com/midwayjs/midway/compare/v1.8.0...v1.9.0) (2019-07-13)

**Note:** Version bump only for package midway-core

# [1.8.0](https://github.com/midwayjs/midway/compare/v1.7.0...v1.8.0) (2019-06-29)

**Note:** Version bump only for package midway-core

# [1.7.0](https://github.com/midwayjs/midway/compare/v1.6.3...v1.7.0) (2019-06-25)

**Note:** Version bump only for package midway-core

## [1.6.3](https://github.com/midwayjs/midway/compare/v1.6.2...v1.6.3) (2019-06-13)

**Note:** Version bump only for package midway-core

## [1.5.6](https://github.com/midwayjs/midway/compare/v1.5.5...v1.5.6) (2019-05-13)

**Note:** Version bump only for package midway-core

## [1.5.5](https://github.com/midwayjs/midway/compare/v1.5.4...v1.5.5) (2019-05-13)

**Note:** Version bump only for package midway-core

## [1.5.2](https://github.com/midwayjs/midway/compare/v1.5.1...v1.5.2) (2019-04-29)

**Note:** Version bump only for package midway-core

# [1.5.0](https://github.com/midwayjs/midway/compare/v1.4.10...v1.5.0) (2019-04-11)

**Note:** Version bump only for package midway-core

## [1.4.9](https://github.com/midwayjs/midway/compare/v1.4.8...v1.4.9) (2019-03-11)

### Bug Fixes

- fix loadDir default path ([9defd2d](https://github.com/midwayjs/midway/commit/9defd2d))

## [1.4.8](https://github.com/midwayjs/midway/compare/v1.4.7...v1.4.8) (2019-03-11)

**Note:** Version bump only for package midway-core

## [1.4.7](https://github.com/midwayjs/midway/compare/v1.4.6...v1.4.7) (2019-03-08)

**Note:** Version bump only for package midway-core

## [1.4.6](https://github.com/midwayjs/midway/compare/v1.4.5...v1.4.6) (2019-03-07)

**Note:** Version bump only for package midway-core

## [1.4.5](https://github.com/midwayjs/midway/compare/v1.4.4...v1.4.5) (2019-03-06)

**Note:** Version bump only for package midway-core

## [1.4.4](https://github.com/midwayjs/midway/compare/v1.4.3...v1.4.4) (2019-03-06)

**Note:** Version bump only for package midway-core

## [1.4.3](https://github.com/midwayjs/midway/compare/v1.4.2...v1.4.3) (2019-03-01)

**Note:** Version bump only for package midway-core

## [1.4.1](https://github.com/midwayjs/midway/compare/v1.4.0...v1.4.1) (2019-02-27)

**Note:** Version bump only for package midway-core

## [1.3.2](https://github.com/midwayjs/midway/compare/v1.3.1...v1.3.2) (2019-02-22)

**Note:** Version bump only for package midway-core

# [1.3.0](https://github.com/midwayjs/midway/compare/v1.2.4...v1.3.0) (2019-02-12)

**Note:** Version bump only for package midway-core

## [1.2.3](https://github.com/midwayjs/midway/compare/v1.2.2...v1.2.3) (2019-02-01)

### Bug Fixes

- fix lint ([d9e1ab9](https://github.com/midwayjs/midway/commit/d9e1ab9))
- fix more lint ([12873dc](https://github.com/midwayjs/midway/commit/12873dc))

## [1.2.2](https://github.com/midwayjs/midway/compare/v1.2.1...v1.2.2) (2019-01-30)

### Bug Fixes

- import router to fix core ([71a2f61](https://github.com/midwayjs/midway/commit/71a2f61))

## [1.2.1](https://github.com/midwayjs/midway/compare/v1.2.0...v1.2.1) (2019-01-30)

**Note:** Version bump only for package midway-core

# [1.2.0](https://github.com/midwayjs/midway/compare/v1.1.2...v1.2.0) (2019-01-29)

### Features

- midway-mock 支持 applicationContext 获取 ctx 依赖注入，支持 mock IoC 容器中的对象方法 ([4f07c6d](https://github.com/midwayjs/midway/commit/4f07c6d))

# [1.1.0](https://github.com/midwayjs/midway/compare/v1.0.5...v1.1.0) (2019-01-23)

**Note:** Version bump only for package midway-core

## [1.0.5](https://github.com/midwayjs/midway/compare/v1.0.4...v1.0.5) (2019-01-07)

### Bug Fixes

- add appDir in appInfo ([4399aba](https://github.com/midwayjs/midway/commit/4399aba))

## [1.0.2](https://github.com/midwayjs/midway/compare/v1.0.1...v1.0.2) (2018-12-26)

**Note:** Version bump only for package midway-core

## [1.0.1](https://github.com/midwayjs/midway/compare/v1.0.0...v1.0.1) (2018-12-23)

**Note:** Version bump only for package midway-core

# [0.7.0](https://github.com/midwayjs/midway/compare/v0.6.5...v0.7.0) (2018-12-09)

**Note:** Version bump only for package midway-core

## [0.6.5](https://github.com/midwayjs/midway/compare/v0.6.4...v0.6.5) (2018-11-27)

**Note:** Version bump only for package midway-core

## [0.6.4](https://github.com/midwayjs/midway/compare/v0.6.3...v0.6.4) (2018-11-21)

**Note:** Version bump only for package midway-core

## [0.6.3](https://github.com/midwayjs/midway/compare/v0.6.2...v0.6.3) (2018-11-20)

**Note:** Version bump only for package midway-core

## [0.6.2](https://github.com/midwayjs/midway/compare/v0.6.1...v0.6.2) (2018-11-20)

**Note:** Version bump only for package midway-core

## [0.6.1](https://github.com/midwayjs/midway/compare/v0.6.0...v0.6.1) (2018-11-19)

### Bug Fixes

- fix load order and user can cover default dir ([990ddcb](https://github.com/midwayjs/midway/commit/990ddcb))

# [0.6.0](https://github.com/midwayjs/midway/compare/v0.4.7...v0.6.0) (2018-11-15)

**Note:** Version bump only for package midway-core

# [0.5.0](https://github.com/midwayjs/midway/compare/v0.4.5...v0.5.0) (2018-11-15)

**Note:** Version bump only for package midway-core

## [0.4.7](https://github.com/midwayjs/midway/compare/v0.4.6...v0.4.7) (2018-11-15)

### Bug Fixes

- fix load dir bug in js mode ([8c148f3](https://github.com/midwayjs/midway/commit/8c148f3))

## [0.4.6](https://github.com/midwayjs/midway/compare/v0.4.5...v0.4.6) (2018-11-14)

### Bug Fixes

- add ts autoload directory ([a6668fb](https://github.com/midwayjs/midway/commit/a6668fb))
- fix dep map generator err in constructor inject ([9d7abe6](https://github.com/midwayjs/midway/commit/9d7abe6))
- fix set app use defineProperty ([d94d5e9](https://github.com/midwayjs/midway/commit/d94d5e9))

## [0.4.5](https://github.com/midwayjs/midway/compare/v0.4.4...v0.4.5) (2018-11-05)

### Bug Fixes

- fix app.root ([33d730c](https://github.com/midwayjs/midway/commit/33d730c))

<a name="0.4.4"></a>

## [0.4.4](https://github.com/midwayjs/midway/compare/v0.4.3...v0.4.4) (2018-10-23)

**Note:** Version bump only for package midway-core

<a name="0.4.2"></a>

## [0.4.2](https://github.com/midwayjs/midway/compare/v0.4.1...v0.4.2) (2018-09-29)

**Note:** Version bump only for package midway-core

<a name="0.4.1"></a>

## [0.4.1](https://github.com/midwayjs/midway/compare/v0.4.0...v0.4.1) (2018-09-28)

**Note:** Version bump only for package midway-core

<a name="0.3.8"></a>

## [0.3.8](https://github.com/midwayjs/midway/compare/v0.3.7...v0.3.8) (2018-09-25)

**Note:** Version bump only for package midway-core

<a name="0.3.5"></a>

## [0.3.5](https://github.com/midwayjs/midway/compare/v0.3.4...v0.3.5) (2018-09-06)

**Note:** Version bump only for package midway-core

<a name="0.3.3"></a>

## [0.3.3](https://github.com/midwayjs/midway/compare/v0.3.2...v0.3.3) (2018-09-04)

### Bug Fixes

- midway-mock export fix and request scope refactor ([c88b17e](https://github.com/midwayjs/midway/commit/c88b17e))

<a name="0.3.2"></a>

## [0.3.2](https://github.com/midwayjs/midway/compare/v0.3.1...v0.3.2) (2018-08-30)

**Note:** Version bump only for package midway-core

<a name="0.3.1"></a>

## [0.3.1](https://github.com/midwayjs/midway/compare/v0.3.0...v0.3.1) (2018-08-30)

**Note:** Version bump only for package midway-core

<a name="0.3.0"></a>

# [0.3.0](https://github.com/midwayjs/midway/compare/v0.2.10...v0.3.0) (2018-08-29)

**Note:** Version bump only for package midway-core

<a name="0.2.10"></a>

## [0.2.10](https://github.com/midwayjs/midway/compare/v0.2.9...v0.2.10) (2018-08-20)

**Note:** Version bump only for package midway-core

<a name="0.2.9"></a>

## [0.2.9](https://github.com/midwayjs/midway/compare/v0.2.8...v0.2.9) (2018-08-16)

### Bug Fixes

- set appDir before setServerEnv ([6b418ca](https://github.com/midwayjs/midway/commit/6b418ca))

<a name="0.2.8"></a>

## [0.2.8](https://github.com/midwayjs/midway/compare/v0.2.7...v0.2.8) (2018-08-15)

**Note:** Version bump only for package midway-core

<a name="0.2.7"></a>

## [0.2.7](https://github.com/midwayjs/midway/compare/v0.2.6...v0.2.7) (2018-08-10)

**Note:** Version bump only for package midway-core

<a name="0.2.4"></a>

## [0.2.4](https://github.com/midwayjs/midway/compare/v0.2.3...v0.2.4) (2018-08-06)

**Note:** Version bump only for package midway-core

<a name="0.2.3"></a>

## [0.2.3](https://github.com/midwayjs/midway/compare/v0.2.2...v0.2.3) (2018-08-03)

### Bug Fixes

- remove nyc config ([58f99de](https://github.com/midwayjs/midway/commit/58f99de))

<a name="0.2.2"></a>

## [0.2.2](https://github.com/midwayjs/midway/compare/v0.2.1...v0.2.2) (2018-08-03)

### Bug Fixes

- source map include local path ([a8acb01](https://github.com/midwayjs/midway/commit/a8acb01))

<a name="0.2.1"></a>

## [0.2.1](https://github.com/midwayjs/midway/compare/v0.2.0...v0.2.1) (2018-08-03)

**Note:** Version bump only for package midway-core

<a name="0.2.0"></a>

# [0.2.0](https://github.com/midwayjs/midway/compare/v0.1.6...v0.2.0) (2018-08-01)

### Bug Fixes

- any ([1ec5900](https://github.com/midwayjs/midway/commit/1ec5900))
- chai not add ([e9c3342](https://github.com/midwayjs/midway/commit/e9c3342))

### Features

- add container disableAutoLoad, disable auto scan and load class ([9c1357a](https://github.com/midwayjs/midway/commit/9c1357a))
- custom loadDir ignore pattern from config file & add test case ([5a49928](https://github.com/midwayjs/midway/commit/5a49928))

<a name="0.1.6"></a>

## [0.1.6](https://github.com/midwayjs/midway/compare/v0.1.5...v0.1.6) (2018-07-30)

**Note:** Version bump only for package midway-core

<a name="0.2.0-alpha.1663751b"></a>

# [0.2.0-alpha.1663751b](https://github.com/midwayjs/midway/compare/v0.1.5...v0.2.0-alpha.1663751b) (2018-07-30)

**Note:** Version bump only for package midway-core

<a name="0.1.5"></a>

## [0.1.5](https://github.com/midwayjs/midway/compare/v0.1.4...v0.1.5) (2018-07-30)

**Note:** Version bump only for package midway-core

<a name="0.1.4"></a>

## [0.1.4](https://github.com/midwayjs/midway/compare/v0.1.3...v0.1.4) (2018-07-30)

**Note:** Version bump only for package midway-core
