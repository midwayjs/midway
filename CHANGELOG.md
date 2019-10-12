# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.12.1](https://github.com/midwayjs/midway/compare/v1.12.0...v1.12.1) (2019-10-12)


### Bug Fixes

* **midway-bin:** use resolveModule() instead of findFramework() ([#344](https://github.com/midwayjs/midway/issues/344)) ([8c24e2e](https://github.com/midwayjs/midway/commit/8c24e2e))


### BREAKING CHANGES

* **midway-bin:** remove findFramework()





# [1.12.0](https://github.com/midwayjs/midway/compare/v1.11.6...v1.12.0) (2019-10-11)


### Features

* **midway-bin:** add and export functions ([80ef6b8](https://github.com/midwayjs/midway/commit/80ef6b8))





## [1.11.6](https://github.com/midwayjs/midway/compare/v1.11.5...v1.11.6) (2019-09-30)

**Note:** Version bump only for package midway





## [1.11.5](https://github.com/midwayjs/midway/compare/v1.11.4...v1.11.5) (2019-09-06)

**Note:** Version bump only for package midway





## [1.11.4](https://github.com/midwayjs/midway/compare/v1.11.3...v1.11.4) (2019-09-06)

**Note:** Version bump only for package midway





## [1.11.3](https://github.com/midwayjs/midway/compare/v1.11.2...v1.11.3) (2019-09-06)


### Bug Fixes

* module path under mono repo ([8342487](https://github.com/midwayjs/midway/commit/8342487)), closes [#329](https://github.com/midwayjs/midway/issues/329)
* scripts compatibility under windows ([78850d1](https://github.com/midwayjs/midway/commit/78850d1))





## [1.11.2](https://github.com/midwayjs/midway/compare/v1.11.1...v1.11.2) (2019-08-30)

**Note:** Version bump only for package midway





## [1.11.1](https://github.com/midwayjs/midway/compare/v1.11.0...v1.11.1) (2019-08-10)

**Note:** Version bump only for package midway





# [1.11.0](https://github.com/midwayjs/midway/compare/v1.10.9...v1.11.0) (2019-08-09)


### Features

* **boilerplate:** enable source map for stack trace ([77afc3f](https://github.com/midwayjs/midway/commit/77afc3f))


### Performance Improvements

* **web:** use set to avoid duplicate lookup ([21e44f9](https://github.com/midwayjs/midway/commit/21e44f9))





## [1.10.9](https://github.com/midwayjs/midway/compare/v1.10.8...v1.10.9) (2019-08-06)


### Bug Fixes

* app/extend 没有发布到 npm ([73ba51a](https://github.com/midwayjs/midway/commit/73ba51a))





## [1.10.8](https://github.com/midwayjs/midway/compare/v1.10.7...v1.10.8) (2019-08-03)

**Note:** Version bump only for package midway





## [1.10.7](https://github.com/midwayjs/midway/compare/v1.10.6...v1.10.7) (2019-08-03)


### Bug Fixes

* **boilerplate:** missing comma in .vscode/settings.json ([62fa953](https://github.com/midwayjs/midway/commit/62fa953))





## [1.10.6](https://github.com/midwayjs/midway/compare/v1.10.5...v1.10.6) (2019-07-30)


### Bug Fixes

* @types/mocha has a wrong version: 6.0.0 ([e1a7285](https://github.com/midwayjs/midway/commit/e1a7285))





## [1.10.5](https://github.com/midwayjs/midway/compare/v1.10.4...v1.10.5) (2019-07-30)


### Bug Fixes

* compatible with midway mock ([d738b7f](https://github.com/midwayjs/midway/commit/d738b7f))





## [1.10.4](https://github.com/midwayjs/midway/compare/v1.10.3...v1.10.4) (2019-07-24)


### Bug Fixes

* **boilerplate:** update vscode path match pattern for all boilerplate ([88352e5](https://github.com/midwayjs/midway/commit/88352e5))





## [1.10.3](https://github.com/midwayjs/midway/compare/v1.10.2...v1.10.3) (2019-07-23)


### Bug Fixes

* **boilerplate:** sync configurations for all boilerplate ([e73ae35](https://github.com/midwayjs/midway/commit/e73ae35))
* **boilerplate:** update deps @types/mocha for all boilerplate ([d84cde1](https://github.com/midwayjs/midway/commit/d84cde1))
* **boilerplate:** update deps for all boilerplate ([4a015e7](https://github.com/midwayjs/midway/commit/4a015e7))
* **boilerplate:** update nodejs requirement for all boilerplate ([1602d3a](https://github.com/midwayjs/midway/commit/1602d3a)), closes [#279](https://github.com/midwayjs/midway/issues/279)





## [1.10.2](https://github.com/midwayjs/midway/compare/v1.10.1...v1.10.2) (2019-07-20)

**Note:** Version bump only for package midway





## [1.10.1](https://github.com/midwayjs/midway/compare/v1.10.0...v1.10.1) (2019-07-18)

**Note:** Version bump only for package midway





# [1.10.0](https://github.com/midwayjs/midway/compare/v1.9.0...v1.10.0) (2019-07-16)


### Features

* 导出 egg 的 Service 和 Boot 类，以供用户继承 ([6180040](https://github.com/midwayjs/midway/commit/6180040))





# [1.9.0](https://github.com/midwayjs/midway/compare/v1.8.0...v1.9.0) (2019-07-13)


### Bug Fixes

* **build:** filter unnecessary files [#277](https://github.com/midwayjs/midway/issues/277) ([9c1be93](https://github.com/midwayjs/midway/commit/9c1be93))
* **midway-init:** Internal employees can not use the external network midway ([3179434](https://github.com/midwayjs/midway/commit/3179434))
* **midway-web:** path might be numeric string within safelyGet() ([5b48eff](https://github.com/midwayjs/midway/commit/5b48eff))
* **types:** use generic as typeof context within KoaMiddleware ([6c963e5](https://github.com/midwayjs/midway/commit/6c963e5))


### Features

* [@config](https://github.com/config)(opt) decorator opt accept dot natation ([4ee1959](https://github.com/midwayjs/midway/commit/4ee1959))
* **boilerplate:** add midway-ts-strict-boilerplate ([8ee325c](https://github.com/midwayjs/midway/commit/8ee325c))
* **boilerplate:** enforce kebabCase style for filenames for midway-ts-strict ([816941b](https://github.com/midwayjs/midway/commit/816941b))
* **boilerplate:** update midway-ts-strict ([c8388f0](https://github.com/midwayjs/midway/commit/c8388f0)), closes [#269](https://github.com/midwayjs/midway/issues/269)
* **types:** assign egg['Context'] to types of parameter of context ([ea511fa](https://github.com/midwayjs/midway/commit/ea511fa))
* **types:** export and use type MiddlewareParamArray ([90b4e28](https://github.com/midwayjs/midway/commit/90b4e28))
* **types:** update types of utils.ts ([c76db38](https://github.com/midwayjs/midway/commit/c76db38)), closes [#258](https://github.com/midwayjs/midway/issues/258)
* **types:** update webLoader.ts ([fb534bb](https://github.com/midwayjs/midway/commit/fb534bb))





# [1.8.0](https://github.com/midwayjs/midway/compare/v1.7.0...v1.8.0) (2019-06-29)


### Bug Fixes

* **test:** param controller test add await ([b955427](https://github.com/midwayjs/midway/commit/b955427))
* make routeArgsInfo Optional ([4ed5443](https://github.com/midwayjs/midway/commit/4ed5443))
* package.json restore mkdir package ([c2ec7ba](https://github.com/midwayjs/midway/commit/c2ec7ba))
* **types:** add file/files opt types ([f40b03e](https://github.com/midwayjs/midway/commit/f40b03e))


### Features

* support param decorator [@body](https://github.com/body) [@query](https://github.com/query) [@param](https://github.com/param).. ([6278d99](https://github.com/midwayjs/midway/commit/6278d99))





# [1.7.0](https://github.com/midwayjs/midway/compare/v1.6.3...v1.7.0) (2019-06-25)


### Bug Fixes

* **webloader:** remove routerArgs concat ([9feb872](https://github.com/midwayjs/midway/commit/9feb872))


### Features

* controller opt support sensitive opt ([780f5d7](https://github.com/midwayjs/midway/commit/780f5d7))





## [1.6.3](https://github.com/midwayjs/midway/compare/v1.6.2...v1.6.3) (2019-06-13)

**Note:** Version bump only for package midway





## [1.6.2](https://github.com/midwayjs/midway/compare/v1.6.1...v1.6.2) (2019-06-12)


### Bug Fixes

* fix tsconfig in template ([1680d29](https://github.com/midwayjs/midway/commit/1680d29))





## [1.6.1](https://github.com/midwayjs/midway/compare/v1.6.0...v1.6.1) (2019-06-11)

**Note:** Version bump only for package midway





# [1.6.0](https://github.com/midwayjs/midway/compare/v1.5.6...v1.6.0) (2019-06-11)


### Bug Fixes

* **types:** duplicate import of the controller ([2b4600a](https://github.com/midwayjs/midway/commit/2b4600a))


### Features

* **types:** import and use Context for boilerplate ([d183196](https://github.com/midwayjs/midway/commit/d183196))
* **vscode:** add launch.json for vscode debug ([9741a53](https://github.com/midwayjs/midway/commit/9741a53))
* **vscode:** add settings.json for vscode ([f7d178b](https://github.com/midwayjs/midway/commit/f7d178b))





## [1.5.6](https://github.com/midwayjs/midway/compare/v1.5.5...v1.5.6) (2019-05-13)


### Bug Fixes

* copy files by src dir ([ad7c28d](https://github.com/midwayjs/midway/commit/ad7c28d))





## [1.5.5](https://github.com/midwayjs/midway/compare/v1.5.4...v1.5.5) (2019-05-13)

**Note:** Version bump only for package midway





## [1.5.4](https://github.com/midwayjs/midway/compare/v1.5.3...v1.5.4) (2019-05-09)

**Note:** Version bump only for package midway





## [1.5.3](https://github.com/midwayjs/midway/compare/v1.5.2...v1.5.3) (2019-05-08)

**Note:** Version bump only for package midway





## [1.5.2](https://github.com/midwayjs/midway/compare/v1.5.1...v1.5.2) (2019-04-29)

**Note:** Version bump only for package midway





## [1.5.1](https://github.com/midwayjs/midway/compare/v1.5.0...v1.5.1) (2019-04-15)

**Note:** Version bump only for package midway





# [1.5.0](https://github.com/midwayjs/midway/compare/v1.4.10...v1.5.0) (2019-04-11)


### Bug Fixes

* fix midway-init ci error ([8f32dcb](https://github.com/midwayjs/midway/commit/8f32dcb))


### Features

* add project options in midway-bin ([c635057](https://github.com/midwayjs/midway/commit/c635057))





## [1.4.10](https://github.com/midwayjs/midway/compare/v1.4.9...v1.4.10) (2019-03-12)

**Note:** Version bump only for package midway





## [1.4.9](https://github.com/midwayjs/midway/compare/v1.4.8...v1.4.9) (2019-03-11)


### Bug Fixes

* fix loadDir default path ([9defd2d](https://github.com/midwayjs/midway/commit/9defd2d))





## [1.4.8](https://github.com/midwayjs/midway/compare/v1.4.7...v1.4.8) (2019-03-11)

**Note:** Version bump only for package midway





## [1.4.7](https://github.com/midwayjs/midway/compare/v1.4.6...v1.4.7) (2019-03-08)

**Note:** Version bump only for package midway





## [1.4.6](https://github.com/midwayjs/midway/compare/v1.4.5...v1.4.6) (2019-03-07)

**Note:** Version bump only for package midway





## [1.4.5](https://github.com/midwayjs/midway/compare/v1.4.4...v1.4.5) (2019-03-06)

**Note:** Version bump only for package midway





## [1.4.4](https://github.com/midwayjs/midway/compare/v1.4.3...v1.4.4) (2019-03-06)


### Bug Fixes

* fix decorator i midway-mock ([60367fb](https://github.com/midwayjs/midway/commit/60367fb))
* js-app-xml test case ([1298195](https://github.com/midwayjs/midway/commit/1298195))





## [1.4.3](https://github.com/midwayjs/midway/compare/v1.4.2...v1.4.3) (2019-03-01)

**Note:** Version bump only for package midway





## [1.4.2](https://github.com/midwayjs/midway/compare/v1.4.1...v1.4.2) (2019-02-28)

**Note:** Version bump only for package midway





## [1.4.1](https://github.com/midwayjs/midway/compare/v1.4.0...v1.4.1) (2019-02-27)

**Note:** Version bump only for package midway





# [1.4.0](https://github.com/midwayjs/midway/compare/v1.3.2...v1.4.0) (2019-02-24)


### Features

* add egg definition ([5d28443](https://github.com/midwayjs/midway/commit/5d28443))





## [1.3.2](https://github.com/midwayjs/midway/compare/v1.3.1...v1.3.2) (2019-02-22)

**Note:** Version bump only for package midway





## [1.3.1](https://github.com/midwayjs/midway/compare/v1.3.0...v1.3.1) (2019-02-18)

**Note:** Version bump only for package midway





# [1.3.0](https://github.com/midwayjs/midway/compare/v1.2.4...v1.3.0) (2019-02-12)


### Bug Fixes

* remove inject api generator ([203478e](https://github.com/midwayjs/midway/commit/203478e))


### Features

* add new doc command ([972db71](https://github.com/midwayjs/midway/commit/972db71))
* support process.env.PORT in dev command ([0756f0e](https://github.com/midwayjs/midway/commit/0756f0e))





## [1.2.4](https://github.com/midwayjs/midway/compare/v1.2.3...v1.2.4) (2019-02-11)


### Bug Fixes

* fix default logdir for alinode plugin ([1f737f7](https://github.com/midwayjs/midway/commit/1f737f7))





## [1.2.3](https://github.com/midwayjs/midway/compare/v1.2.2...v1.2.3) (2019-02-01)


### Bug Fixes

* fix lint ([d9e1ab9](https://github.com/midwayjs/midway/commit/d9e1ab9))
* fix more lint ([12873dc](https://github.com/midwayjs/midway/commit/12873dc))





## [1.2.2](https://github.com/midwayjs/midway/compare/v1.2.1...v1.2.2) (2019-01-30)


### Bug Fixes

* import router in base controller ([1a0b890](https://github.com/midwayjs/midway/commit/1a0b890))
* import router to fix core ([71a2f61](https://github.com/midwayjs/midway/commit/71a2f61))





## [1.2.1](https://github.com/midwayjs/midway/compare/v1.2.0...v1.2.1) (2019-01-30)

**Note:** Version bump only for package midway





# [1.2.0](https://github.com/midwayjs/midway/compare/v1.1.2...v1.2.0) (2019-01-29)


### Bug Fixes

* app.runSchedule task key ([29249e9](https://github.com/midwayjs/midway/commit/29249e9))


### Features

* midway-mock支持applicationContext获取ctx依赖注入，支持mock IoC容器中的对象方法 ([4f07c6d](https://github.com/midwayjs/midway/commit/4f07c6d))
* transform injection to another github repo ([5f39ea9](https://github.com/midwayjs/midway/commit/5f39ea9))





## [1.1.2](https://github.com/midwayjs/midway/compare/v1.1.1...v1.1.2) (2019-01-27)

**Note:** Version bump only for package midway





## [1.1.1](https://github.com/midwayjs/midway/compare/v1.1.0...v1.1.1) (2019-01-23)


### Bug Fixes

* remove application definition from egg ([218cf3b](https://github.com/midwayjs/midway/commit/218cf3b))





# [1.1.0](https://github.com/midwayjs/midway/compare/v1.0.5...v1.1.0) (2019-01-23)


### Bug Fixes

* check whether methodNames is iterable ([d8c08d7](https://github.com/midwayjs/midway/commit/d8c08d7))
* fix test case ([de70efa](https://github.com/midwayjs/midway/commit/de70efa))


### Features

* add tslint rules ([73ff338](https://github.com/midwayjs/midway/commit/73ff338))
* 用户执行 init 时判断环境 ([142e0e2](https://github.com/midwayjs/midway/commit/142e0e2))





## [1.0.5](https://github.com/midwayjs/midway/compare/v1.0.4...v1.0.5) (2019-01-07)


### Bug Fixes

* add appDir in appInfo ([4399aba](https://github.com/midwayjs/midway/commit/4399aba))
* override alinode default path ([f140a18](https://github.com/midwayjs/midway/commit/f140a18))





## [1.0.4](https://github.com/midwayjs/midway/compare/v1.0.3...v1.0.4) (2018-12-29)

**Note:** Version bump only for package midway





## [1.0.3](https://github.com/midwayjs/midway/compare/v1.0.2...v1.0.3) (2018-12-27)


### Bug Fixes

* remove pull template from github and add doc for windows ([3ac69ef](https://github.com/midwayjs/midway/commit/3ac69ef))





## [1.0.2](https://github.com/midwayjs/midway/compare/v1.0.1...v1.0.2) (2018-12-26)

**Note:** Version bump only for package midway





## [1.0.1](https://github.com/midwayjs/midway/compare/v1.0.0...v1.0.1) (2018-12-23)

**Note:** Version bump only for package midway





# [1.0.0](https://github.com/midwayjs/midway/compare/v0.7.1...v1.0.0) (2018-12-23)


### Features

* Release v1.0.0



## [0.7.1](https://github.com/midwayjs/midway/compare/v0.7.0...v0.7.1) (2018-12-18)


### Bug Fixes

* lock egg-schedule version ([668a4b3](https://github.com/midwayjs/midway/commit/668a4b3))





# [0.7.0](https://github.com/midwayjs/midway/compare/v0.6.5...v0.7.0) (2018-12-09)


### Bug Fixes

* Boolean type resolution error in xml ([b3a35e4](https://github.com/midwayjs/midway/commit/b3a35e4))


### Features

* Add build specified suffix file ([1752cf9](https://github.com/midwayjs/midway/commit/1752cf9))
* support non-default class for midway-schedule ([74e51e9](https://github.com/midwayjs/midway/commit/74e51e9))





## [0.6.5](https://github.com/midwayjs/midway/compare/v0.6.4...v0.6.5) (2018-11-27)

**Note:** Version bump only for package midway





## [0.6.4](https://github.com/midwayjs/midway/compare/v0.6.3...v0.6.4) (2018-11-21)


### Bug Fixes

* change default search directory ([ae189df](https://github.com/midwayjs/midway/commit/ae189df))





## [0.6.3](https://github.com/midwayjs/midway/compare/v0.6.2...v0.6.3) (2018-11-20)


### Bug Fixes

* fix invoke loadController repeatedly ([8342649](https://github.com/midwayjs/midway/commit/8342649))





## [0.6.2](https://github.com/midwayjs/midway/compare/v0.6.1...v0.6.2) (2018-11-20)


### Bug Fixes

* Increase cron and interval and other parameter expansion ([#62](https://github.com/midwayjs/midway/issues/62)) ([ccd0114](https://github.com/midwayjs/midway/commit/ccd0114))
* not only inject properties that declared on the property ([b1fe4e2](https://github.com/midwayjs/midway/commit/b1fe4e2))





## [0.6.1](https://github.com/midwayjs/midway/compare/v0.6.0...v0.6.1) (2018-11-19)


### Bug Fixes

* fix load order and user can cover default dir ([990ddcb](https://github.com/midwayjs/midway/commit/990ddcb))





# [0.6.0](https://github.com/midwayjs/midway/compare/v0.4.7...v0.6.0) (2018-11-15)


### Bug Fixes

* agent not work ([f43c553](https://github.com/midwayjs/midway/commit/f43c553))
* agent startup become compatible between egg&midway ([47f46c3](https://github.com/midwayjs/midway/commit/47f46c3))
* build not midway-bin ([f16b9db](https://github.com/midwayjs/midway/commit/f16b9db))
* egg-schedule plugin retrieve dir ([6a94e01](https://github.com/midwayjs/midway/commit/6a94e01))
* logger & build scripts ([c2e29aa](https://github.com/midwayjs/midway/commit/c2e29aa))
* run task with wront ctx & fill tests ([94d95c3](https://github.com/midwayjs/midway/commit/94d95c3))
* schedule build file not published ([e14be5b](https://github.com/midwayjs/midway/commit/e14be5b))


### Features

* init midway-schedule ([4442bd1](https://github.com/midwayjs/midway/commit/4442bd1))





## [0.5.1](https://github.com/midwayjs/midway/compare/v0.5.0...v0.5.1) (2018-11-15)


### Bug Fixes

* schedule build file not published ([4150ce2](https://github.com/midwayjs/midway/commit/4150ce2))





# [0.5.0](https://github.com/midwayjs/midway/compare/v0.4.5...v0.5.0) (2018-11-15)


### Bug Fixes

* agent not work ([c7cf3a9](https://github.com/midwayjs/midway/commit/c7cf3a9))
* agent startup become compatible between egg&midway ([05c98aa](https://github.com/midwayjs/midway/commit/05c98aa))
* build not midway-bin ([5b9667f](https://github.com/midwayjs/midway/commit/5b9667f))
* egg-schedule plugin retrieve dir ([8429332](https://github.com/midwayjs/midway/commit/8429332))
* logger & build scripts ([ef1a948](https://github.com/midwayjs/midway/commit/ef1a948))
* run task with wront ctx & fill tests ([30a0741](https://github.com/midwayjs/midway/commit/30a0741))


### Features

* init midway-schedule ([82cc9e1](https://github.com/midwayjs/midway/commit/82cc9e1))


## [0.4.7](https://github.com/midwayjs/midway/compare/v0.4.6...v0.4.7) (2018-11-15)


### Bug Fixes

* fix load dir bug in js mode ([8c148f3](https://github.com/midwayjs/midway/commit/8c148f3))





## [0.4.6](https://github.com/midwayjs/midway/compare/v0.4.5...v0.4.6) (2018-11-14)


### Bug Fixes

* add ts autoload directory ([a6668fb](https://github.com/midwayjs/midway/commit/a6668fb))
* fix dep map generator err in constructor inject ([9d7abe6](https://github.com/midwayjs/midway/commit/9d7abe6))
* fix set app use defineProperty ([d94d5e9](https://github.com/midwayjs/midway/commit/d94d5e9))
* lint & test failed ([0a3fb74](https://github.com/midwayjs/midway/commit/0a3fb74))





## [0.4.5](https://github.com/midwayjs/midway/compare/v0.4.4...v0.4.5) (2018-11-05)


### Bug Fixes

* fix app.root ([33d730c](https://github.com/midwayjs/midway/commit/33d730c))





<a name="0.2.10"></a>
## [0.2.10](https://github.com/midwayjs/midway/compare/v0.2.9...v0.2.10) (2018-08-20)

**Note:** Version bump only for package midway





<a name="0.2.9"></a>
## [0.2.9](https://github.com/midwayjs/midway/compare/v0.2.8...v0.2.9) (2018-08-16)


### Bug Fixes

* mock obj ([1d867ed](https://github.com/midwayjs/midway/commit/1d867ed))
* set appDir before setServerEnv ([6b418ca](https://github.com/midwayjs/midway/commit/6b418ca))





<a name="0.2.8"></a>
## [0.2.8](https://github.com/midwayjs/midway/compare/v0.2.7...v0.2.8) (2018-08-15)


### Bug Fixes

* fix framework name and support load server options from pkg ([b8b4c7d](https://github.com/midwayjs/midway/commit/b8b4c7d))
* fix template and modify ts register method ([1857c08](https://github.com/midwayjs/midway/commit/1857c08))
* support typescript in dependencies ([b532a90](https://github.com/midwayjs/midway/commit/b532a90))





<a name="0.2.7"></a>
## [0.2.7](https://github.com/midwayjs/midway/compare/v0.2.6...v0.2.7) (2018-08-10)


### Bug Fixes

* bind method definition missing ([79685db](https://github.com/midwayjs/midway/commit/79685db))
* export bootstrap file ([d2bd919](https://github.com/midwayjs/midway/commit/d2bd919))
* export bootstrap file ([1337926](https://github.com/midwayjs/midway/commit/1337926))
* module name ([c00d20c](https://github.com/midwayjs/midway/commit/c00d20c))





<a name="0.2.6"></a>
## [0.2.6](https://github.com/midwayjs/midway/compare/v0.2.5...v0.2.6) (2018-08-08)


### Bug Fixes

* publish add bootstrap file ([3593ec5](https://github.com/midwayjs/midway/commit/3593ec5))
* try to export container method ([7921cdb](https://github.com/midwayjs/midway/commit/7921cdb))





<a name="0.2.5"></a>
## [0.2.5](https://github.com/midwayjs/midway/compare/v0.2.4...v0.2.5) (2018-08-06)


### Bug Fixes

* ts-node register twice ([b405159](https://github.com/midwayjs/midway/commit/b405159))
