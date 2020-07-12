# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.5](https://github.com/midwayjs/midway-faas/compare/serverless-v1.0.4...serverless-v1.0.5) (2020-07-10)


### Bug Fixes

* fix logger set after ioc set ([#525](https://github.com/midwayjs/midway-faas/issues/525)) ([7e4ebe5](https://github.com/midwayjs/midway-faas/commit/7e4ebe512ce8939dd5eb2bfe03e5debe9fbcb3e1))





## 1.0.1 (2020-07-06)


### Bug Fixes

* add init decorator ([#66](https://github.com/midwayjs/midway-faas/issues/66)) ([716f3b8](https://github.com/midwayjs/midway-faas/commit/716f3b8a4e80c61a3d7726de9a7067e8cd77b4d9))
* change private to protected ([#49](https://github.com/midwayjs/midway-faas/issues/49)) ([f5373c7](https://github.com/midwayjs/midway-faas/commit/f5373c724d91a08201314d04d50f925ba5f4be5f))
* fix error control in fc ([#153](https://github.com/midwayjs/midway-faas/issues/153)) ([f7dd007](https://github.com/midwayjs/midway-faas/commit/f7dd0070f9c1b7f07e628c8d2052d273a8133910))
* fix fc http trigger header ([3e80468](https://github.com/midwayjs/midway-faas/commit/3e80468833072649d35a4222963b1653e9bf9558))
* fix getEnv ([f38a370](https://github.com/midwayjs/midway-faas/commit/f38a370ada478e329cb01b4af789b02419915c04))
* fix index.d.ts ([#168](https://github.com/midwayjs/midway-faas/issues/168)) ([e7e7bae](https://github.com/midwayjs/midway-faas/commit/e7e7baeb9e203eafdb103b64b80d10cb1a5b68e0))
* fix inject sington logger ([#518](https://github.com/midwayjs/midway-faas/issues/518)) ([abc83be](https://github.com/midwayjs/midway-faas/commit/abc83be40610ae1c9b4f884703784b80265c71fe))
* Fix inner mw ([#170](https://github.com/midwayjs/midway-faas/issues/170)) ([aa91d29](https://github.com/midwayjs/midway-faas/commit/aa91d29817f6d38b6d8cefd28ca426c31651ae50))
* fix ioc.json case ([07a5094](https://github.com/midwayjs/midway-faas/commit/07a509425dd1f80ffa7e85a4d430b78e79ab895f))
* fix load config case ([59f9983](https://github.com/midwayjs/midway-faas/commit/59f99835e508bedd9d153b362e98bc86999a85e0))
* fix load plugin from app ([#174](https://github.com/midwayjs/midway-faas/issues/174)) ([9a3d539](https://github.com/midwayjs/midway-faas/commit/9a3d539ac8fff3ea20837b133c105c2328604eb2))
* fix missing decorator and refresh method ([421fab7](https://github.com/midwayjs/midway-faas/commit/421fab774f5d6248c308985a4ae72f7efaa45f11))
* fix one package invoke ([#39](https://github.com/midwayjs/midway-faas/issues/39)) ([13284a9](https://github.com/midwayjs/midway-faas/commit/13284a9895e846f86e0a29567c1bad6af79e9fd7))
* fix windows path when invoke ([#169](https://github.com/midwayjs/midway-faas/issues/169)) ([e637a0a](https://github.com/midwayjs/midway-faas/commit/e637a0ab05a769a3797e2dccf0612bbbf650d074))
* invoke source map ([#52](https://github.com/midwayjs/midway-faas/issues/52)) ([9149d2a](https://github.com/midwayjs/midway-faas/commit/9149d2a9a3f3d9ba975588b61c6f9bbeec2e8d86)), closes [#51](https://github.com/midwayjs/midway-faas/issues/51)
* set default env to ctx.env ([0f590eb](https://github.com/midwayjs/midway-faas/commit/0f590eb545a6e1eeeac3cda46681d759d5b5278d))
* use IMidwayCoreApplication ([cbf871f](https://github.com/midwayjs/midway-faas/commit/cbf871f8e5b6c7986df333203f9a68164312a6ca))


### Features

* [@handler](https://github.com/handler) support ([#59](https://github.com/midwayjs/midway-faas/issues/59)) ([d0d6e49](https://github.com/midwayjs/midway-faas/commit/d0d6e491a16bcc24d8a56dd5095e1186852402bb))
* add configuration ([#58](https://github.com/midwayjs/midway-faas/issues/58)) ([0aec92d](https://github.com/midwayjs/midway-faas/commit/0aec92dc16c70c812268b1d3b328886fe3d6c309))
* add faas middleware loader ([250560a](https://github.com/midwayjs/midway-faas/commit/250560a1656e0d0e7601e44d7807ff5124c3ad86))
* add middleware info from user config ([67b9adc](https://github.com/midwayjs/midway-faas/commit/67b9adcbfa29bff65c988a592471f9c9562d4d26))
* commit development code ([a51a14a](https://github.com/midwayjs/midway-faas/commit/a51a14ae266a12f37fbe20ebf7eabfa764cf6532))
* Support @Func class method ([#100](https://github.com/midwayjs/midway-faas/issues/100)) ([cce042a](https://github.com/midwayjs/midway-faas/commit/cce042af2d456b74d9db951fe65b6e6f731ecf59))
* support koa application ([#162](https://github.com/midwayjs/midway-faas/issues/162)) ([364d62b](https://github.com/midwayjs/midway-faas/commit/364d62b48242d2ee86f97f087f912e640e8ff6e7))
* support mw ([788e417](https://github.com/midwayjs/midway-faas/commit/788e41764c2e5d345da302c03a99ceae70714e51))





# 1.0.0 (2020-07-02)


### Bug Fixes

* add init decorator ([#66](https://github.com/midwayjs/midway-faas/issues/66)) ([716f3b8](https://github.com/midwayjs/midway-faas/commit/716f3b8a4e80c61a3d7726de9a7067e8cd77b4d9))
* change private to protected ([#49](https://github.com/midwayjs/midway-faas/issues/49)) ([f5373c7](https://github.com/midwayjs/midway-faas/commit/f5373c724d91a08201314d04d50f925ba5f4be5f))
* fix error control in fc ([#153](https://github.com/midwayjs/midway-faas/issues/153)) ([f7dd007](https://github.com/midwayjs/midway-faas/commit/f7dd0070f9c1b7f07e628c8d2052d273a8133910))
* fix fc http trigger header ([3e80468](https://github.com/midwayjs/midway-faas/commit/3e80468833072649d35a4222963b1653e9bf9558))
* fix getEnv ([f38a370](https://github.com/midwayjs/midway-faas/commit/f38a370ada478e329cb01b4af789b02419915c04))
* fix index.d.ts ([#168](https://github.com/midwayjs/midway-faas/issues/168)) ([e7e7bae](https://github.com/midwayjs/midway-faas/commit/e7e7baeb9e203eafdb103b64b80d10cb1a5b68e0))
* Fix inner mw ([#170](https://github.com/midwayjs/midway-faas/issues/170)) ([aa91d29](https://github.com/midwayjs/midway-faas/commit/aa91d29817f6d38b6d8cefd28ca426c31651ae50))
* fix ioc.json case ([07a5094](https://github.com/midwayjs/midway-faas/commit/07a509425dd1f80ffa7e85a4d430b78e79ab895f))
* fix load config case ([59f9983](https://github.com/midwayjs/midway-faas/commit/59f99835e508bedd9d153b362e98bc86999a85e0))
* fix load plugin from app ([#174](https://github.com/midwayjs/midway-faas/issues/174)) ([9a3d539](https://github.com/midwayjs/midway-faas/commit/9a3d539ac8fff3ea20837b133c105c2328604eb2))
* fix missing decorator and refresh method ([421fab7](https://github.com/midwayjs/midway-faas/commit/421fab774f5d6248c308985a4ae72f7efaa45f11))
* fix one package invoke ([#39](https://github.com/midwayjs/midway-faas/issues/39)) ([13284a9](https://github.com/midwayjs/midway-faas/commit/13284a9895e846f86e0a29567c1bad6af79e9fd7))
* fix windows path when invoke ([#169](https://github.com/midwayjs/midway-faas/issues/169)) ([e637a0a](https://github.com/midwayjs/midway-faas/commit/e637a0ab05a769a3797e2dccf0612bbbf650d074))
* invoke source map ([#52](https://github.com/midwayjs/midway-faas/issues/52)) ([9149d2a](https://github.com/midwayjs/midway-faas/commit/9149d2a9a3f3d9ba975588b61c6f9bbeec2e8d86)), closes [#51](https://github.com/midwayjs/midway-faas/issues/51)
* set default env to ctx.env ([0f590eb](https://github.com/midwayjs/midway-faas/commit/0f590eb545a6e1eeeac3cda46681d759d5b5278d))
* use IMidwayCoreApplication ([cbf871f](https://github.com/midwayjs/midway-faas/commit/cbf871f8e5b6c7986df333203f9a68164312a6ca))


### Features

* [@handler](https://github.com/handler) support ([#59](https://github.com/midwayjs/midway-faas/issues/59)) ([d0d6e49](https://github.com/midwayjs/midway-faas/commit/d0d6e491a16bcc24d8a56dd5095e1186852402bb))
* add configuration ([#58](https://github.com/midwayjs/midway-faas/issues/58)) ([0aec92d](https://github.com/midwayjs/midway-faas/commit/0aec92dc16c70c812268b1d3b328886fe3d6c309))
* add faas middleware loader ([250560a](https://github.com/midwayjs/midway-faas/commit/250560a1656e0d0e7601e44d7807ff5124c3ad86))
* add middleware info from user config ([67b9adc](https://github.com/midwayjs/midway-faas/commit/67b9adcbfa29bff65c988a592471f9c9562d4d26))
* commit development code ([a51a14a](https://github.com/midwayjs/midway-faas/commit/a51a14ae266a12f37fbe20ebf7eabfa764cf6532))
* Support @Func class method ([#100](https://github.com/midwayjs/midway-faas/issues/100)) ([cce042a](https://github.com/midwayjs/midway-faas/commit/cce042af2d456b74d9db951fe65b6e6f731ecf59))
* support koa application ([#162](https://github.com/midwayjs/midway-faas/issues/162)) ([364d62b](https://github.com/midwayjs/midway-faas/commit/364d62b48242d2ee86f97f087f912e640e8ff6e7))
* support mw ([788e417](https://github.com/midwayjs/midway-faas/commit/788e41764c2e5d345da302c03a99ceae70714e51))





## [0.3.1](https://github.com/midwayjs/midway-faas/compare/v0.3.0...v0.3.1) (2020-05-31)


### Bug Fixes

* fix load plugin from app ([#174](https://github.com/midwayjs/midway-faas/issues/174)) ([9a3d539](https://github.com/midwayjs/midway-faas/commit/9a3d539ac8fff3ea20837b133c105c2328604eb2))





# [0.3.0](https://github.com/midwayjs/midway-faas/compare/v0.2.99...v0.3.0) (2020-05-26)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.99](https://github.com/midwayjs/midway-faas/compare/v0.2.98...v0.2.99) (2020-05-21)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.98](https://github.com/midwayjs/midway-faas/compare/v0.2.97...v0.2.98) (2020-05-18)


### Bug Fixes

* Fix inner mw ([#170](https://github.com/midwayjs/midway-faas/issues/170)) ([aa91d29](https://github.com/midwayjs/midway-faas/commit/aa91d29817f6d38b6d8cefd28ca426c31651ae50))





## [0.2.97](https://github.com/midwayjs/midway-faas/compare/v0.2.96...v0.2.97) (2020-05-16)


### Bug Fixes

* fix windows path when invoke ([#169](https://github.com/midwayjs/midway-faas/issues/169)) ([e637a0a](https://github.com/midwayjs/midway-faas/commit/e637a0ab05a769a3797e2dccf0612bbbf650d074))





## [0.2.96](https://github.com/midwayjs/midway-faas/compare/v0.2.95...v0.2.96) (2020-05-16)


### Bug Fixes

* fix index.d.ts ([#168](https://github.com/midwayjs/midway-faas/issues/168)) ([e7e7bae](https://github.com/midwayjs/midway-faas/commit/e7e7baeb9e203eafdb103b64b80d10cb1a5b68e0))





## [0.2.95](https://github.com/midwayjs/midway-faas/compare/v0.2.94...v0.2.95) (2020-05-15)


### Features

* support koa application ([#162](https://github.com/midwayjs/midway-faas/issues/162)) ([364d62b](https://github.com/midwayjs/midway-faas/commit/364d62b48242d2ee86f97f087f912e640e8ff6e7))





## [0.2.92](https://github.com/midwayjs/midway-faas/compare/v0.2.91...v0.2.92) (2020-05-05)


### Bug Fixes

* fix error control in fc ([#153](https://github.com/midwayjs/midway-faas/issues/153)) ([f7dd007](https://github.com/midwayjs/midway-faas/commit/f7dd0070f9c1b7f07e628c8d2052d273a8133910))
* fix fc http trigger header ([3e80468](https://github.com/midwayjs/midway-faas/commit/3e80468833072649d35a4222963b1653e9bf9558))
* fix getEnv ([f38a370](https://github.com/midwayjs/midway-faas/commit/f38a370ada478e329cb01b4af789b02419915c04))
* use IMidwayCoreApplication ([cbf871f](https://github.com/midwayjs/midway-faas/commit/cbf871f8e5b6c7986df333203f9a68164312a6ca))


### Features

* add faas middleware loader ([250560a](https://github.com/midwayjs/midway-faas/commit/250560a1656e0d0e7601e44d7807ff5124c3ad86))
* add middleware info from user config ([67b9adc](https://github.com/midwayjs/midway-faas/commit/67b9adcbfa29bff65c988a592471f9c9562d4d26))
* support mw ([788e417](https://github.com/midwayjs/midway-faas/commit/788e41764c2e5d345da302c03a99ceae70714e51))





## [0.2.92-beta.1](https://github.com/midwayjs/midway-faas/compare/v0.2.91...v0.2.92-beta.1) (2020-05-04)


### Bug Fixes

* fix fc http trigger header ([3e80468](https://github.com/midwayjs/midway-faas/commit/3e80468833072649d35a4222963b1653e9bf9558))
* fix getEnv ([f38a370](https://github.com/midwayjs/midway-faas/commit/f38a370ada478e329cb01b4af789b02419915c04))
* fix test case ([81fc9d6](https://github.com/midwayjs/midway-faas/commit/81fc9d61f4e0ff0e9f78dad28d5353f5f23b74a9))
* use IMidwayCoreApplication ([cbf871f](https://github.com/midwayjs/midway-faas/commit/cbf871f8e5b6c7986df333203f9a68164312a6ca))


### Features

* add faas middleware loader ([250560a](https://github.com/midwayjs/midway-faas/commit/250560a1656e0d0e7601e44d7807ff5124c3ad86))
* add middleware info from user config ([67b9adc](https://github.com/midwayjs/midway-faas/commit/67b9adcbfa29bff65c988a592471f9c9562d4d26))
* support mw ([788e417](https://github.com/midwayjs/midway-faas/commit/788e41764c2e5d345da302c03a99ceae70714e51))





## [0.2.90](https://github.com/midwayjs/midway-faas/compare/v0.2.89...v0.2.90) (2020-04-29)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.89](https://github.com/midwayjs/midway-faas/compare/v0.2.88...v0.2.89) (2020-04-28)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.88](https://github.com/midwayjs/midway-faas/compare/v0.2.87...v0.2.88) (2020-04-26)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.87](https://github.com/midwayjs/midway-faas/compare/v0.2.86...v0.2.87) (2020-04-26)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.76](https://github.com/midwayjs/midway-faas/compare/v0.2.71...v0.2.76) (2020-04-16)


### Bug Fixes

* set default env to ctx.env ([0f590eb](https://github.com/midwayjs/midway-faas/commit/0f590eb545a6e1eeeac3cda46681d759d5b5278d))





## [0.2.75](https://github.com/midwayjs/midway-faas/compare/v0.2.71...v0.2.75) (2020-04-15)


### Bug Fixes

* set default env to ctx.env ([0f590eb](https://github.com/midwayjs/midway-faas/commit/0f590eb545a6e1eeeac3cda46681d759d5b5278d))





## [0.2.74](https://github.com/midwayjs/midway-faas/compare/v0.2.73...v0.2.74) (2020-04-13)


### Bug Fixes

* set default env to ctx.env ([ef732e0](https://github.com/midwayjs/midway-faas/commit/ef732e05a738d42ba47088d6cced5375e78e1dff))





## [0.2.73](https://github.com/midwayjs/midway-faas/compare/v0.2.73-alpha.0...v0.2.73) (2020-04-11)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.72](https://github.com/midwayjs/midway-faas/compare/v0.2.71...v0.2.72) (2020-04-11)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.65](https://github.com/midwayjs/midway-faas/compare/v0.2.64...v0.2.65) (2020-04-05)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.64](https://github.com/midwayjs/midway-faas/compare/v0.2.63...v0.2.64) (2020-04-05)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.63](https://github.com/midwayjs/midway-faas/compare/v0.2.62...v0.2.63) (2020-04-03)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.61](https://github.com/midwayjs/midway-faas/compare/v0.2.60...v0.2.61) (2020-03-31)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.60](https://github.com/midwayjs/midway-faas/compare/v0.2.59...v0.2.60) (2020-03-31)


### Features

* Support @Func class method ([#100](https://github.com/midwayjs/midway-faas/issues/100)) ([cce042a](https://github.com/midwayjs/midway-faas/commit/cce042af2d456b74d9db951fe65b6e6f731ecf59))





## [0.2.59](https://github.com/midwayjs/midway-faas/compare/v0.2.58...v0.2.59) (2020-03-30)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.55](https://github.com/midwayjs/midway-faas/compare/v0.2.54...v0.2.55) (2020-03-20)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.49](https://github.com/midwayjs/midway-faas/compare/v0.2.48...v0.2.49) (2020-03-14)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.39](https://github.com/midwayjs/midway-faas/compare/v0.2.38...v0.2.39) (2020-03-02)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.36](https://github.com/midwayjs/midway-faas/compare/v0.2.35...v0.2.36) (2020-02-28)


### Bug Fixes

* add init decorator ([#66](https://github.com/midwayjs/midway-faas/issues/66)) ([716f3b8](https://github.com/midwayjs/midway-faas/commit/716f3b8a4e80c61a3d7726de9a7067e8cd77b4d9))





## [0.2.35](https://github.com/midwayjs/midway-faas/compare/v0.2.34...v0.2.35) (2020-02-26)


### Bug Fixes

* fix ioc.json case ([07a5094](https://github.com/midwayjs/midway-faas/commit/07a509425dd1f80ffa7e85a4d430b78e79ab895f))
* fix load config case ([59f9983](https://github.com/midwayjs/midway-faas/commit/59f99835e508bedd9d153b362e98bc86999a85e0))
* fix missing decorator and refresh method ([421fab7](https://github.com/midwayjs/midway-faas/commit/421fab774f5d6248c308985a4ae72f7efaa45f11))





## [0.2.32](https://github.com/midwayjs/midway-faas/compare/v0.2.31...v0.2.32) (2020-02-23)


### Features

* [@handler](https://github.com/handler) support ([#59](https://github.com/midwayjs/midway-faas/issues/59)) ([d0d6e49](https://github.com/midwayjs/midway-faas/commit/d0d6e491a16bcc24d8a56dd5095e1186852402bb))





## [0.2.31](https://github.com/midwayjs/midway-faas/compare/v0.2.30...v0.2.31) (2020-02-23)


### Features

* add configuration ([#58](https://github.com/midwayjs/midway-faas/issues/58)) ([0aec92d](https://github.com/midwayjs/midway-faas/commit/0aec92dc16c70c812268b1d3b328886fe3d6c309))





## [0.2.27](https://github.com/midwayjs/midway-faas/compare/v0.2.26...v0.2.27) (2020-02-21)


### Bug Fixes

* invoke source map ([#52](https://github.com/midwayjs/midway-faas/issues/52)) ([9149d2a](https://github.com/midwayjs/midway-faas/commit/9149d2a9a3f3d9ba975588b61c6f9bbeec2e8d86)), closes [#51](https://github.com/midwayjs/midway-faas/issues/51)





## [0.2.23](https://github.com/midwayjs/midway-faas/compare/v0.2.22...v0.2.23) (2020-02-17)


### Bug Fixes

* change private to protected ([#49](https://github.com/midwayjs/midway-faas/issues/49)) ([f5373c7](https://github.com/midwayjs/midway-faas/commit/f5373c724d91a08201314d04d50f925ba5f4be5f))





## [0.2.22](https://github.com/midwayjs/midway-faas/compare/v0.2.21...v0.2.22) (2020-02-17)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.18](https://github.com/midwayjs/midway-faas/compare/v0.2.17...v0.2.18) (2020-02-08)


### Bug Fixes

* fix one package invoke ([#39](https://github.com/midwayjs/midway-faas/issues/39)) ([13284a9](https://github.com/midwayjs/midway-faas/commit/13284a9895e846f86e0a29567c1bad6af79e9fd7))





## [0.2.11](https://github.com/midwayjs/midway-faas/compare/v0.2.10...v0.2.11) (2020-01-20)

**Note:** Version bump only for package @midwayjs/faas





## [0.2.6](https://github.com/midwayjs/midway-faas/compare/v0.2.5...v0.2.6) (2020-01-14)

**Note:** Version bump only for package @midwayjs/faas





# [0.2.0](https://github.com/midwayjs/midway-faas/compare/v0.1.12...v0.2.0) (2020-01-05)

**Note:** Version bump only for package @midwayjs/faas





## [0.1.5](https://github.com/midwayjs/midway-faas/compare/v0.1.4...v0.1.5) (2019-12-22)

**Note:** Version bump only for package @midwayjs/faas





## [0.1.4](https://github.com/midwayjs/midway-faas/compare/v0.1.3...v0.1.4) (2019-12-21)

**Note:** Version bump only for package @midwayjs/faas





## [0.1.3](https://github.com/midwayjs/midway-faas/compare/v0.1.2...v0.1.3) (2019-12-18)

**Note:** Version bump only for package @midwayjs/faas





## [0.1.2](https://github.com/midwayjs/midway-faas/compare/v0.1.1...v0.1.2) (2019-12-13)

**Note:** Version bump only for package @midwayjs/faas





## [0.1.1](https://github.com/midwayjs/midway-faas/compare/v0.1.0...v0.1.1) (2019-12-13)

**Note:** Version bump only for package @midwayjs/faas





# [0.1.0](https://github.com/midwayjs/midway-faas/compare/v0.0.10...v0.1.0) (2019-12-13)

**Note:** Version bump only for package @midwayjs/faas
