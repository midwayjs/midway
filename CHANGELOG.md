# Change Log


## v3.20.12 (2025-08-10)

#### :nail_care: Polish
* `web-express`, `web-koa`, `web`
  * [#4371](https://github.com/midwayjs/midway/pull/4371) feat: add random free port ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#4372](https://github.com/midwayjs/midway/pull/4372) docs: update static_file.md for static directory not found ([@heyongsheng](https://github.com/heyongsheng))
* [#4370](https://github.com/midwayjs/midway/pull/4370) docs: update static_file.md for static directory not found ([@heyongsheng](https://github.com/heyongsheng))

#### :package: Dependencies
* `grpc`
  * [#4355](https://github.com/midwayjs/midway/pull/4355) fix(deps): update dependency @grpc/grpc-js to v1.13.4 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4373](https://github.com/midwayjs/midway/pull/4373) chore(deps): update mongo docker tag to v4.4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- He Yongsheng ([@heyongsheng](https://github.com/heyongsheng))



## v3.20.11 (2025-08-02)

#### :nail_care: Polish
* `typeorm`
  * [#4369](https://github.com/midwayjs/midway/pull/4369) feat: add config allow typeorm migrations ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `core`, `web-koa`
  * [#4366](https://github.com/midwayjs/midway/pull/4366) fix(deps): update dependency koa to v2.16.2 [security] ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.20.10 (2025-07-27)

#### :bug: Bug Fix
* `ws`
  * [#4364](https://github.com/midwayjs/midway/pull/4364) fix: heartbeat does not take effect in koa scenario ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `cron`
  * [#4361](https://github.com/midwayjs/midway/pull/4361) breaking: upgrade cron to 3.5.0, support waitForComplete ([@denghongcai](https://github.com/denghongcai))

#### :package: Dependencies
* [#4362](https://github.com/midwayjs/midway/pull/4362) fix(deps): update dependency statuses to v2.0.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Hongcai Deng ([@denghongcai](https://github.com/denghongcai))



## v3.20.9 (2025-07-13)

#### :nail_care: Polish
* `ws`
  * [#4360](https://github.com/midwayjs/midway/pull/4360) feat: add ws upgrade handler ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#4359](https://github.com/midwayjs/midway/pull/4359) docs: update the wrong spelling of DefaultConfig ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `jwt`
  * [#4356](https://github.com/midwayjs/midway/pull/4356) fix(deps): update dependency @types/jsonwebtoken to v9.0.10 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))


## v4.0.0-beta.1 (2025-07-06)

#### :boom: Breaking Change
* `bullmq`, `consul`, `core`, `etcd`, `mcp`, `mock`, `redis`, `swagger`, `web-express`, `web-koa`, `web`
  * [#4313](https://github.com/midwayjs/midway/pull/4313) feat: support service discovery ([@czy88840616](https://github.com/czy88840616))
* `core`, `i18n`, `validation-class-validator`, `validation-joi`, `validation-zod`, `validation`
  * [#4287](https://github.com/midwayjs/midway/pull/4287) feat: support zod ([@czy88840616](https://github.com/czy88840616))
* `bull`, `core`, `cron`, `grpc`, `kafka`, `mqtt`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#4236](https://github.com/midwayjs/midway/pull/4236) feat: Unification framework logger ([@czy88840616](https://github.com/czy88840616))

#### :rocket: New Feature
* `bullmq`, `consul`, `core`, `etcd`, `mcp`, `mock`, `redis`, `swagger`, `web-express`, `web-koa`, `web`
  * [#4313](https://github.com/midwayjs/midway/pull/4313) feat: support service discovery ([@czy88840616](https://github.com/czy88840616))
* `core`, `i18n`, `validation-class-validator`, `validation-joi`, `validation-zod`, `validation`
  * [#4287](https://github.com/midwayjs/midway/pull/4287) feat: support zod ([@czy88840616](https://github.com/czy88840616))
* `core`, `event-emitter`
  * [#4285](https://github.com/midwayjs/midway/pull/4285) feat: add events component ([@czy88840616](https://github.com/czy88840616))
* `core`, `mock`
  * [#4258](https://github.com/midwayjs/midway/pull/4258) feat: try to support HMR ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#4250](https://github.com/midwayjs/midway/pull/4250) feat: add lifecycle timeout options ([@czy88840616](https://github.com/czy88840616))
* `bull`, `core`, `cron`, `grpc`, `kafka`, `mqtt`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#4236](https://github.com/midwayjs/midway/pull/4236) feat: Unification framework logger ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `bull-board`, `bull`, `bullmq`, `busboy`, `core`, `cron`, `validate`
  * [#4290](https://github.com/midwayjs/midway/pull/4290) fix: #4295 #4293 #4299 #4294 ([@czy88840616](https://github.com/czy88840616))
* `bull-board`, `bullmq`
  * [#4286](https://github.com/midwayjs/midway/pull/4286) fix(bull-board): init bull board in resolve ([@harperKKK](https://github.com/harperKKK))
* `kafka`
  * [#4271](https://github.com/midwayjs/midway/pull/4271) fix: KafkaProducerFactory not init from decorator ([@czy88840616](https://github.com/czy88840616))
* `swagger`
  * [#4263](https://github.com/midwayjs/midway/pull/4263) fix(swagger): correct typo from 'text/plan' to 'text/plain' ([@ghostker](https://github.com/ghostker))
* `captcha`
  * [#4242](https://github.com/midwayjs/midway/pull/4242) fix: use security svg-captcha and add more options ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `passport`, `swagger`
  * [#4350](https://github.com/midwayjs/midway/pull/4350) feat: Add global security requirements ([@czy88840616](https://github.com/czy88840616))
* `bull-board`
  * [#4346](https://github.com/midwayjs/midway/pull/4346) feat: create board manager on server ready ([@czy88840616](https://github.com/czy88840616))
* `bull-board`, `bullmq`, `web-koa`
  * [#4330](https://github.com/midwayjs/midway/pull/4330) chore: upgrade bullmq version and update cookie extra options ([@czy88840616](https://github.com/czy88840616))
* `session`, `web-koa`
  * [#4329](https://github.com/midwayjs/midway/pull/4329) feat: support new cookies options ([@czy88840616](https://github.com/czy88840616))
* `rabbitmq`
  * [#4326](https://github.com/midwayjs/midway/pull/4326) feat(rabbitmq): add msg into rabbitmq ctx ([@larryzhuo](https://github.com/larryzhuo))
* `core`
  * [#4311](https://github.com/midwayjs/midway/pull/4311) chore: add TooManyRequestsError to http error ([@liuyuan512](https://github.com/liuyuan512))
* `axios`, `bullmq`
  * [#4278](https://github.com/midwayjs/midway/pull/4278) feat: add custom axios config typings merge ([@czy88840616](https://github.com/czy88840616))
* `bull-board`, `bullmq`
  * [#4261](https://github.com/midwayjs/midway/pull/4261) refactor: bullmq ([@czy88840616](https://github.com/czy88840616))
* `core`, `typeorm`
  * [#4262](https://github.com/midwayjs/midway/pull/4262) feat: support custom data source ([@czy88840616](https://github.com/czy88840616))
* `bull`, `bullmq`
  * [#4257](https://github.com/midwayjs/midway/pull/4257) feat: add package bullmq ([@harperKKK](https://github.com/harperKKK))
* `info`
  * [#4220](https://github.com/midwayjs/midway/pull/4220) refactor: add InfoType enumeration to supplement the missing ts syntax type ([@mmdapl](https://github.com/mmdapl))

#### :memo: Documentation
* Other
  * [#4343](https://github.com/midwayjs/midway/pull/4343) docs: update mqtt.md ([@miraizhao](https://github.com/miraizhao))
* `axios`, `bootstrap`, `bull-board`, `bull`, `busboy`, `cache-manager`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `etcd`, `grpc`, `i18n`, `info`, `kafka`, `leoric`, `mikro`, `mock`, `mongoose`, `mqtt`, `nextjs`, `oss`, `otel`, `rabbitmq`, `redis`, `sequelize`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `tenant`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#4232](https://github.com/midwayjs/midway/pull/4232) docs: use https for github domains ([@mmdapl](https://github.com/mmdapl))

#### :wrench: Maintenance
* `axios`
  * [#4231](https://github.com/midwayjs/midway/pull/4231) refactor: axios component ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `grpc`
  * [#4337](https://github.com/midwayjs/midway/pull/4337) fix(deps): update dependency @grpc/proto-loader to v0.7.15 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4324](https://github.com/midwayjs/midway/pull/4324) fix(deps): update dependency @grpc/grpc-js to v1.13.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4289](https://github.com/midwayjs/midway/pull/4289) fix(deps): update dependency @grpc/grpc-js to v1.12.6 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4239](https://github.com/midwayjs/midway/pull/4239) fix(deps): update dependency @grpc/grpc-js to v1.12.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#4338](https://github.com/midwayjs/midway/pull/4338) fix(deps): update dependency ali-oss to v6.23.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4245](https://github.com/midwayjs/midway/pull/4245) fix(deps): update dependency ali-oss to v6.22.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`, `web-koa`
  * [#4322](https://github.com/midwayjs/midway/pull/4322) fix(deps): update dependency koa to v2.16.1 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#4310](https://github.com/midwayjs/midway/pull/4310) fix(deps): update dependency axios to v1.8.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4307](https://github.com/midwayjs/midway/pull/4307) fix(deps): update dependency axios to v1.8.3 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4305](https://github.com/midwayjs/midway/pull/4305) fix(deps): update dependency axios to v1.8.2 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `captcha`, `security`
  * [#4319](https://github.com/midwayjs/midway/pull/4319) fix(deps): update dependency nanoid to v3.3.11 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#4318](https://github.com/midwayjs/midway/pull/4318) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4308](https://github.com/midwayjs/midway/pull/4308) fix(deps): update dependency mqtt to v5.10.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#4302](https://github.com/midwayjs/midway/pull/4302) fix(deps): update dependency @types/jsonwebtoken to v9.0.9 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4281](https://github.com/midwayjs/midway/pull/4281) fix(deps): update dependency @types/jsonwebtoken to v9.0.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `leoric`
  * [#4303](https://github.com/midwayjs/midway/pull/4303) fix(deps): update dependency leoric to v2.13.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4273](https://github.com/midwayjs/midway/pull/4273) fix(deps): update dependency leoric to v2.13.4 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4274](https://github.com/midwayjs/midway/pull/4274) chore(deps): update supercharge/mongodb-github-action action to v1.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4282](https://github.com/midwayjs/midway/pull/4282) chore(deps): update dependency @types/node to v22.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4256](https://github.com/midwayjs/midway/pull/4256) chore(deps): update dependency @types/node to v22.10.7 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4227](https://github.com/midwayjs/midway/pull/4227) chore(deps): update dependency @types/node to v22.10.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#4291](https://github.com/midwayjs/midway/pull/4291) fix(deps): update dependency koa to v2.15.4 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`, `web`
  * [#4276](https://github.com/midwayjs/midway/pull/4276) fix(deps): update dependency qs to v6.14.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#4279](https://github.com/midwayjs/midway/pull/4279) chore(deps): update dependency swagger-ui-dist to v5.18.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `bullmq`
  * [#4283](https://github.com/midwayjs/midway/pull/4283) fix(deps): update dependency bullmq to v5.39.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4275](https://github.com/midwayjs/midway/pull/4275) fix(deps): update dependency bullmq to v5.37.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#4284](https://github.com/midwayjs/midway/pull/4284) fix(deps): update dependency casbin to v5.38.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4246](https://github.com/midwayjs/midway/pull/4246) fix(deps): update dependency casbin to v5.36.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#4280](https://github.com/midwayjs/midway/pull/4280) chore(deps): update mikro-orm monorepo to v6.4.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4260](https://github.com/midwayjs/midway/pull/4260) chore(deps): update mikro-orm monorepo to v6.4.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4247](https://github.com/midwayjs/midway/pull/4247) chore(deps): update mikro-orm monorepo to v6.4.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4223](https://github.com/midwayjs/midway/pull/4223) chore(deps): update mikro-orm monorepo to v6.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `ws`
  * [#4272](https://github.com/midwayjs/midway/pull/4272) fix(deps): update dependency @types/ws to v8.5.14 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#4265](https://github.com/midwayjs/midway/pull/4265) chore(deps): update dependency @opentelemetry/sdk-node to v0.57.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4235](https://github.com/midwayjs/midway/pull/4235) chore(deps): update dependency @opentelemetry/sdk-node to v0.57.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`, `rabbitmq`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#4266](https://github.com/midwayjs/midway/pull/4266) chore(deps): update dependency fs-extra to v11.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#4264](https://github.com/midwayjs/midway/pull/4264) chore(deps): update dependency mongoose to v8.9.5 [security] ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4253](https://github.com/midwayjs/midway/pull/4253) chore(deps): update dependency mongoose to v8.9.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4238](https://github.com/midwayjs/midway/pull/4238) chore(deps): update dependency mongoose to v8.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4233](https://github.com/midwayjs/midway/pull/4233) chore(deps): update dependency mongoose to v8.9.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4230](https://github.com/midwayjs/midway/pull/4230) chore(deps): update mongoose monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`
  * [#4248](https://github.com/midwayjs/midway/pull/4248) fix(deps): update dependency @midwayjs/event-bus to v1.11.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#4243](https://github.com/midwayjs/midway/pull/4243) fix(deps): update dependency bull to v4.16.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `redis`
  * [#4244](https://github.com/midwayjs/midway/pull/4244) fix(deps): update dependency ioredis to v5.4.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#4240](https://github.com/midwayjs/midway/pull/4240) chore(deps): update dependency egg-logger to v3.6.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4228](https://github.com/midwayjs/midway/pull/4228) chore(deps): update dependency egg-scripts to v3.1.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 7
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))
- Aaron Liu ([@liuyuan512](https://github.com/liuyuan512))
- Ghoster ([@ghostker](https://github.com/ghostker))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Mirai Zhao ([@miraizhao](https://github.com/miraizhao))
- [@harperKKK](https://github.com/harperKKK)
- larryzz ([@larryzhuo](https://github.com/larryzhuo))


## v3.20.8 (2025-06-25)

#### :nail_care: Polish
* `ws`
  * [#4354](https://github.com/midwayjs/midway/pull/4354) feat: add request to ws context ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.20.7 (2025-06-18)

#### :bug: Bug Fix
* `bull-board`
  * [#4351](https://github.com/midwayjs/midway/pull/4351) fix: bull-board missing export adapter ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.20.6 (2025-06-17)

#### :nail_care: Polish
* `passport`, `swagger`
  * [#4350](https://github.com/midwayjs/midway/pull/4350) feat: Add global security requirements ([@czy88840616](https://github.com/czy88840616))
* `bull-board`
  * [#4346](https://github.com/midwayjs/midway/pull/4346) feat: create board manager on server ready ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#4343](https://github.com/midwayjs/midway/pull/4343) docs: update mqtt.md ([@miraizhao](https://github.com/miraizhao))

#### :package: Dependencies
* `grpc`
  * [#4337](https://github.com/midwayjs/midway/pull/4337) fix(deps): update dependency @grpc/proto-loader to v0.7.15 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#4338](https://github.com/midwayjs/midway/pull/4338) fix(deps): update dependency ali-oss to v6.23.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Mirai Zhao ([@miraizhao](https://github.com/miraizhao))



## v3.20.5 (2025-04-27)

#### :nail_care: Polish
* `bull-board`, `bullmq`, `web-koa`
  * [#4330](https://github.com/midwayjs/midway/pull/4330) chore: upgrade bullmq version and update cookie extra options ([@czy88840616](https://github.com/czy88840616))
* `session`, `web-koa`
  * [#4329](https://github.com/midwayjs/midway/pull/4329) feat: support new cookies options ([@czy88840616](https://github.com/czy88840616))
* `rabbitmq`
  * [#4326](https://github.com/midwayjs/midway/pull/4326) feat(rabbitmq): add msg into rabbitmq ctx ([@larryzhuo](https://github.com/larryzhuo))

#### :package: Dependencies
* `grpc`
  * [#4324](https://github.com/midwayjs/midway/pull/4324) fix(deps): update dependency @grpc/grpc-js to v1.13.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- larry zhuo ([@larryzhuo](https://github.com/larryzhuo))



## v3.20.4 (2025-04-10)

#### :nail_care: Polish
* `core`
  * [#4311](https://github.com/midwayjs/midway/pull/4311) chore: add TooManyRequestsError to http error ([@liuyuan512](https://github.com/liuyuan512))

#### :package: Dependencies
* `core`, `web-koa`
  * [#4322](https://github.com/midwayjs/midway/pull/4322) fix(deps): update dependency koa to v2.16.1 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#4310](https://github.com/midwayjs/midway/pull/4310) fix(deps): update dependency axios to v1.8.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4307](https://github.com/midwayjs/midway/pull/4307) fix(deps): update dependency axios to v1.8.3 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4305](https://github.com/midwayjs/midway/pull/4305) fix(deps): update dependency axios to v1.8.2 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `captcha`, `security`
  * [#4319](https://github.com/midwayjs/midway/pull/4319) fix(deps): update dependency nanoid to v3.3.11 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#4318](https://github.com/midwayjs/midway/pull/4318) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4308](https://github.com/midwayjs/midway/pull/4308) fix(deps): update dependency mqtt to v5.10.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#4302](https://github.com/midwayjs/midway/pull/4302) fix(deps): update dependency @types/jsonwebtoken to v9.0.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `leoric`
  * [#4303](https://github.com/midwayjs/midway/pull/4303) fix(deps): update dependency leoric to v2.13.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Aaron Liu ([@liuyuan512](https://github.com/liuyuan512))



## v3.20.3 (2025-03-02)

#### :bug: Bug Fix
* `bull-board`, `bull`, `bullmq`, `busboy`, `core`, `cron`, `validate`
  * [#4290](https://github.com/midwayjs/midway/pull/4290) fix: #4295 #4293 #4299 #4294 ([@czy88840616](https://github.com/czy88840616))
* `bull-board`, `bullmq`
  * [#4286](https://github.com/midwayjs/midway/pull/4286) fix(bull-board): init bull board in resolve ([@harperKKK](https://github.com/harperKKK))

#### :package: Dependencies
* Other
  * [#4274](https://github.com/midwayjs/midway/pull/4274) chore(deps): update supercharge/mongodb-github-action action to v1.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#4289](https://github.com/midwayjs/midway/pull/4289) fix(deps): update dependency @grpc/grpc-js to v1.12.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#4291](https://github.com/midwayjs/midway/pull/4291) fix(deps): update dependency koa to v2.15.4 [security] ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@harperKKK](https://github.com/harperKKK)



## v3.20.2 (2025-01-31)

#### :bug: Bug Fix
* `kafka`
  * [#4271](https://github.com/midwayjs/midway/pull/4271) fix: KafkaProducerFactory not init from decorator ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `axios`, `mqtt`
  * [#4278](https://github.com/midwayjs/midway/pull/4278) feat: add custom axios config typings merge ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `web-koa`, `web`
  * [#4276](https://github.com/midwayjs/midway/pull/4276) fix(deps): update dependency qs to v6.14.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#4279](https://github.com/midwayjs/midway/pull/4279) chore(deps): update dependency swagger-ui-dist to v5.18.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#4281](https://github.com/midwayjs/midway/pull/4281) fix(deps): update dependency @types/jsonwebtoken to v9.0.8 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4282](https://github.com/midwayjs/midway/pull/4282) chore(deps): update dependency @types/node to v22.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `bullmq`
  * [#4283](https://github.com/midwayjs/midway/pull/4283) fix(deps): update dependency bullmq to v5.39.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4275](https://github.com/midwayjs/midway/pull/4275) fix(deps): update dependency bullmq to v5.37.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#4284](https://github.com/midwayjs/midway/pull/4284) fix(deps): update dependency casbin to v5.38.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#4280](https://github.com/midwayjs/midway/pull/4280) chore(deps): update mikro-orm monorepo to v6.4.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `leoric`
  * [#4273](https://github.com/midwayjs/midway/pull/4273) fix(deps): update dependency leoric to v2.13.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `ws`
  * [#4272](https://github.com/midwayjs/midway/pull/4272) fix(deps): update dependency @types/ws to v8.5.14 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#4265](https://github.com/midwayjs/midway/pull/4265) chore(deps): update dependency @opentelemetry/sdk-node to v0.57.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`, `rabbitmq`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#4266](https://github.com/midwayjs/midway/pull/4266) chore(deps): update dependency fs-extra to v11.3.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.20.1 (2025-01-17)

#### :bug: Bug Fix
* `swagger`
  * [#4263](https://github.com/midwayjs/midway/pull/4263) fix(swagger): correct typo from 'text/plan' to 'text/plain' ([@ghostker](https://github.com/ghostker))

#### :package: Dependencies
* `mongoose`, `typegoose`
  * [#4264](https://github.com/midwayjs/midway/pull/4264) chore(deps): update dependency mongoose to v8.9.5 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4256](https://github.com/midwayjs/midway/pull/4256) chore(deps): update dependency @types/node to v22.10.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#4260](https://github.com/midwayjs/midway/pull/4260) chore(deps): update mikro-orm monorepo to v6.4.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Ghoster ([@ghostker](https://github.com/ghostker))



## v3.20.0 (2025-01-14)

#### :nail_care: Polish
* `bull-board`, `bullmq`
  * [#4261](https://github.com/midwayjs/midway/pull/4261) refactor: bullmq ([@czy88840616](https://github.com/czy88840616))
* `core`, `typeorm`
  * [#4262](https://github.com/midwayjs/midway/pull/4262) feat: support custom data source ([@czy88840616](https://github.com/czy88840616))
* `bull`, `bullmq`
  * [#4257](https://github.com/midwayjs/midway/pull/4257) feat: add package bullmq ([@harperKKK](https://github.com/harperKKK))

#### :wrench: Maintenance
* `axios`
  * [#4231](https://github.com/midwayjs/midway/pull/4231) refactor: axios component ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `mongoose`, `typegoose`
  * [#4253](https://github.com/midwayjs/midway/pull/4253) chore(deps): update dependency mongoose to v8.9.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@harperKKK](https://github.com/harperKKK)



## v3.19.3 (2024-12-29)

#### :bug: Bug Fix
* `captcha`
  * [#4242](https://github.com/midwayjs/midway/pull/4242) fix: use security svg-captcha and add more options ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `busboy`, `cache-manager`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `decorator`, `etcd`, `grpc`, `i18n`, `info`, `kafka`, `leoric`, `mikro`, `mock`, `mongoose`, `mqtt`, `oss`, `otel`, `rabbitmq`, `redis`, `sequelize`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `tenant`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#4232](https://github.com/midwayjs/midway/pull/4232) docs: use https for github domains ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `bootstrap`
  * [#4248](https://github.com/midwayjs/midway/pull/4248) fix(deps): update dependency @midwayjs/event-bus to v1.11.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#4247](https://github.com/midwayjs/midway/pull/4247) chore(deps): update mikro-orm monorepo to v6.4.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#4243](https://github.com/midwayjs/midway/pull/4243) fix(deps): update dependency bull to v4.16.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#4245](https://github.com/midwayjs/midway/pull/4245) fix(deps): update dependency ali-oss to v6.22.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#4246](https://github.com/midwayjs/midway/pull/4246) fix(deps): update dependency casbin to v5.36.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `redis`
  * [#4244](https://github.com/midwayjs/midway/pull/4244) fix(deps): update dependency ioredis to v5.4.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#4240](https://github.com/midwayjs/midway/pull/4240) chore(deps): update dependency egg-logger to v3.6.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4228](https://github.com/midwayjs/midway/pull/4228) chore(deps): update dependency egg-scripts to v3.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#4239](https://github.com/midwayjs/midway/pull/4239) fix(deps): update dependency @grpc/grpc-js to v1.12.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#4238](https://github.com/midwayjs/midway/pull/4238) chore(deps): update dependency mongoose to v8.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4233](https://github.com/midwayjs/midway/pull/4233) chore(deps): update dependency mongoose to v8.9.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4230](https://github.com/midwayjs/midway/pull/4230) chore(deps): update mongoose monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#4235](https://github.com/midwayjs/midway/pull/4235) chore(deps): update dependency @opentelemetry/sdk-node to v0.57.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.19.2 (2024-12-15)

#### :nail_care: Polish
* `info`
  * [#4220](https://github.com/midwayjs/midway/pull/4220) refactor: add InfoType enumeration to supplement the missing ts syntax type ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `mikro`
  * [#4223](https://github.com/midwayjs/midway/pull/4223) chore(deps): update mikro-orm monorepo to v6.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4227](https://github.com/midwayjs/midway/pull/4227) chore(deps): update dependency @types/node to v22.10.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4214](https://github.com/midwayjs/midway/pull/4214) chore(deps): update dependency typedoc to ^0.27.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4209](https://github.com/midwayjs/midway/pull/4209) chore(deps): update dependency @types/node to v22.10.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4202](https://github.com/midwayjs/midway/pull/4202) chore(deps): update dependency @types/node to v22.10.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4201](https://github.com/midwayjs/midway/pull/4201) chore(deps): update dependency @types/node to v22.9.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4199](https://github.com/midwayjs/midway/pull/4199) chore(deps): update dependency @types/node to v22.9.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4198](https://github.com/midwayjs/midway/pull/4198) chore(deps): update dependency @types/node to v22.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4195](https://github.com/midwayjs/midway/pull/4195) chore(deps): update dependency @types/node to v22.9.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#4225](https://github.com/midwayjs/midway/pull/4225) fix(deps): update dependency express to v4.21.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#4224](https://github.com/midwayjs/midway/pull/4224) fix(deps): update dependency axios to v1.7.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4226](https://github.com/midwayjs/midway/pull/4226) fix(deps): update dependency mqtt to v5.10.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#4208](https://github.com/midwayjs/midway/pull/4208) chore(deps): update dependency mongoose to v8.8.3 [security] ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4194](https://github.com/midwayjs/midway/pull/4194) chore(deps): update dependency mongoose to v8.8.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#4215](https://github.com/midwayjs/midway/pull/4215) fix(deps): update dependency @grpc/grpc-js to v1.12.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `captcha`, `security`
  * [#4222](https://github.com/midwayjs/midway/pull/4222) fix(deps): update dependency nanoid to v3.3.8 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#4213](https://github.com/midwayjs/midway/pull/4213) chore(deps): update dependency egg-logger to v3.6.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#4212](https://github.com/midwayjs/midway/pull/4212) chore(deps): update dependency @opentelemetry/sdk-node to v0.56.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`, `oss`
  * [#4211](https://github.com/midwayjs/midway/pull/4211) chore(deps): update dependency dotenv to v16.4.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `rabbitmq`
  * [#4210](https://github.com/midwayjs/midway/pull/4210) chore(deps): update dependency @types/amqplib to v0.10.6 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4200](https://github.com/midwayjs/midway/pull/4200) chore(deps): update dependency amqplib to v0.10.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`
  * [#4203](https://github.com/midwayjs/midway/pull/4203) chore(deps): update dependency @types/express-session to v1.18.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`, `web`
  * [#4197](https://github.com/midwayjs/midway/pull/4197) fix(deps): update dependency qs to v6.13.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#4196](https://github.com/midwayjs/midway/pull/4196) chore(deps): update dependency @typegoose/typegoose to v12.9.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))



## v3.19.1 (2024-11-18)

#### :bug: Bug Fix
* `leoric`
  * [#4192](https://github.com/midwayjs/midway/pull/4192) fix(leoric): keep multiple datasources from conflicting base model ([@cyjake](https://github.com/cyjake))

#### :package: Dependencies
* `otel`
  * [#4193](https://github.com/midwayjs/midway/pull/4193) chore(deps): update dependency @opentelemetry/sdk-node to v0.55.0 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4191](https://github.com/midwayjs/midway/pull/4191) chore(deps): update dependency @vercel/ncc to v0.38.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4190](https://github.com/midwayjs/midway/pull/4190) fix(deps): update dependency mqtt to v5.10.2 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#4189](https://github.com/midwayjs/midway/pull/4189) fix(deps): update dependency bull to v4.16.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#4185](https://github.com/midwayjs/midway/pull/4185) chore(deps): update dependency mongoose to v8.8.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#4188](https://github.com/midwayjs/midway/pull/4188) chore(deps): update mikro-orm monorepo to v6.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `consul`
  * [#4187](https://github.com/midwayjs/midway/pull/4187) chore(deps): update dependency nock to v13.5.6 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Chen Yangjian ([@cyjake](https://github.com/cyjake))



## v3.19.0 (2024-11-08)

#### :rocket: New Feature
* `core`, `mock`
  * [#4151](https://github.com/midwayjs/midway/pull/4151) feat: add grouping for mock data ([@czy88840616](https://github.com/czy88840616))
* `grpc`
  * [#4159](https://github.com/midwayjs/midway/pull/4159) feat(grpc): GRPCClients.createClient() supports multi services in one .proto file  and returns void insted of T ([@waitingsong](https://github.com/waitingsong))

#### :bug: Bug Fix
* `core`, `static-file`
  * [#4180](https://github.com/midwayjs/midway/pull/4180) fix: static file path handling in pkg environment ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#4176](https://github.com/midwayjs/midway/pull/4176) fix: wrong object format for sse response ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `core`, `kafka`
  * [#4154](https://github.com/midwayjs/midway/pull/4154) feat(kafka): refactor framework and add factory service for producer and admin ([@czy88840616](https://github.com/czy88840616))
* `core`, `mock`
  * [#4150](https://github.com/midwayjs/midway/pull/4150) feat: add performance manager ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#4155](https://github.com/midwayjs/midway/pull/4155) docs(awesome_midway.md): update @mwcp/otel ([@waitingsong](https://github.com/waitingsong))
* [#4131](https://github.com/midwayjs/midway/pull/4131) docs(awesome_midway.md): add @mwcp/paradedb ([@waitingsong](https://github.com/waitingsong))
* [#4127](https://github.com/midwayjs/midway/pull/4127) docs: update awesome_midway.md ([@bossbaba](https://github.com/bossbaba))
* [#4124](https://github.com/midwayjs/midway/pull/4124) docs: update awesome_midway.md ([@bossbaba](https://github.com/bossbaba))

#### :package: Dependencies
* `web-koa`
  * [#4181](https://github.com/midwayjs/midway/pull/4181) fix(deps): update dependency @types/qs to v6.9.17 ([@renovate[bot]](https://github.com/apps/renovate))
* `ws`
  * [#4182](https://github.com/midwayjs/midway/pull/4182) fix(deps): update dependency @types/ws to v8.5.13 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#4179](https://github.com/midwayjs/midway/pull/4179) chore(deps): update dependency swagger-ui-dist to v5.18.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#4178](https://github.com/midwayjs/midway/pull/4178) chore(deps): update dependency @opentelemetry/sdk-node to v0.54.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#4164](https://github.com/midwayjs/midway/pull/4164) chore(deps): update mongoose monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#4162](https://github.com/midwayjs/midway/pull/4162) fix(deps): update socket.io packages to v4.8.1 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4163](https://github.com/midwayjs/midway/pull/4163) chore(deps): update dependency @types/node to v22 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#4145](https://github.com/midwayjs/midway/pull/4145) fix(deps): update dependency casbin to v5.32.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))
- yanzhifei ([@bossbaba](https://github.com/bossbaba))



## v3.18.2 (2024-10-13)

#### :memo: Documentation
* [#4096](https://github.com/midwayjs/midway/pull/4096) docs(awesome_midway.md): update @mwcp/pgmq ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* `leoric`
  * [#4117](https://github.com/midwayjs/midway/pull/4117) fix(deps): update dependency leoric to v2.13.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#4118](https://github.com/midwayjs/midway/pull/4118) fix(deps): update socket.io packages to v4.8.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#4116](https://github.com/midwayjs/midway/pull/4116) fix(deps): update dependency express to v4.21.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#4115](https://github.com/midwayjs/midway/pull/4115) fix(deps): update dependency casbin to v5.31.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#4105](https://github.com/midwayjs/midway/pull/4105) fix(deps): update dependency @grpc/grpc-js to v1.12.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`, `passport`
  * [#4111](https://github.com/midwayjs/midway/pull/4111) chore(deps): update dependency express-session to v1.18.1 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#4104](https://github.com/midwayjs/midway/pull/4104) fix(deps): update bull monorepo to v5.23.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4093](https://github.com/midwayjs/midway/pull/4093) fix(deps): update dependency mqtt to v5.10.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#4092](https://github.com/midwayjs/midway/pull/4092) fix(deps): update dependency @types/qs to v6.9.16 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#4086](https://github.com/midwayjs/midway/pull/4086) chore(deps): update dependency @types/node to v20.16.6 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.18.1 (2024-09-23)

#### :bug: Bug Fix
* `cache-manager`, `swagger`
  * [#4083](https://github.com/midwayjs/midway/pull/4083) fix: ensure compatibility with Swagger response schema and fix the parsing of enum types ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.18.0 (2024-09-22)

#### :rocket: New Feature
* `busboy`, `core`
  * [#4074](https://github.com/midwayjs/midway/pull/4074) feat: busboy support async generator mode ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `mock`, `web-express`, `web-koa`, `web`
  * [#4082](https://github.com/midwayjs/midway/pull/4082) fix: showcase of ssl with mwtsc ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#4058](https://github.com/midwayjs/midway/pull/4058) fix: http client will be override default options ([@czy88840616](https://github.com/czy88840616))
* `core`, `mongoose`
  * [#4061](https://github.com/midwayjs/midway/pull/4061) fix: dataSourcePriority missing default value ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `grpc`
  * [#4079](https://github.com/midwayjs/midway/pull/4079) fix(deps): update dependency @grpc/grpc-js to v1.11.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#4080](https://github.com/midwayjs/midway/pull/4080) fix(deps): update dependency @types/jsonwebtoken to v9.0.7 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.17.3 (2024-09-14)

#### :bug: Bug Fix
* `swagger`
  * [#4075](https://github.com/midwayjs/midway/pull/4075) fix: swagger body array type ([@czy88840616](https://github.com/czy88840616))
  * [#4062](https://github.com/midwayjs/midway/pull/4062) fix: swagger api tag for router ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `cos`
  * [#4073](https://github.com/midwayjs/midway/pull/4073) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#4067](https://github.com/midwayjs/midway/pull/4067) fix(deps): update dependency express to v4.20.0 [security] ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4066](https://github.com/midwayjs/midway/pull/4066) fix(deps): update dependency body-parser to v1.20.3 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`, `bull`
  * [#4072](https://github.com/midwayjs/midway/pull/4072) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#4059](https://github.com/midwayjs/midway/pull/4059) fix(deps): update dependency @grpc/grpc-js to v1.11.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#4060](https://github.com/midwayjs/midway/pull/4060) fix(deps): update dependency axios to v1.7.7 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.17.2 (2024-09-05)

#### :bug: Bug Fix
* `swagger`
  * [#4050](https://github.com/midwayjs/midway/pull/4050) fix(swagger): miss dto  description from schema ([@lengyuxuan](https://github.com/lengyuxuan))

#### Committers: 1
- fangjin ([@lengyuxuan](https://github.com/lengyuxuan))



## v3.17.1 (2024-09-02)

#### :bug: Bug Fix
* `kafka`
  * [#4046](https://github.com/midwayjs/midway/pull/4046) fix(kafkajs): Fix the issue where the consumer method of the kafkajs component returns true to trigger a commit parameter error. ([@Yuliang-Lee](https://github.com/Yuliang-Lee))

#### :nail_care: Polish
* `core`
  * [#4047](https://github.com/midwayjs/midway/pull/4047) feat: add ctx for the static tpl of response ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `axios`, `http-proxy`
  * [#4040](https://github.com/midwayjs/midway/pull/4040) fix(deps): update dependency axios to v1.7.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#4041](https://github.com/midwayjs/midway/pull/4041) fix(deps): update dependency bull to v4.16.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- xlaoyu ([@Yuliang-Lee](https://github.com/Yuliang-Lee))



## v3.17.0 (2024-08-29)

#### :rocket: New Feature
* `core`
  * [#3982](https://github.com/midwayjs/midway/pull/3982) feat: support response helper and sse util ([@czy88840616](https://github.com/czy88840616))
* `busboy`, `core`
  * [#3875](https://github.com/midwayjs/midway/pull/3875) refactor: upload component use busboy ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `i18n`
  * [#3931](https://github.com/midwayjs/midway/pull/3931) fix: Incorrect group format is used in i18n component ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `core`
  * [#4013](https://github.com/midwayjs/midway/pull/4013) fix(core): DataSourceManagerConfigOption generic OPTIONS now no changes by PowerPartial ([@waitingsong](https://github.com/waitingsong))
* `busboy`, `core`
  * [#3875](https://github.com/midwayjs/midway/pull/3875) refactor: upload component use busboy ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#4018](https://github.com/midwayjs/midway/pull/4018) docs(awesome_midway): add @mwcp/pgmq ([@waitingsong](https://github.com/waitingsong))
* [#4008](https://github.com/midwayjs/midway/pull/4008) docs: extensions koa typo ([@Nokic233](https://github.com/Nokic233))
* [#4007](https://github.com/midwayjs/midway/pull/4007) docs: fix typo ([@Nokic233](https://github.com/Nokic233))

#### :package: Dependencies
* Other
  * [#4036](https://github.com/midwayjs/midway/pull/4036) chore(deps): update dependency @types/node to v20.16.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#4011](https://github.com/midwayjs/midway/pull/4011) fix(deps): update dependency axios to v1.7.4 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#4015](https://github.com/midwayjs/midway/pull/4015) fix(deps): update bull monorepo to v5.21.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#4005](https://github.com/midwayjs/midway/pull/4005) fix(deps): update bull monorepo to v5.21.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#4016](https://github.com/midwayjs/midway/pull/4016) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#4030](https://github.com/midwayjs/midway/pull/4030) fix(deps): update dependency ali-oss to v6.21.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#4031](https://github.com/midwayjs/midway/pull/4031) fix(deps): update dependency mqtt to v5.10.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- NoKic233 ([@Nokic233](https://github.com/Nokic233))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.16.8 (2024-08-03)

#### :bug: Bug Fix
* `sequelize`
  * [#3993](https://github.com/midwayjs/midway/pull/3993) fix: remove authenticate when create data source ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `web-koa`, `web`
  * [#3995](https://github.com/midwayjs/midway/pull/3995) fix(deps): update dependency qs to v6.13.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `ws`
  * [#3988](https://github.com/midwayjs/midway/pull/3988) fix(deps): update dependency @types/ws to v8.5.12 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#3990](https://github.com/midwayjs/midway/pull/3990) fix(deps): update dependency bull to v4.16.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3991](https://github.com/midwayjs/midway/pull/3991) fix(deps): update dependency mqtt to v5.9.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3989](https://github.com/midwayjs/midway/pull/3989) fix(deps): update dependency axios to v1.7.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.16.7 (2024-07-26)

#### :bug: Bug Fix
* `upload`
  * [#3981](https://github.com/midwayjs/midway/pull/3981) fix: single field when allowFieldsDuplication enabled ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `cos`
  * [#3973](https://github.com/midwayjs/midway/pull/3973) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.16.6 (2024-07-26)

#### :nail_care: Polish
* `upload`
  * [#3971](https://github.com/midwayjs/midway/pull/3971) feat: add allowFieldsDuplication options ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `web-koa`, `web`
  * [#3974](https://github.com/midwayjs/midway/pull/3974) fix(deps): update dependency qs to v6.12.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3975](https://github.com/midwayjs/midway/pull/3975) fix(deps): update bull monorepo to v5.21.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`
  * [#3977](https://github.com/midwayjs/midway/pull/3977) fix(deps): update dependency @midwayjs/event-bus to v1.10.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3976](https://github.com/midwayjs/midway/pull/3976) fix(deps): update dependency @grpc/grpc-js to v1.11.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `ws`
  * [#3958](https://github.com/midwayjs/midway/pull/3958) fix(deps): update dependency @types/ws to v8.5.11 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3959](https://github.com/midwayjs/midway/pull/3959) fix(deps): update dependency mqtt to v5.8.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.16.5 (2024-07-15)

#### :memo: Documentation
* [#3929](https://github.com/midwayjs/midway/pull/3929) docs: update awesome_midway.md ([@MrDotYan](https://github.com/MrDotYan))

#### :package: Dependencies
* `cos`
  * [#3948](https://github.com/midwayjs/midway/pull/3948) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3947](https://github.com/midwayjs/midway/pull/3947) fix(deps): update dependency @grpc/grpc-js to v1.10.11 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3939](https://github.com/midwayjs/midway/pull/3939) chore(deps): update dependency why-is-node-running to v2.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3937](https://github.com/midwayjs/midway/pull/3937) fix(deps): update dependency mqtt to v5.8.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#3938](https://github.com/midwayjs/midway/pull/3938) fix(deps): update dependency ws to v8.18.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`, `web`
  * [#3932](https://github.com/midwayjs/midway/pull/3932) fix(deps): update dependency qs to v6.12.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#3933](https://github.com/midwayjs/midway/pull/3933) fix(deps): update dependency bull to v4.15.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@MrDotYan](https://github.com/MrDotYan)



## v3.16.4 (2024-06-29)

#### :memo: Documentation
* [#3899](https://github.com/midwayjs/midway/pull/3899) docs(site): update awesome_midway.md ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* `mqtt`
  * [#3928](https://github.com/midwayjs/midway/pull/3928) fix(deps): update dependency mqtt to v5.7.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3918](https://github.com/midwayjs/midway/pull/3918) fix(deps): update dependency joi to v17.13.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#3912](https://github.com/midwayjs/midway/pull/3912) fix(deps): update dependency ws to v8.17.1 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3924](https://github.com/midwayjs/midway/pull/3924) fix(deps): update dependency @grpc/grpc-js to v1.10.10 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3901](https://github.com/midwayjs/midway/pull/3901) fix(deps): update dependency @grpc/grpc-js to v1.10.9 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`, `bull`
  * [#3917](https://github.com/midwayjs/midway/pull/3917) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3925](https://github.com/midwayjs/midway/pull/3925) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3904](https://github.com/midwayjs/midway/pull/3904) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#3905](https://github.com/midwayjs/midway/pull/3905) fix(deps): update dependency bull to v4.13.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `cache-manager`
  * [#3897](https://github.com/midwayjs/midway/pull/3897) chore(deps): update dependency cache-manager-ioredis-yet to v2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#3898](https://github.com/midwayjs/midway/pull/3898) chore(deps): update dependency egg-scripts to v3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.16.3 (2024-06-06)

#### :bug: Bug Fix
* `cache-manager`
  * [#3889](https://github.com/midwayjs/midway/pull/3889) fix: get origin value from redis store ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `otel`
  * [#3894](https://github.com/midwayjs/midway/pull/3894) fix(deps): update dependency @opentelemetry/api to v1.9.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3895](https://github.com/midwayjs/midway/pull/3895) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.14.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3893](https://github.com/midwayjs/midway/pull/3893) fix(deps): update bull monorepo to v5.20.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3896](https://github.com/midwayjs/midway/pull/3896) fix(deps): update dependency mqtt to v5.7.0 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3845](https://github.com/midwayjs/midway/pull/3845) chore(deps): update dependency @types/node to v20 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.16.2 (2024-06-01)

#### :bug: Bug Fix
* `swagger`
  * [#3886](https://github.com/midwayjs/midway/pull/3886) fix(swagger): miss dto required from schema ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3871](https://github.com/midwayjs/midway/pull/3871) docs: update release schedule docs, mark v2 as EOL ([@Yuliang-Lee](https://github.com/Yuliang-Lee))
* [#3854](https://github.com/midwayjs/midway/pull/3854) docs: fix typo in mock.md ([@wjw-gavin](https://github.com/wjw-gavin))
* [#3849](https://github.com/midwayjs/midway/pull/3849) docs: update en version tenant.md ([@tuohuang](https://github.com/tuohuang))
* [#3848](https://github.com/midwayjs/midway/pull/3848) docs: update tenant.md ([@tuohuang](https://github.com/tuohuang))

#### :package: Dependencies
* `bull-board`, `bull`
  * [#3881](https://github.com/midwayjs/midway/pull/3881) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3844](https://github.com/midwayjs/midway/pull/3844) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3882](https://github.com/midwayjs/midway/pull/3882) fix(deps): update dependency axios to v1.7.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#3874](https://github.com/midwayjs/midway/pull/3874) chore(deps): update dependency swagger-ui-dist to v5.17.13 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3869](https://github.com/midwayjs/midway/pull/3869) fix(deps): update dependency @grpc/grpc-js to v1.10.8 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3870](https://github.com/midwayjs/midway/pull/3870) chore(deps): update supercharge/mongodb-github-action action to v1.11.0 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3860](https://github.com/midwayjs/midway/pull/3860) chore(deps): update dependency ts-jest to v29.1.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3781](https://github.com/midwayjs/midway/pull/3781) chore(deps): update mongoose monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3856](https://github.com/midwayjs/midway/pull/3856) chore(deps): update mikro-orm monorepo to v6.2.7 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 4
- Gavin ([@wjw-gavin](https://github.com/wjw-gavin))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- xlaoyu ([@Yuliang-Lee](https://github.com/Yuliang-Lee))
- 拓荒 ([@tuohuang](https://github.com/tuohuang))



## v3.16.1 (2024-05-09)

#### :bug: Bug Fix
* `tenant`
  * [#3840](https://github.com/midwayjs/midway/pull/3840) fix: export named error for tenant component ([@czy88840616](https://github.com/czy88840616))
* `web-koa`
  * [#3842](https://github.com/midwayjs/midway/pull/3842) fix: make request.query writeable ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3833](https://github.com/midwayjs/midway/pull/3833) docs: update orm.md ([@flyingcrp](https://github.com/flyingcrp))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 陈十一 ([@flyingcrp](https://github.com/flyingcrp))



## v3.16.0 (2024-05-06)

#### :rocket: New Feature
* `web-koa`
  * [#3751](https://github.com/midwayjs/midway/pull/3751) feat: parse array query by qs ([@czy88840616](https://github.com/czy88840616))
* `core`, `tenant`
  * [#3762](https://github.com/midwayjs/midway/pull/3762) feat: add tenant component with tenant manager ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `swagger`
  * [#3756](https://github.com/midwayjs/midway/pull/3756) refactor: Refactor swagger module ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#3700](https://github.com/midwayjs/midway/pull/3700) fix: health check missing this resolver ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `core`
  * [#3710](https://github.com/midwayjs/midway/pull/3710) feat: add instance args for parameter decorator options ([@czy88840616](https://github.com/czy88840616))
* `mock`, `mqtt`
  * [#3699](https://github.com/midwayjs/midway/pull/3699) feat: support dynamic create mqtt consumer ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `casbin-redis-adapter`, `redis`
  * [#3827](https://github.com/midwayjs/midway/pull/3827) fix(deps): update dependency ioredis to v5.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3825](https://github.com/midwayjs/midway/pull/3825) fix(deps): update bull monorepo to v5.17.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`, `web`
  * [#3811](https://github.com/midwayjs/midway/pull/3811) fix(deps): update dependency qs to v6.12.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `tablestore`
  * [#3824](https://github.com/midwayjs/midway/pull/3824) fix(deps): update dependency tablestore to v5.5.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3823](https://github.com/midwayjs/midway/pull/3823) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.13.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#3829](https://github.com/midwayjs/midway/pull/3829) fix(deps): update dependency ws to v8.17.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3828](https://github.com/midwayjs/midway/pull/3828) fix(deps): update dependency joi to v17.13.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#3826](https://github.com/midwayjs/midway/pull/3826) fix(deps): update dependency casbin to v5.30.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`
  * [#3775](https://github.com/midwayjs/midway/pull/3775) fix(deps): update dependency reflect-metadata to v0.2.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3818](https://github.com/midwayjs/midway/pull/3818) fix(deps): update dependency @grpc/proto-loader to v0.7.13 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3817](https://github.com/midwayjs/midway/pull/3817) fix(deps): update dependency @grpc/grpc-js to v1.10.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#3822](https://github.com/midwayjs/midway/pull/3822) chore(deps): update dependency swagger-ui-dist to v5.17.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3819](https://github.com/midwayjs/midway/pull/3819) chore(deps): update mikro-orm monorepo to v6.2.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3810](https://github.com/midwayjs/midway/pull/3810) fix(deps): update dependency mqtt to v5.5.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.11 (2024-04-25)

#### :bug: Bug Fix
* `express-session`, `web-express`, `web-koa`, `web`
  * [#3807](https://github.com/midwayjs/midway/pull/3807) fix: certificate error in web scene ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `otel`
  * [#3805](https://github.com/midwayjs/midway/pull/3805) chore(deps): update dependency @opentelemetry/sdk-node to v0.51.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3806](https://github.com/midwayjs/midway/pull/3806) chore(deps): update mikro-orm monorepo to v6.2.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.10 (2024-04-19)

#### :nail_care: Polish
* `bull-board`
  * [#3798](https://github.com/midwayjs/midway/pull/3798) refactor: add the bullBoardManager class along with documentation ([@czy88840616](https://github.com/czy88840616))
  * [#3791](https://github.com/midwayjs/midway/pull/3791) feat(bull-board): save the result of createBullBoard ([@DanielXuuuuu](https://github.com/DanielXuuuuu))
* `web-express`, `web-koa`, `web`
  * [#3797](https://github.com/midwayjs/midway/pull/3797) feat Support http server opts ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3788](https://github.com/midwayjs/midway/pull/3788) fix(docs): typo ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* `bull-board`, `view-ejs`
  * [#3792](https://github.com/midwayjs/midway/pull/3792) fix(deps): update dependency ejs to v3.1.10 ([@renovate[bot]](https://github.com/apps/renovate))
* `leoric`
  * [#3793](https://github.com/midwayjs/midway/pull/3793) fix(deps): update dependency leoric to v2.12.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Daniel Xu ([@DanielXuuuuu](https://github.com/DanielXuuuuu))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.15.9 (2024-04-14)

#### :bug: Bug Fix
* `cron`
  * [#3786](https://github.com/midwayjs/midway/pull/3786) fix: remove typings from the cron module since it includes its own types ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.8 (2024-04-12)

#### :bug: Bug Fix
* `socketio`
  * [#3764](https://github.com/midwayjs/midway/pull/3764) fix: socket with regexp namespace ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* Other
  * [#3780](https://github.com/midwayjs/midway/pull/3780) chore(deps): update dessant/lock-threads action to v5 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#3769](https://github.com/midwayjs/midway/pull/3769) fix(deps): update socket.io packages to v4.7.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#3777](https://github.com/midwayjs/midway/pull/3777) fix(deps): update dependency qs to v6.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `static-file`
  * [#3778](https://github.com/midwayjs/midway/pull/3778) fix(deps): update dependency ylru to v1.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#3776](https://github.com/midwayjs/midway/pull/3776) fix(deps): update dependency @opentelemetry/api to v1.8.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `tablestore`
  * [#3774](https://github.com/midwayjs/midway/pull/3774) fix(deps): update dependency tablestore to v5.5.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mqtt`
  * [#3773](https://github.com/midwayjs/midway/pull/3773) fix(deps): update dependency mqtt to v5.5.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#3772](https://github.com/midwayjs/midway/pull/3772) fix(deps): update dependency casbin to v5.29.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `cron`
  * [#3771](https://github.com/midwayjs/midway/pull/3771) fix(deps): update dependency @types/cron to v2.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3770](https://github.com/midwayjs/midway/pull/3770) fix(deps): update bull monorepo to v5.15.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3767](https://github.com/midwayjs/midway/pull/3767) fix(deps): update dependency joi to v17.12.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`, `web-koa`
  * [#3768](https://github.com/midwayjs/midway/pull/3768) fix(deps): update dependency koa to v2.15.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3747](https://github.com/midwayjs/midway/pull/3747) fix(deps): update dependency @grpc/grpc-js to v1.10.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3748](https://github.com/midwayjs/midway/pull/3748) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.13.4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.7 (2024-04-01)

#### :bug: Bug Fix
* `upload`
  * [#3734](https://github.com/midwayjs/midway/pull/3734) fix(upload):parameter "whitelist" supports the function type ([@Bacuuu](https://github.com/Bacuuu))

#### :nail_care: Polish
* `upload`
  * [#3741](https://github.com/midwayjs/midway/pull/3741) feat: support upload mime type white list using function type ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `grpc`
  * [#3729](https://github.com/midwayjs/midway/pull/3729) fix(deps): update dependency @grpc/proto-loader to v0.7.12 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3728](https://github.com/midwayjs/midway/pull/3728) fix(deps): update dependency @grpc/grpc-js to v1.10.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `sequelize`
  * [#3736](https://github.com/midwayjs/midway/pull/3736) chore(deps): update dependency sequelize to v6.37.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#3724](https://github.com/midwayjs/midway/pull/3724) fix(deps): update dependency express to v4.19.2 [security] ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Bacuuu ([@Bacuuu](https://github.com/Bacuuu))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.6 (2024-03-24)

#### :bug: Bug Fix
* `faas`
  * [#3722](https://github.com/midwayjs/midway/pull/3722) fix: enable console transport in serverless env ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `core`, `web-koa`
  * [#3718](https://github.com/midwayjs/midway/pull/3718) fix(deps): update dependency koa to v2.15.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3717](https://github.com/midwayjs/midway/pull/3717) fix(deps): update dependency axios to v1.6.8 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.5 (2024-03-20)

#### :bug: Bug Fix
* `cache-manager`
  * [#3715](https://github.com/midwayjs/midway/pull/3715) fix: cache manager cache key overwrite when use custom logic ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3714](https://github.com/midwayjs/midway/pull/3714) the dosc fix of extension casbin ([@jingmingji](https://github.com/jingmingji))

#### :package: Dependencies
* `mikro`
  * [#3711](https://github.com/midwayjs/midway/pull/3711) chore(deps): update mikro-orm monorepo to v6.1.11 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@jingmingji](https://github.com/jingmingji)



## v3.15.4 (2024-03-18)

#### :bug: Bug Fix
* `mikro`
  * [#3709](https://github.com/midwayjs/midway/pull/3709) fix(mikro): Ensure dataSourceName/contextName used in InjectRepository ([@odex21](https://github.com/odex21))

#### Committers: 1
- [@odex21](https://github.com/odex21)



## v3.15.3 (2024-03-16)

#### :bug: Bug Fix
* `bull`
  * [#3707](https://github.com/midwayjs/midway/pull/3707) fix: bullLogger with undefined value when emit error ([@czy88840616](https://github.com/czy88840616))
* `mikro`
  * [#3704](https://github.com/midwayjs/midway/pull/3704) fix(mikro): RequestContext middleware ([@odex21](https://github.com/odex21))

#### :nail_care: Polish
* `mikro`
  * [#3708](https://github.com/midwayjs/midway/pull/3708) chore: update request content middleware and use default source name … ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `grpc`
  * [#3702](https://github.com/midwayjs/midway/pull/3702) fix(deps): update dependency @grpc/grpc-js to v1.10.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `security`
  * [#3703](https://github.com/midwayjs/midway/pull/3703) fix(deps): update dependency xss to v1.0.15 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@odex21](https://github.com/odex21)



## v3.15.2 (2024-03-09)

#### :nail_care: Polish
* `axios`
  * [#3680](https://github.com/midwayjs/midway/pull/3680) chore: use Axios for interface export ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `swagger`
  * [#3690](https://github.com/midwayjs/midway/pull/3690) chore(deps): update dependency swagger-ui-dist to v5.11.10 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3685](https://github.com/midwayjs/midway/pull/3685) chore(deps): update dependency swagger-ui-dist to v5.11.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3693](https://github.com/midwayjs/midway/pull/3693) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.13.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#3694](https://github.com/midwayjs/midway/pull/3694) fix(deps): update dependency express to v4.18.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3686](https://github.com/midwayjs/midway/pull/3686) chore(deps): update mikro-orm monorepo to v6.1.7 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#3678](https://github.com/midwayjs/midway/pull/3678) fix(deps): update dependency @types/jsonwebtoken to v9.0.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#3676](https://github.com/midwayjs/midway/pull/3676) chore(deps): update dependency @opentelemetry/sdk-node to v0.49.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3677](https://github.com/midwayjs/midway/pull/3677) fix(deps): update bull monorepo to v5.14.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.15.1 (2024-02-27)

#### :nail_care: Polish
* `bull`
  * [#3671](https://github.com/midwayjs/midway/pull/3671) fix: use bull logger when queue emit error ([@czy88840616](https://github.com/czy88840616))
* `passport`
  * [#3669](https://github.com/midwayjs/midway/pull/3669) fix: passport missing ctx.setHeader ([@odex21](https://github.com/odex21))

#### :memo: Documentation
* [#3666](https://github.com/midwayjs/midway/pull/3666) docs: bull incompatibility with aliyun redis proxy mode ([@cyjake](https://github.com/cyjake))

#### :package: Dependencies
* `axios`, `consul`
  * [#3668](https://github.com/midwayjs/midway/pull/3668) chore(deps): update dependency nock to v13.5.4 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`
  * [#3670](https://github.com/midwayjs/midway/pull/3670) chore(deps): update dependency @types/express-session to v1.18.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3660](https://github.com/midwayjs/midway/pull/3660) chore(deps): update mikro-orm monorepo to v6.1.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#3664](https://github.com/midwayjs/midway/pull/3664) chore(deps): update dependency swagger-ui-dist to v5.11.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#3663](https://github.com/midwayjs/midway/pull/3663) fix(deps): update dependency @types/koa to v2.15.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3662](https://github.com/midwayjs/midway/pull/3662) fix(deps): update dependency joi to v17.12.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Chen Yangjian ([@cyjake](https://github.com/cyjake))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@odex21](https://github.com/odex21)



## v3.15.0 (2024-02-21)

#### :rocket: New Feature
* `swagger`
  * [#3659](https://github.com/midwayjs/midway/pull/3659) feat: add ApiExcludeSecurity decorator ([@czy88840616](https://github.com/czy88840616))
* `core`, `kafka`, `mqtt`, `rabbitmq`
  * [#3658](https://github.com/midwayjs/midway/pull/3658) feat: add mqtt module ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `core`
  * [#3655](https://github.com/midwayjs/midway/pull/3655) feat: support custom param decorator throw error ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `bull-board`
  * [#3645](https://github.com/midwayjs/midway/pull/3645) fix(deps): update bull monorepo to v5.14.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#3624](https://github.com/midwayjs/midway/pull/3624) fix(deps): update dependency @koa/router to v12 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3634](https://github.com/midwayjs/midway/pull/3634) fix(deps): update dependency @grpc/grpc-js to v1.10.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#3643](https://github.com/midwayjs/midway/pull/3643) chore(deps): update dependency swagger-ui-dist to v5.11.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`, `oss`
  * [#3657](https://github.com/midwayjs/midway/pull/3657) chore(deps): update dependency dotenv to v16.4.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.13 (2024-02-18)

#### :bug: Bug Fix
* `swagger`
  * [#3652](https://github.com/midwayjs/midway/pull/3652) fix: missing swagger ui render options ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.12 (2024-02-17)

#### :bug: Bug Fix
* `core`
  * [#3648](https://github.com/midwayjs/midway/pull/3648) fix: ctx get logger with custom logger ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `swagger`
  * [#3631](https://github.com/midwayjs/midway/pull/3631) chore(deps): update dependency swagger-ui-dist to v5.11.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.11 (2024-02-07)

#### :bug: Bug Fix
* `swagger`
  * [#3630](https://github.com/midwayjs/midway/pull/3630) fix: ignore custom param decorator in swagger ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `mikro`
  * [#3627](https://github.com/midwayjs/midway/pull/3627) chore(deps): update mikro-orm monorepo to v6.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#3623](https://github.com/midwayjs/midway/pull/3623) chore(deps): update dependency swagger-ui-dist to v5 ([@renovate[bot]](https://github.com/apps/renovate))
* `consul`, `core`
  * [#3622](https://github.com/midwayjs/midway/pull/3622) chore(deps): update dependency sinon to v17 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#3035](https://github.com/midwayjs/midway/pull/3035) chore(deps): update dependency egg-logger to v3 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3618](https://github.com/midwayjs/midway/pull/3618) fix(deps): update dependency joi to v17.12.1 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3614](https://github.com/midwayjs/midway/pull/3614) chore(deps): update dependency @types/node to v18.19.14 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3620](https://github.com/midwayjs/midway/pull/3620) chore(deps): update codecov/codecov-action action to v4 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`, `web-koa`
  * [#3619](https://github.com/midwayjs/midway/pull/3619) fix(deps): update dependency koa to v2.15.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.10 (2024-02-02)

#### :bug: Bug Fix
* `passport`
  * [#3617](https://github.com/midwayjs/midway/pull/3617) fix: isAuthenticated missing this ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3605](https://github.com/midwayjs/midway/pull/3605) docs: update http-proxy.md ([@jiumengs](https://github.com/jiumengs))

#### :package: Dependencies
* `cos`
  * [#3616](https://github.com/midwayjs/midway/pull/3616) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.13.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#3615](https://github.com/midwayjs/midway/pull/3615) fix(deps): update dependency ali-oss to v6.20.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`, `passport`
  * [#3604](https://github.com/midwayjs/midway/pull/3604) chore(deps): update dependency express-session to v1.18.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 旧梦 ([@jiumengs](https://github.com/jiumengs))



## v3.14.9 (2024-01-28)

#### :nail_care: Polish
* `swagger`, `ws`
  * [#3601](https://github.com/midwayjs/midway/pull/3601) feat: custom Ignore swagger endpoint ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3588](https://github.com/midwayjs/midway/pull/3588) docs: update egg.md ([@yiliang114](https://github.com/yiliang114))

#### :package: Dependencies
* `bull-board`, `bull`
  * [#3593](https://github.com/midwayjs/midway/pull/3593) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3592](https://github.com/midwayjs/midway/pull/3592) fix(deps): update dependency axios to v1.6.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`, `oss`
  * [#3589](https://github.com/midwayjs/midway/pull/3589) chore(deps): update dependency dotenv to v16.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-typeorm-adapter`, `typeorm`
  * [#3597](https://github.com/midwayjs/midway/pull/3597) chore(deps): update dependency typeorm to v0.3.20 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))
- 易良 ([@yiliang114](https://github.com/yiliang114))



## v3.14.8 (2024-01-22)

#### :bug: Bug Fix
* `swagger`
  * [#3583](https://github.com/midwayjs/midway/pull/3583) fix(swagger): Updated test cases to fix duplicate interface addresses… ([@mmdapl](https://github.com/mmdapl))

#### Committers: 1
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))



## v3.14.7 (2024-01-20)

#### :bug: Bug Fix
* `mock`
  * [#3579](https://github.com/midwayjs/midway/pull/3579) fix: app throw initialize error when invoke close method ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `ws`
  * [#3582](https://github.com/midwayjs/midway/pull/3582) feat: support heartbeat for ws ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `cos`, `oss`
  * [#3581](https://github.com/midwayjs/midway/pull/3581) chore(deps): update dependency dotenv to v16.3.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.6 (2024-01-19)

#### :bug: Bug Fix
* `swagger`
  * [#3578](https://github.com/midwayjs/midway/pull/3578) swagger-UI not show exception after fixing global configuration ([@mmdapl](https://github.com/mmdapl))

#### :package: Dependencies
* `grpc`
  * [#3576](https://github.com/midwayjs/midway/pull/3576) fix(deps): update dependency @grpc/grpc-js to v1.9.14 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- 142vip.cn ([@mmdapl](https://github.com/mmdapl))


## v3.14.5 (2024-01-18)

#### :bug: Bug Fix
* `mikro`
  * [#3574](https://github.com/midwayjs/midway/pull/3574) fix: entityManager chaos under multiple instances ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.4 (2024-01-18)

#### :bug: Bug Fix
* `cache-manager`, `captcha`, `web-koa`
  * [#3572](https://github.com/midwayjs/midway/pull/3572) fix: captcha time use seconds ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#3573](https://github.com/midwayjs/midway/pull/3573) fix: lifecycle inject fail in configuration ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.3 (2024-01-16)

#### :nail_care: Polish
* `captcha`, `mock`
  * [#3570](https://github.com/midwayjs/midway/pull/3570) feat: captcha use newest cacheManager component ([@czy88840616](https://github.com/czy88840616))
* `cache-manager-redis`, `cache-manager`, `core`, `mongoose`
  * [#3569](https://github.com/midwayjs/midway/pull/3569) feat: export health service and support mongoose health check ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.2 (2024-01-14)

#### :bug: Bug Fix
* `swagger`
  * [#3560](https://github.com/midwayjs/midway/pull/3560) fix: swagger render json not match path ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.1 (2024-01-14)

#### :bug: Bug Fix
* `swagger`
  * [#3559](https://github.com/midwayjs/midway/pull/3559) fix: swagger-ui-dist require missing ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.14.0 (2024-01-13)

#### :rocket: New Feature
* `cache-manager-redis`, `cache-manager`, `core`, `mikro`, `redis`, `swagger`
  * [#3556](https://github.com/midwayjs/midway/pull/3556) feat: Release/3.14.0 ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* Other
  * [#2741](https://github.com/midwayjs/midway/pull/2741) fix: normal return will be close stream ([@czy88840616](https://github.com/czy88840616))
* `swagger`
  * [#3555](https://github.com/midwayjs/midway/pull/3555) fix: Swagger tags are duplicate, deprecated field in ApiOperation is … ([@qingniaotonghua](https://github.com/qingniaotonghua))
* `redis`
  * [#3533](https://github.com/midwayjs/midway/pull/3533) fix(redis): Check the status of the redis client before closing redis ([@flyingcrp](https://github.com/flyingcrp))

#### :package: Dependencies
* `mikro`
  * [#3557](https://github.com/midwayjs/midway/pull/3557) chore(deps): update mikro-orm monorepo to v6.0.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3551](https://github.com/midwayjs/midway/pull/3551) fix(deps): update dependency axios to v1.6.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3535](https://github.com/midwayjs/midway/pull/3535) fix(deps): update dependency axios to v1.6.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3523](https://github.com/midwayjs/midway/pull/3523) fix(deps): update dependency axios to v1.6.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#3552](https://github.com/midwayjs/midway/pull/3552) fix(deps): update socket.io packages to v4.7.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3534](https://github.com/midwayjs/midway/pull/3534) fix(deps): update bull monorepo to v5.10.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-typeorm-adapter`, `typeorm`
  * [#3532](https://github.com/midwayjs/midway/pull/3532) chore(deps): update dependency typeorm to v0.3.19 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#3524](https://github.com/midwayjs/midway/pull/3524) fix(deps): update dependency ws to v8.16.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 4
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- flyingcrp ([@flyingcrp](https://github.com/flyingcrp))
- wangwei ([@qingniaotonghua](https://github.com/qingniaotonghua))
- 玄道 ([@xuandao](https://github.com/xuandao))



## v3.13.9 (2023-12-27)

#### :bug: Bug Fix
* `mock`
  * [#3521](https://github.com/midwayjs/midway/pull/3521) fix: wrong protocol get in local ([@czy88840616](https://github.com/czy88840616))
  * [#3519](https://github.com/midwayjs/midway/pull/3519) fix: support custom args pass through ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `leoric`
  * [#3509](https://github.com/midwayjs/midway/pull/3509) feat: inject ctx and app to leoric models ([@cyjake](https://github.com/cyjake))

#### :package: Dependencies
* `grpc`
  * [#3363](https://github.com/midwayjs/midway/pull/3363) fix(deps): update dependency @grpc/grpc-js to v1.9.13 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Chen Yangjian ([@cyjake](https://github.com/cyjake))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.8 (2023-12-22)

#### :bug: Bug Fix
* `web`
  * [#3507](https://github.com/midwayjs/midway/pull/3507) fix: wrong agent logger ([@czy88840616](https://github.com/czy88840616))
* `mock`
  * [#3512](https://github.com/midwayjs/midway/pull/3512) fix: serverless catch error when throw error ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `oss`
  * [#3515](https://github.com/midwayjs/midway/pull/3515) fix(deps): update dependency ali-oss to v6.19.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#3516](https://github.com/midwayjs/midway/pull/3516) fix(deps): update dependency bull to v4.12.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.7 (2023-12-15)

#### :package: Dependencies
* `leoric`
  * [#3501](https://github.com/midwayjs/midway/pull/3501) fix(deps): update dependency leoric to v2.12.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`
  * [#3502](https://github.com/midwayjs/midway/pull/3502) fix(deps): update dependency reflect-metadata to v0.2.1 ([@renovate[bot]](https://github.com/apps/renovate))



## v3.13.6 (2023-12-14)

#### :bug: Bug Fix
* `session`
  * [#3499](https://github.com/midwayjs/midway/pull/3499) fix: add regenerate method for session security ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3490](https://github.com/midwayjs/midway/pull/3490) docs: update validate.md ([@freedomdebug](https://github.com/freedomdebug))

#### :package: Dependencies
* `sequelize`
  * [#3493](https://github.com/midwayjs/midway/pull/3493) chore(deps): update dependency sequelize to v6.35.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3487](https://github.com/midwayjs/midway/pull/3487) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.12.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3486](https://github.com/midwayjs/midway/pull/3486) fix(deps): update bull monorepo to v5.10.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- tommy.hu ([@freedomdebug](https://github.com/freedomdebug))



## v3.13.5 (2023-12-05)

#### :nail_care: Polish
* `bootstrap`, `core`
  * [#3462](https://github.com/midwayjs/midway/pull/3462) feat: add main framework missing error ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#3478](https://github.com/midwayjs/midway/pull/3478) feat: export http client options typings ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.4 (2023-12-03)

#### :bug: Bug Fix
* `bull`, `cron`, `typeorm`, `web`
  * [#3474](https://github.com/midwayjs/midway/pull/3474) fix: remove logger v3 compatible ([@czy88840616](https://github.com/czy88840616))
* `web`
  * [#3456](https://github.com/midwayjs/midway/pull/3456) fix: web default config ([@czy88840616](https://github.com/czy88840616))
  * [#3455](https://github.com/midwayjs/midway/pull/3455) fix(web): default app logger name error  in cluster mode ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `bull-board`
  * [#3468](https://github.com/midwayjs/midway/pull/3468) fix(deps): update bull monorepo to v5.10.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#3469](https://github.com/midwayjs/midway/pull/3469) fix(deps): update dependency casbin to v5.28.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `captcha`, `security`
  * [#3452](https://github.com/midwayjs/midway/pull/3452) fix(deps): update dependency nanoid to v3.3.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#3453](https://github.com/midwayjs/midway/pull/3453) fix(deps): update dependency @opentelemetry/api to v1.7.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.3 (2023-11-23)

#### :bug: Bug Fix
* `web`
  * [#3448](https://github.com/midwayjs/midway/pull/3448) fix: parsing array of size > 20 in query (#3447) ([@ghostoy](https://github.com/ghostoy))

#### :memo: Documentation
* [#3443](https://github.com/midwayjs/midway/pull/3443) docs(jwt): Fix a bug in the documentation example where `jwtService` is not retrieved from `this`. ([@gucovip](https://github.com/gucovip))

#### :package: Dependencies
* Other
  * [#3451](https://github.com/midwayjs/midway/pull/3451) chore(deps): update dependency autocannon to v7.14.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#3441](https://github.com/midwayjs/midway/pull/3441) chore(deps): update dependency @types/koa to v2.13.12 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3434](https://github.com/midwayjs/midway/pull/3434) fix(deps): update dependency axios to v1.6.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#3435](https://github.com/midwayjs/midway/pull/3435) fix(deps): update dependency bull to v4.11.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Cong ([@gucovip](https://github.com/gucovip))
- Cong Liu ([@ghostoy](https://github.com/ghostoy))



## v3.13.2 (2023-11-14)

#### :bug: Bug Fix
* `web`
  * [#3428](https://github.com/midwayjs/midway/pull/3428) fix: core logger missing file log name ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.1 (2023-11-13)

#### :bug: Bug Fix
* `web`
  * [#3427](https://github.com/midwayjs/midway/pull/3427) fix: missing default logger dir when cluster mode ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.13.0 (2023-11-13)

#### :rocket: New Feature
* `bootstrap`, `bull`, `core`, `cron`, `faas`, `grpc`, `kafka`, `mock`, `rabbitmq`, `socketio`, `typeorm`, `web-express`, `web-koa`, `web`, `ws`
  * [#3328](https://github.com/midwayjs/midway/pull/3328) feat: support v3 logger ([@czy88840616](https://github.com/czy88840616))
* `jwt`
  * [#3261](https://github.com/midwayjs/midway/pull/3261) feat: config separated options for verify & decode and bug fixes ([@ghostoy](https://github.com/ghostoy))
* `core`, `info`
  * [#3381](https://github.com/midwayjs/midway/pull/3381) feat: add build-in healthService ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `core`
  * [#3247](https://github.com/midwayjs/midway/pull/3247) fix: sort with imports sequence before framework run ([@czy88840616](https://github.com/czy88840616))
* `static-file`
  * [#3422](https://github.com/midwayjs/midway/pull/3422) fix: static file component namespace ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `jwt`
  * [#3425](https://github.com/midwayjs/midway/pull/3425) chore: export default jwt instance ([@czy88840616](https://github.com/czy88840616))
* `http-proxy`
  * [#3391](https://github.com/midwayjs/midway/pull/3391) feat: add enable config for http-proxy ([@czy88840616](https://github.com/czy88840616))
* `faas`, `passport`, `web-koa`, `web`
  * [#3402](https://github.com/midwayjs/midway/pull/3402) fix: context.state property override when context typings merge ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3417](https://github.com/midwayjs/midway/pull/3417) docs(session): Supplementary explanation on SameSite = None ([@cyjake](https://github.com/cyjake))

#### :package: Dependencies
* `core`, `web-koa`
  * [#2975](https://github.com/midwayjs/midway/pull/2975) fix(deps): update dependency koa to v2.14.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`
  * [#3420](https://github.com/midwayjs/midway/pull/3420) fix(deps): update dependency @types/supertest to v2.0.16 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3421](https://github.com/midwayjs/midway/pull/3421) fix(deps): update dependency axios to v1.6.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#3418](https://github.com/midwayjs/midway/pull/3418) fix(deps): update dependency @types/ali-oss to v6.16.11 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#3419](https://github.com/midwayjs/midway/pull/3419) fix(deps): update dependency @types/jsonwebtoken to v9.0.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#3410](https://github.com/midwayjs/midway/pull/3410) chore(deps): update dependency @opentelemetry/sdk-node to v0.45.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3408](https://github.com/midwayjs/midway/pull/3408) chore(deps): update mikro-orm monorepo to v5.9.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Chen Yangjian ([@cyjake](https://github.com/cyjake))
- Cong Liu ([@ghostoy](https://github.com/ghostoy))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.10 (2023-11-05)

#### :package: Dependencies
* `axios`, `http-proxy`
  * [#3400](https://github.com/midwayjs/midway/pull/3400) fix(deps): update dependency axios to v1.6.0 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3398](https://github.com/midwayjs/midway/pull/3398) chore(deps): update actions/checkout action to v4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3399](https://github.com/midwayjs/midway/pull/3399) chore(deps): update actions/setup-node action to v4 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`, `bull`
  * [#3397](https://github.com/midwayjs/midway/pull/3397) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#3395](https://github.com/midwayjs/midway/pull/3395) fix(deps): update dependency ws to v8.14.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#3392](https://github.com/midwayjs/midway/pull/3392) fix(deps): update dependency casbin to v5.27.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `leoric`
  * [#3396](https://github.com/midwayjs/midway/pull/3396) fix(deps): update dependency leoric to v2.11.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `cron`
  * [#3393](https://github.com/midwayjs/midway/pull/3393) fix(deps): update dependency cron to v2.4.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#3394](https://github.com/midwayjs/midway/pull/3394) fix(deps): update dependency joi to v17.11.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#3384](https://github.com/midwayjs/midway/pull/3384) fix(deps): update dependency @types/jsonwebtoken to v9.0.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3385](https://github.com/midwayjs/midway/pull/3385) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.12.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.9 (2023-11-02)

#### :bug: Bug Fix
* `swagger`
  * [#3382](https://github.com/midwayjs/midway/pull/3382) fix(swagger): api property should support $ref ([@odex21](https://github.com/odex21))

#### :package: Dependencies
* `axios`, `consul`
  * [#3373](https://github.com/midwayjs/midway/pull/3373) chore(deps): update dependency nock to v13.3.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3375](https://github.com/midwayjs/midway/pull/3375) chore(deps): update dependency mongoose to v7.6.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#3364](https://github.com/midwayjs/midway/pull/3364) fix(deps): update dependency @types/ali-oss to v6.16.10 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@odex21](https://github.com/odex21)



## v3.12.8 (2023-10-25)

#### :bug: Bug Fix
* `web`
  * [#3351](https://github.com/midwayjs/midway/pull/3351) fix: use qs to replace querystring to solve #2162 issue ([@SmartOrange](https://github.com/SmartOrange))

#### :package: Dependencies
* `axios`, `http-proxy`
  * [#3326](https://github.com/midwayjs/midway/pull/3326) fix(deps): update dependency axios to v1.5.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`
  * [#3325](https://github.com/midwayjs/midway/pull/3325) fix(deps): update dependency @types/supertest to v2.0.15 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3327](https://github.com/midwayjs/midway/pull/3327) chore(deps): update dependency mongoose to v7.6.3 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3345](https://github.com/midwayjs/midway/pull/3345) chore(deps): update dependency @vercel/ncc to v0.38.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3332](https://github.com/midwayjs/midway/pull/3332) chore(deps): update dependency lerna to v7.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `consul`
  * [#3346](https://github.com/midwayjs/midway/pull/3346) chore(deps): update dependency nock to v13.3.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#3336](https://github.com/midwayjs/midway/pull/3336) chore(deps): update dependency @types/body-parser to v1.19.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#3330](https://github.com/midwayjs/midway/pull/3330) chore(deps): update mikro-orm monorepo to v5.8.10 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- ZhengChao ([@SmartOrange](https://github.com/SmartOrange))



## v3.12.7 (2023-10-11)

#### :bug: Bug Fix
* `swagger`
  * [#3320](https://github.com/midwayjs/midway/pull/3320) fix: swagger type missing with multi-extends ([@czy88840616](https://github.com/czy88840616))
* `passport`
  * [#3314](https://github.com/midwayjs/midway/pull/3314) fix: passport validate resolve is not executed under concurrency ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `mongoose`, `typegoose`
  * [#3308](https://github.com/midwayjs/midway/pull/3308) chore(deps): update mongoose monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3318](https://github.com/midwayjs/midway/pull/3318) chore(deps): update dependency lerna to v7.3.1 - autoclosed ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `consul`
  * [#3319](https://github.com/midwayjs/midway/pull/3319) chore(deps): update dependency nock to v13.3.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3306](https://github.com/midwayjs/midway/pull/3306) fix(deps): update dependency @grpc/grpc-js to v1.9.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#3307](https://github.com/midwayjs/midway/pull/3307) fix(deps): update dependency @types/jsonwebtoken to v9.0.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.6 (2023-10-01)

#### :memo: Documentation
* [#3297](https://github.com/midwayjs/midway/pull/3297) docs(site): update passport.md ([@Sakuraine](https://github.com/Sakuraine))

#### :package: Dependencies
* `oss`
  * [#3295](https://github.com/midwayjs/midway/pull/3295) fix(deps): update dependency @types/ali-oss to v6.16.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3294](https://github.com/midwayjs/midway/pull/3294) fix(deps): update dependency @grpc/grpc-js to v1.9.4 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3288](https://github.com/midwayjs/midway/pull/3288) chore(deps): update dependency @types/node to v18.18.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- iNE ([@Sakuraine](https://github.com/Sakuraine))



## v3.12.5 (2023-09-25)

#### :memo: Documentation
* `faas`
  * [#3235](https://github.com/midwayjs/midway/pull/3235) docs: faas upgrade ([@czy88840616](https://github.com/czy88840616))
* Other
  * [#3219](https://github.com/midwayjs/midway/pull/3219) docs: for faas change ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `bull-board`
  * [#3273](https://github.com/midwayjs/midway/pull/3273) fix(deps): update bull monorepo to v5.8.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3251](https://github.com/midwayjs/midway/pull/3251) fix(deps): update bull monorepo to v5.8.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3229](https://github.com/midwayjs/midway/pull/3229) fix(deps): update bull monorepo to v5.8.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3274](https://github.com/midwayjs/midway/pull/3274) fix(deps): update dependency @grpc/proto-loader to v0.7.10 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3252](https://github.com/midwayjs/midway/pull/3252) fix(deps): update dependency @grpc/grpc-js to v1.9.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3230](https://github.com/midwayjs/midway/pull/3230) fix(deps): update dependency @grpc/grpc-js to v1.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#3266](https://github.com/midwayjs/midway/pull/3266) chore(deps): update dependency dayjs to v1.11.10 ([@renovate[bot]](https://github.com/apps/renovate))
* `otel`
  * [#3254](https://github.com/midwayjs/midway/pull/3254) fix(deps): update dependency @opentelemetry/api to v1.6.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `oss`
  * [#3253](https://github.com/midwayjs/midway/pull/3253) fix(deps): update dependency ali-oss to v6.18.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3232](https://github.com/midwayjs/midway/pull/3232) fix(deps): update dependency ali-oss to v6.18.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#3249](https://github.com/midwayjs/midway/pull/3249) chore(deps): update dependency @types/koa-router to v7.4.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3241](https://github.com/midwayjs/midway/pull/3241) chore(deps): update dependency mongoose to v7.5.1 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3196](https://github.com/midwayjs/midway/pull/3196) fix(deps): update dependency statuses to v2.0.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3237](https://github.com/midwayjs/midway/pull/3237) fix: remove querystring module ([@czy88840616](https://github.com/czy88840616))
  * [#3084](https://github.com/midwayjs/midway/pull/3084) chore(deps): update dependency lerna to v7.2.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3234](https://github.com/midwayjs/midway/pull/3234) chore(deps): update dependency @types/node to v18.17.15 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3093](https://github.com/midwayjs/midway/pull/3093) chore(deps): update dependency @nrwl/tao to v16 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`
  * [#3236](https://github.com/midwayjs/midway/pull/3236) fix(deps): update dependency @midwayjs/event-bus to v1.9.4 ([@czy88840616](https://github.com/czy88840616))
* `leoric`
  * [#3216](https://github.com/midwayjs/midway/pull/3216) fix(deps): update dependency leoric to v2.11.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#3215](https://github.com/midwayjs/midway/pull/3215) fix(deps): update dependency jsonwebtoken to v9.0.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.4 (2023-08-29)

#### :bug: Bug Fix
* `swagger`
  * [#3209](https://github.com/midwayjs/midway/pull/3209) fix: swagger revert require ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `grpc`
  * [#3195](https://github.com/midwayjs/midway/pull/3195) fix(deps): update dependency @grpc/proto-loader to v0.7.9 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.3 (2023-08-24)

#### :bug: Bug Fix
* `core`
  * [#3191](https://github.com/midwayjs/midway/pull/3191) fix: add glob load model args ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#3181](https://github.com/midwayjs/midway/pull/3181) docs(site): __filename, __dirname under ESM ([@waitingsong](https://github.com/waitingsong))
* [#3166](https://github.com/midwayjs/midway/pull/3166) docs: add document for esm version ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* Other
  * [#3193](https://github.com/midwayjs/midway/pull/3193) chore(deps): update dependency jest to v29.6.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3183](https://github.com/midwayjs/midway/pull/3183) chore(deps): update dependency jest to v29.6.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3186](https://github.com/midwayjs/midway/pull/3186) chore(deps): update dependency @types/node to v18.17.7 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3177](https://github.com/midwayjs/midway/pull/3177) fix(deps): update dependency accepts to v1.3.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3187](https://github.com/midwayjs/midway/pull/3187) chore(deps): update dependency mongoose to v7.4.4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.12.2 (2023-08-17)

#### :bug: Bug Fix
* `core`, `web`
  * [#3175](https://github.com/midwayjs/midway/pull/3175) fix: use original method name ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#3171](https://github.com/midwayjs/midway/pull/3171) fix: load file missing file prefix under windows ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.1 (2023-08-16)

#### :bug: Bug Fix
* `core`
  * [#3168](https://github.com/midwayjs/midway/pull/3168) fix: import json not support under node v16 ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.12.0 (2023-08-14)

#### :boom: Breaking Change
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `cache`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `cross-domain`, `decorator`, `etcd`, `express-session`, `faas`, `grpc`, `http-proxy`, `i18n`, `info`, `jwt`, `kafka`, `mikro`, `mock`, `mongoose`, `oss`, `otel`, `passport`, `processAgent`, `prometheus-socket-io`, `prometheus`, `rabbitmq`, `redis`, `security`, `sequelize`, `session`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `typegoose`, `typeorm`, `upload`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#3045](https://github.com/midwayjs/midway/pull/3045) feat: support esm file loader ([@czy88840616](https://github.com/czy88840616))

#### :rocket: New Feature
* `core`, `leoric`
  * [#3087](https://github.com/midwayjs/midway/pull/3087) feat(deps): support leoric as model layer ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#2961](https://github.com/midwayjs/midway/pull/2961) feat: add getApp and getScope api ([@czy88840616](https://github.com/czy88840616))
  * [#3110](https://github.com/midwayjs/midway/pull/3110) feat: support all http methods ([@ghostoy](https://github.com/ghostoy))
* `bull-board`
  * [#3085](https://github.com/midwayjs/midway/pull/3085) feat: upgrade bull-board v5.6.0 ([@czy88840616](https://github.com/czy88840616))
* `web-koa`, `web`
  * [#3133](https://github.com/midwayjs/midway/pull/3133) feat: add ctx.forward api ([@czy88840616](https://github.com/czy88840616))
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `cache`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `cross-domain`, `decorator`, `etcd`, `express-session`, `faas`, `grpc`, `http-proxy`, `i18n`, `info`, `jwt`, `kafka`, `mikro`, `mock`, `mongoose`, `oss`, `otel`, `passport`, `processAgent`, `prometheus-socket-io`, `prometheus`, `rabbitmq`, `redis`, `security`, `sequelize`, `session`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `typegoose`, `typeorm`, `upload`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#3045](https://github.com/midwayjs/midway/pull/3045) feat: support esm file loader ([@czy88840616](https://github.com/czy88840616))

#### :wrench: Maintenance
* `core`
  * [#3164](https://github.com/midwayjs/midway/pull/3164) chore(decorator): opt code in serverlessTrigger ([@taosher](https://github.com/taosher))

#### :package: Dependencies
* `etcd`
  * [#3142](https://github.com/midwayjs/midway/pull/3142) fix(deps): update dependency etcd3 to v1.1.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`, `bull`
  * [#2993](https://github.com/midwayjs/midway/pull/2993) fix(deps): update bull monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3155](https://github.com/midwayjs/midway/pull/3155) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.12.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`
  * [#3085](https://github.com/midwayjs/midway/pull/3085) feat: upgrade bull-board v5.6.0 ([@czy88840616](https://github.com/czy88840616))
* Other
  * [#3161](https://github.com/midwayjs/midway/pull/3161) chore(deps): update dependency @types/node to v18.17.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3157](https://github.com/midwayjs/midway/pull/3157) chore(deps): update supercharge/mongodb-github-action action to v1.10.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3162](https://github.com/midwayjs/midway/pull/3162) chore(deps): update dependency mongoose to v7.4.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#3156](https://github.com/midwayjs/midway/pull/3156) fix(deps): update socket.io packages to v4.7.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 4
- Cong Liu ([@ghostoy](https://github.com/ghostoy))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Ming Ye ([@ymqy](https://github.com/ymqy))
- Taosh ([@taosher](https://github.com/taosher))



## v3.11.18 (2023-08-05)

#### :bug: Bug Fix
* `bull`, `cron`
  * [#3144](https://github.com/midwayjs/midway/pull/3144) fix: bull logger typo ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `mikro`
  * [#3114](https://github.com/midwayjs/midway/pull/3114) feat: add InjectEntityManager decorator for MikroORM and upgrade document ([@ghostoy](https://github.com/ghostoy))
* `oss`
  * [#3132](https://github.com/midwayjs/midway/pull/3132) feat: expose native OSS from package ([@ghostoy](https://github.com/ghostoy))

#### :package: Dependencies
* `cos`
  * [#3141](https://github.com/midwayjs/midway/pull/3141) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.12.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#3140](https://github.com/midwayjs/midway/pull/3140) fix(deps): update dependency casbin to v5.26.2 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3143](https://github.com/midwayjs/midway/pull/3143) chore(deps): update dependency autocannon to v7.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3139](https://github.com/midwayjs/midway/pull/3139) chore(deps): update dependency @types/node to v18.17.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Cong Liu ([@ghostoy](https://github.com/ghostoy))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.17 (2023-08-01)

#### :bug: Bug Fix
* `http-proxy`
  * [#3130](https://github.com/midwayjs/midway/pull/3130) fix(http-proxy): readableStream.pipe(res) and res.on('finish') ([@wakeGISer](https://github.com/wakeGISer))

#### Committers: 1
- Suel ([@wakeGISer](https://github.com/wakeGISer))



## v3.11.16 (2023-08-01)

#### :bug: Bug Fix
* `swagger`
  * [#3126](https://github.com/midwayjs/midway/pull/3126) fix: swagger @ApiHeader @ApiHeaders only read one header ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `swagger`
  * [#3122](https://github.com/midwayjs/midway/pull/3122) feat: add swagger operationId ([@odex21](https://github.com/odex21))
* `axios`
  * [#3127](https://github.com/midwayjs/midway/pull/3127) feat: expose more APIs from axios ([@ghostoy](https://github.com/ghostoy))

#### Committers: 3
- Cong Liu ([@ghostoy](https://github.com/ghostoy))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@odex21](https://github.com/odex21)



## v3.11.15 (2023-07-16)

#### :bug: Bug Fix
* `core`
  * [#3076](https://github.com/midwayjs/midway/pull/3076) fix: makeHttpRequest failed when post with custom headers ([@leemotive](https://github.com/leemotive))

#### :package: Dependencies
* `web-koa`
  * [#3047](https://github.com/midwayjs/midway/pull/3047) fix(deps): update dependency koa-bodyparser to v4.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3082](https://github.com/midwayjs/midway/pull/3082) fix(deps): update dependency @grpc/grpc-js to v1.8.18 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#3083](https://github.com/midwayjs/midway/pull/3083) fix(deps): update dependency @grpc/proto-loader to v0.7.8 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@leemotive](https://github.com/leemotive)



## v3.11.14 (2023-07-12)

#### :bug: Bug Fix
* `bull`
  * [#3077](https://github.com/midwayjs/midway/pull/3077) fix: bull typings in interop mode ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.13 (2023-07-10)

#### :bug: Bug Fix
* `consul`
  * [#3069](https://github.com/midwayjs/midway/pull/3069) fix(consul): Adjust the application registration logic to obtain consul instances when client does not register  ([@flyingCrp](https://github.com/flyingCrp))

#### Committers: 1
- flyingCrp ([@flyingCrp](https://github.com/flyingCrp))



## v3.11.12 (2023-07-09)

#### :memo: Documentation
* [#3058](https://github.com/midwayjs/midway/pull/3058) docs(site): update how_to_install_nodejs.md ([@waitingsong](https://github.com/waitingsong))
* [#3051](https://github.com/midwayjs/midway/pull/3051) docs: update quickstart.md ([@yemangran](https://github.com/yemangran))
* [#3034](https://github.com/midwayjs/midway/pull/3034) docs: change cron logger default fileLogName ([@sumy7](https://github.com/sumy7))

#### :package: Dependencies
* `info`, `mock`
  * [#3070](https://github.com/midwayjs/midway/pull/3070) chore: update lerna to v7 ([@czy88840616](https://github.com/czy88840616))
* `jwt`
  * [#3067](https://github.com/midwayjs/midway/pull/3067) fix(deps): update dependency jsonwebtoken to v9.0.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3046](https://github.com/midwayjs/midway/pull/3046) fix(deps): update dependency @grpc/grpc-js to v1.8.17 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#3053](https://github.com/midwayjs/midway/pull/3053) fix(deps): update socket.io packages to v4.7.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3033](https://github.com/midwayjs/midway/pull/3033) chore(deps): update mongoose monorepo ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`, `rabbitmq`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#3036](https://github.com/midwayjs/midway/pull/3036) chore(deps): update dependency fs-extra to v11 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 4
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@yemangran](https://github.com/yemangran)
- sumy ([@sumy7](https://github.com/sumy7))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.11.11 (2023-06-14)

#### :bug: Bug Fix
* `core`
  * [#3025](https://github.com/midwayjs/midway/pull/3025) fix: listener init data typings ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `code-dye`
  * [#3021](https://github.com/midwayjs/midway/pull/3021) feat(code-dye): outputType-html support show not end async call ([@sumy7](https://github.com/sumy7))

#### :memo: Documentation
* [#3024](https://github.com/midwayjs/midway/pull/3024) docs: update quick_guide.md ([@whale2002](https://github.com/whale2002))

#### :package: Dependencies
* `oss`
  * [#2974](https://github.com/midwayjs/midway/pull/2974) fix(deps): update dependency @types/ali-oss to v6.16.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#3020](https://github.com/midwayjs/midway/pull/3020) chore(deps): update dependency mongoose to v7.2.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#3018](https://github.com/midwayjs/midway/pull/3018) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.12.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#3017](https://github.com/midwayjs/midway/pull/3017) fix(deps): update dependency @grpc/grpc-js to v1.8.15 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#3006](https://github.com/midwayjs/midway/pull/3006) fix(deps): update socket.io packages to v4.6.2 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#3009](https://github.com/midwayjs/midway/pull/3009) chore(deps): update dependency madge to v6.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `web`
  * [#3008](https://github.com/midwayjs/midway/pull/3008) chore(deps): update dependency dayjs to v1.11.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#3007](https://github.com/midwayjs/midway/pull/3007) fix(deps): update dependency axios to v1.4.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- sumy ([@sumy7](https://github.com/sumy7))
- 林轩 ([@whale2002](https://github.com/whale2002))



## v3.11.10 (2023-05-31)

#### :bug: Bug Fix
* `mock`
  * [#3000](https://github.com/midwayjs/midway/pull/3000) fix: bootstrap close entry ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.9 (2023-05-30)

#### :nail_care: Polish
* `faas`, `mock`
  * [#2996](https://github.com/midwayjs/midway/pull/2996) feat: support new faas v3 entry ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2986](https://github.com/midwayjs/midway/pull/2986) docs:  fix validate.md  defaultValuePipe  variable name error ([@RainManGO](https://github.com/RainManGO))
* [#2983](https://github.com/midwayjs/midway/pull/2983) docs: update Prisma env var for downloading engines ([@Jolg42](https://github.com/Jolg42))

#### :package: Dependencies
* `grpc`
  * [#2934](https://github.com/midwayjs/midway/pull/2934) fix(deps): update dependency @grpc/proto-loader to v0.7.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `cron`
  * [#2992](https://github.com/midwayjs/midway/pull/2992) fix(deps): update dependency cron to v2.3.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Joël Galeran ([@Jolg42](https://github.com/Jolg42))
- Zy ([@RainManGO](https://github.com/RainManGO))



## v3.11.8 (2023-05-15)

#### :bug: Bug Fix
* `typeorm`
  * [#2964](https://github.com/midwayjs/midway/pull/2964) fix: model get different repository by type ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `consul`
  * [#2960](https://github.com/midwayjs/midway/pull/2960) chore(deps): update dependency @types/sinon to v10.0.15 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2959](https://github.com/midwayjs/midway/pull/2959) chore(deps): update mikro-orm monorepo to v5.7.6 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2958](https://github.com/midwayjs/midway/pull/2958) chore(deps): update dependency @types/node to v18.16.9 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.7 (2023-05-13)

#### :package: Dependencies
* `rabbitmq`
  * [#2935](https://github.com/midwayjs/midway/pull/2935) fix(deps): update dependency amqp-connection-manager to v4.1.13 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#2952](https://github.com/midwayjs/midway/pull/2952) fix(deps): update dependency joi to v17.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `redis`
  * [#2951](https://github.com/midwayjs/midway/pull/2951) fix(deps): update dependency ioredis to v5.3.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2931](https://github.com/midwayjs/midway/pull/2931) chore(deps): update mikro-orm monorepo to v5.7.4 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2932](https://github.com/midwayjs/midway/pull/2932) chore(deps): update dependency autocannon to v7.11.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.6 (2023-04-29)

#### :nail_care: Polish
* `core`
  * [#2915](https://github.com/midwayjs/midway/pull/2915) chore: support serverless function options any ([@czy88840616](https://github.com/czy88840616))
  * [#2906](https://github.com/midwayjs/midway/pull/2906) feat: add more http options ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `typegoose`
  * [#2926](https://github.com/midwayjs/midway/pull/2926) chore(deps): update dependency @typegoose/typegoose to v11.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `jwt`
  * [#2921](https://github.com/midwayjs/midway/pull/2921) fix(deps): update dependency @types/jsonwebtoken to v9.0.2 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2919](https://github.com/midwayjs/midway/pull/2919) chore(deps): update nrwl monorepo to v15.9.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.11.5 (2023-04-25)

#### :bug: Bug Fix
* `mock`
  * [#2905](https://github.com/midwayjs/midway/pull/2905) fix: createServerlessApp baseDir with undefined ([@czy88840616](https://github.com/czy88840616))
* `casbin-typeorm-adapter`, `typeorm`
  * [#2907](https://github.com/midwayjs/midway/pull/2907) fix: compatible typeorm objectId changes ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* [#2899](https://github.com/midwayjs/midway/pull/2899) feat: support app enable ssl custom certificate in dev mode ([@Steppenwolf1900](https://github.com/Steppenwolf1900))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@Steppenwolf1900](https://github.com/Steppenwolf1900)



## v3.11.4 (2023-04-18)

#### :bug: Bug Fix
* `bootstrap`, `core`, `otel`
  * [#2885](https://github.com/midwayjs/midway/pull/2885) fix:  bootstrap test case ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `cache`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `cross-domain`, `decorator`, `etcd`, `express-session`, `faas`, `grpc`, `http-proxy`, `i18n`, `info`, `jwt`, `kafka`, `mikro`, `mock`, `mongoose`, `oss`, `otel`, `passport`, `processAgent`, `prometheus-socket-io`, `prometheus`, `rabbitmq`, `redis`, `security`, `sequelize`, `session`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `typegoose`, `typeorm`, `upload`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#2887](https://github.com/midwayjs/midway/pull/2887) feat: support options for custom request decorator ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `cache`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `cross-domain`, `decorator`, `etcd`, `express-session`, `faas`, `grpc`, `http-proxy`, `i18n`, `info`, `jwt`, `kafka`, `mikro`, `mock`, `mongoose`, `oss`, `otel`, `passport`, `processAgent`, `prometheus-socket-io`, `prometheus`, `rabbitmq`, `redis`, `security`, `sequelize`, `session`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `typegoose`, `typeorm`, `upload`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#2887](https://github.com/midwayjs/midway/pull/2887) feat: support options for custom request decorator ([@czy88840616](https://github.com/czy88840616))
* Other
  * [#2867](https://github.com/midwayjs/midway/pull/2867) docs(site): update quickstart.md ([@lhx6538665](https://github.com/lhx6538665))

#### :package: Dependencies
* `grpc`
  * [#2876](https://github.com/midwayjs/midway/pull/2876) fix(deps): update dependency @grpc/grpc-js to v1.8.14 ([@renovate[bot]](https://github.com/apps/renovate))
* `rabbitmq`
  * [#2877](https://github.com/midwayjs/midway/pull/2877) fix(deps): update dependency amqp-connection-manager to v4.1.12 ([@renovate[bot]](https://github.com/apps/renovate))
* `async-hooks-context-manager`, `axios`, `bootstrap`, `bull-board`, `bull`, `cache`, `captcha`, `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`, `code-dye`, `consul`, `core`, `cos`, `cron`, `cross-domain`, `decorator`, `etcd`, `express-session`, `faas`, `grpc`, `http-proxy`, `i18n`, `info`, `jwt`, `kafka`, `mikro`, `mock`, `mongoose`, `oss`, `otel`, `passport`, `processAgent`, `prometheus-socket-io`, `prometheus`, `rabbitmq`, `redis`, `security`, `sequelize`, `session`, `socketio`, `static-file`, `swagger`, `tablestore`, `tags`, `typegoose`, `typeorm`, `upload`, `validate`, `view-ejs`, `view-nunjucks`, `view`, `web-express`, `web-koa`, `web`, `ws`
  * [#2887](https://github.com/midwayjs/midway/pull/2887) feat: support options for custom request decorator ([@czy88840616](https://github.com/czy88840616))
* `sequelize`
  * [#2869](https://github.com/midwayjs/midway/pull/2869) chore(deps): update dependency sequelize to v6.31.0 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2866](https://github.com/midwayjs/midway/pull/2866) chore(deps): update dependency typedoc to v0.24.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2882](https://github.com/midwayjs/midway/pull/2882) chore(deps): update dependency @typegoose/typegoose to v11.0.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 刘宏玺 ([@lhx6538665](https://github.com/lhx6538665))



## v3.11.3 (2023-04-03)

#### :bug: Bug Fix
* `mock`
  * [#2857](https://github.com/midwayjs/midway/pull/2857) fix: change for support worker ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2858](https://github.com/midwayjs/midway/pull/2858) docs(site): update awesome_midway.md ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#2859](https://github.com/midwayjs/midway/pull/2859) fix(deps): update dependency casbin to v5.26.1  ([@czy88840616](https://github.com/czy88840616))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.11.2 (2023-04-03)

#### :bug: Bug Fix
* `socketio`
  * [#2854](https://github.com/midwayjs/midway/pull/2854) fix: fixed duplicated OnWSConnection ([@ghostoy](https://github.com/ghostoy))

#### :package: Dependencies
* `mongoose`, `typegoose`
  * [#2856](https://github.com/midwayjs/midway/pull/2856) chore(deps): update mongoose monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Cong Liu ([@ghostoy](https://github.com/ghostoy))



## v3.11.1 (2023-04-02)

#### :bug: Bug Fix
* `socketio`
  * [#2850](https://github.com/midwayjs/midway/pull/2850) fix: fixed missing initial messages (#2847) ([@ghostoy](https://github.com/ghostoy))

#### :nail_care: Polish
* `bull`
  * [#2842](https://github.com/midwayjs/midway/pull/2842) feat: add queueOptions to the @Processor decorator ([@developeryvan](https://github.com/developeryvan))
* `core`
  * [#2841](https://github.com/midwayjs/midway/pull/2841) chore(core): add boolean property JoinPoint['proceedIsAsyncFunction'] ([@waitingsong](https://github.com/waitingsong))

#### :memo: Documentation
* Other
  * [#2840](https://github.com/midwayjs/midway/pull/2840) docs: update kafka disconnect ([@wangyi12358](https://github.com/wangyi12358))
* `otel`
  * [#2826](https://github.com/midwayjs/midway/pull/2826) chore(otel): bump and clean dependencies ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* `otel`
  * [#2848](https://github.com/midwayjs/midway/pull/2848) chore(deps): update dependency @opentelemetry/sdk-node to ^0.37.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2826](https://github.com/midwayjs/midway/pull/2826) chore(otel): bump and clean dependencies ([@waitingsong](https://github.com/waitingsong))
* `swagger`
  * [#2844](https://github.com/midwayjs/midway/pull/2844) chore(deps): update dependency swagger-ui-dist to v4.18.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 6
- Cong Liu ([@ghostoy](https://github.com/ghostoy))
- DeveloperYvan ([@developeryvan](https://github.com/developeryvan))
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Thirteen ([@wangyi12358](https://github.com/wangyi12358))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.11.0 (2023-03-27)

#### :rocket: New Feature
* `tags`, `upload`
  * [#2740](https://github.com/midwayjs/midway/pull/2740) feat: tags component ([@echosoar](https://github.com/echosoar))
* `cron`
  * [#2771](https://github.com/midwayjs/midway/pull/2771) feat: add cron component ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#2805](https://github.com/midwayjs/midway/pull/2805) feat: support match and ignore property with array ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `cron`
  * [#2831](https://github.com/midwayjs/midway/pull/2831) fix(deps): update dependency cron to v2.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `validate`
  * [#2832](https://github.com/midwayjs/midway/pull/2832) fix(deps): update dependency joi to v17.9.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-koa`
  * [#2833](https://github.com/midwayjs/midway/pull/2833) fix(deps): update dependency koa-bodyparser to v4.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `captcha`, `security`
  * [#2828](https://github.com/midwayjs/midway/pull/2828) fix(deps): update dependency nanoid to v3.3.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `tablestore`
  * [#2829](https://github.com/midwayjs/midway/pull/2829) fix(deps): update dependency tablestore to v5.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull-board`, `view-ejs`
  * [#2827](https://github.com/midwayjs/midway/pull/2827) fix(deps): update dependency ejs to v3.1.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#2830](https://github.com/midwayjs/midway/pull/2830) fix(deps): update dependency ws to v8.13.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2823](https://github.com/midwayjs/midway/pull/2823) fix(deps): update dependency @grpc/grpc-js to v1.8.13 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2824](https://github.com/midwayjs/midway/pull/2824) fix(deps): update dependency @grpc/proto-loader to v0.7.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `sequelize`
  * [#2819](https://github.com/midwayjs/midway/pull/2819) chore(deps): update dependency sequelize to v6.30.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `swagger`
  * [#2820](https://github.com/midwayjs/midway/pull/2820) chore(deps): update dependency swagger-ui-dist to v4.18.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2817](https://github.com/midwayjs/midway/pull/2817) chore(deps): update mikro-orm monorepo to v5.6.15 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2818](https://github.com/midwayjs/midway/pull/2818) chore(deps): update dependency @types/jest to v29.5.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2816](https://github.com/midwayjs/midway/pull/2816) chore(deps): update dependency typedoc to v0.23.28 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2799](https://github.com/midwayjs/midway/pull/2799) chore(deps): update dependency @types/node to v18.15.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2810](https://github.com/midwayjs/midway/pull/2810) chore(deps): update dependency @typegoose/typegoose to v10.3.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-typeorm-adapter`, `mikro`, `sequelize`, `typeorm`
  * [#2815](https://github.com/midwayjs/midway/pull/2815) chore(deps): update dependency sqlite3 to v5.1.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`
  * [#2811](https://github.com/midwayjs/midway/pull/2811) chore(deps): update dependency @types/express-session to v1.17.7 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2812](https://github.com/midwayjs/midway/pull/2812) chore(deps): update dependency mongoose to v6.10.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`
  * [#2813](https://github.com/midwayjs/midway/pull/2813) chore(deps): update dependency sinon to v15.0.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.10.16 (2023-03-21)

#### :bug: Bug Fix
* `web`
  * [#2807](https://github.com/midwayjs/midway/pull/2807) fix: egg missing export decorator ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `typegoose`
  * [#2798](https://github.com/midwayjs/midway/pull/2798) chore(deps): update dependency @typegoose/typegoose to v10.3.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-typeorm-adapter`, `mikro`, `sequelize`, `typeorm`
  * [#2795](https://github.com/midwayjs/midway/pull/2795) chore(deps): update dependency sqlite3 to v5.1.5 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2801](https://github.com/midwayjs/midway/pull/2801) chore(deps): update dependency mongoose to v6.10.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `sequelize`
  * [#2802](https://github.com/midwayjs/midway/pull/2802) chore(deps): update dependency sequelize to v6.29.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- Umuoy ([@umuoy1](https://github.com/umuoy1))



## v3.10.15 (2023-03-10)

#### :bug: Bug Fix
* `core`
  * [#2764](https://github.com/midwayjs/midway/pull/2764) fix: mock service inited will be before lifecycle ([@czy88840616](https://github.com/czy88840616))
  * [#2765](https://github.com/midwayjs/midway/pull/2765) fix: content-type set by headers options ([@czy88840616](https://github.com/czy88840616))
  * [#2793](https://github.com/midwayjs/midway/pull/2793) fix: wrong handler name with decorator ([@czy88840616](https://github.com/czy88840616))
* `faas`
  * [#2761](https://github.com/midwayjs/midway/pull/2761) fix: faas content length ([@echosoar](https://github.com/echosoar))

#### :memo: Documentation
* [#2773](https://github.com/midwayjs/midway/pull/2773) docs(site): update validate.md ([@waitingsong](https://github.com/waitingsong))

#### :package: Dependencies
* Other
  * [#2791](https://github.com/midwayjs/midway/pull/2791) chore(deps): update dependency @types/node to v18.15.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2792](https://github.com/midwayjs/midway/pull/2792) chore(deps): update dependency jest to v29.5.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2785](https://github.com/midwayjs/midway/pull/2785) chore(deps): update dependency lerna to v6.5.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2762](https://github.com/midwayjs/midway/pull/2762) chore(deps): update dependency @types/node to v18.14.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2778](https://github.com/midwayjs/midway/pull/2778) chore(deps): update dependency typedoc to v0.23.26 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2772](https://github.com/midwayjs/midway/pull/2772) fix(deps): update dependency cron to v2 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2789](https://github.com/midwayjs/midway/pull/2789) chore(deps): update dependency mongoose to v6.10.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2786](https://github.com/midwayjs/midway/pull/2786) chore(deps): update dependency mongoose to v6.10.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `sequelize`
  * [#2790](https://github.com/midwayjs/midway/pull/2790) chore(deps): update dependency sequelize to v6.29.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2760](https://github.com/midwayjs/midway/pull/2760) chore(deps): update dependency sequelize to v6.29.0 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2767](https://github.com/midwayjs/midway/pull/2767) fix(deps): update dependency @grpc/grpc-js to v1.8.12 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2763](https://github.com/midwayjs/midway/pull/2763) fix(deps): update dependency @grpc/grpc-js to v1.8.10 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2784](https://github.com/midwayjs/midway/pull/2784) chore(deps): update dependency @typegoose/typegoose to v10.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2779](https://github.com/midwayjs/midway/pull/2779) chore(deps): update mikro-orm monorepo to v5.6.13 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`, `mock`, `upload`
  * [#2781](https://github.com/midwayjs/midway/pull/2781) fix(deps): update dependency raw-body to v2.5.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#2783](https://github.com/midwayjs/midway/pull/2783) fix(deps): update socket.io packages to v4.6.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#2782](https://github.com/midwayjs/midway/pull/2782) fix(deps): update dependency ws to v8.12.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `kafka`, `mock`
  * [#2777](https://github.com/midwayjs/midway/pull/2777) chore(deps): update dependency kafkajs to v2.2.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `rabbitmq`
  * [#2768](https://github.com/midwayjs/midway/pull/2768) fix(deps): update dependency amqp-connection-manager to v4.1.11 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#2769](https://github.com/midwayjs/midway/pull/2769) fix(deps): update dependency axios to v1.3.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#2770](https://github.com/midwayjs/midway/pull/2770) fix(deps): update dependency body-parser to v1.20.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.10.14 (2023-02-23)

#### :bug: Bug Fix
* [#2759](https://github.com/midwayjs/midway/pull/2759) fix: set streaming property first ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.13 (2023-02-22)

#### :bug: Bug Fix
* Other
  * [#2758](https://github.com/midwayjs/midway/pull/2758) chore: add context.streaming api for streaming api ([@czy88840616](https://github.com/czy88840616))
* `mock`
  * [#2757](https://github.com/midwayjs/midway/pull/2757) fix: mock buffer base64 response ([@echosoar](https://github.com/echosoar))

#### Committers: 2
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.12 (2023-02-20)

#### :bug: Bug Fix
* `cross-domain`, `faas`
  * [#2739](https://github.com/midwayjs/midway/pull/2739) fix: cross domain with options request ([@echosoar](https://github.com/echosoar))
* `http-proxy`
  * [#2748](https://github.com/midwayjs/midway/pull/2748) fix: wrong proxy namespace ([@czy88840616](https://github.com/czy88840616))
* `validate`
  * [#2747](https://github.com/midwayjs/midway/pull/2747) fix: joi version for node 12/14 ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `axios`, `http-proxy`
  * [#2749](https://github.com/midwayjs/midway/pull/2749) fix(deps): update dependency axios to v1.3.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2754](https://github.com/midwayjs/midway/pull/2754) fix(deps): update dependency @grpc/proto-loader to v0.7.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2753](https://github.com/midwayjs/midway/pull/2753) fix(deps): update dependency @grpc/grpc-js to v1.8.9 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2752](https://github.com/midwayjs/midway/pull/2752) chore(deps): update mikro-orm monorepo to v5.6.11 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2751](https://github.com/midwayjs/midway/pull/2751) chore(deps): update dependency typedoc to v0.23.25 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2711](https://github.com/midwayjs/midway/pull/2711) chore(deps): update dependency @types/node to v18.14.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2744](https://github.com/midwayjs/midway/pull/2744) chore(deps): update dependency jest to v29.4.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `redis`
  * [#2750](https://github.com/midwayjs/midway/pull/2750) fix(deps): update dependency ioredis to v5.3.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2745](https://github.com/midwayjs/midway/pull/2745) chore(deps): update dependency mongoose to v6.9.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `express-session`
  * [#2743](https://github.com/midwayjs/midway/pull/2743) chore(deps): update dependency @types/express-session to v1.17.6 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.11 (2023-02-16)

#### :nail_care: Polish
* `faas`, `http-proxy`, `mock`
  * [#2738](https://github.com/midwayjs/midway/pull/2738) feat: support stream response ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.10 (2023-02-14)

#### :bug: Bug Fix
* `core`, `web`
  * [#2734](https://github.com/midwayjs/midway/pull/2734) fix: function meta name ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.9 (2023-02-13)

#### :bug: Bug Fix
* `bull`
  * [#2720](https://github.com/midwayjs/midway/pull/2720) fix: bull add default job options in decorator will be overriding args ([@czy88840616](https://github.com/czy88840616))
* `core`, `faas`
  * [#2732](https://github.com/midwayjs/midway/pull/2732) fix: func name set ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `code-dye`
  * [#2728](https://github.com/midwayjs/midway/pull/2728) chore: update codedye ([@echosoar](https://github.com/echosoar))
* `core`
  * [#2733](https://github.com/midwayjs/midway/pull/2733) chore: add generalization type ([@czy88840616](https://github.com/czy88840616))
* `mock`
  * [#2719](https://github.com/midwayjs/midway/pull/2719) fix: node 12 fs promise ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2731](https://github.com/midwayjs/midway/pull/2731) docs: fix pipe valid ([@ddzyan](https://github.com/ddzyan))
* [#2727](https://github.com/midwayjs/midway/pull/2727) doc:custom_error.md fix import ([@4xii](https://github.com/4xii))

#### :package: Dependencies
* `mikro`
  * [#2730](https://github.com/midwayjs/midway/pull/2730) chore(deps): update mikro-orm monorepo to v5.6.9 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2729](https://github.com/midwayjs/midway/pull/2729) chore(deps): update supercharge/mongodb-github-action action to v1.9.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2721](https://github.com/midwayjs/midway/pull/2721) chore(deps): update dependency jest to v29.4.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-typeorm-adapter`, `typeorm`
  * [#2723](https://github.com/midwayjs/midway/pull/2723) chore(deps): update dependency typeorm to v0.3.12 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2724](https://github.com/midwayjs/midway/pull/2724) fix(deps): update dependency @grpc/grpc-js to v1.8.8 ([@renovate[bot]](https://github.com/apps/renovate))
* `bull`
  * [#2725](https://github.com/midwayjs/midway/pull/2725) fix(deps): update dependency bull to v4.10.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#2726](https://github.com/midwayjs/midway/pull/2726) fix(deps): update socket.io packages to v4.6.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2722](https://github.com/midwayjs/midway/pull/2722) chore(deps): update dependency mongoose to v6.9.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 4
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 世新 ([@4xii](https://github.com/4xii))
- 孺子牛 ([@ddzyan](https://github.com/ddzyan))



## v3.10.8 (2023-02-09)

#### :nail_care: Polish
* `cross-domain`
  * [#2713](https://github.com/midwayjs/midway/pull/2713) fix: add ctx.jsonp for  cross-domain ([@echosoar](https://github.com/echosoar))
* `faas`
  * [#2717](https://github.com/midwayjs/midway/pull/2717) feat: support buffer response ([@czy88840616](https://github.com/czy88840616))

#### Committers: 2
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.7 (2023-02-07)

#### :bug: Bug Fix
* `validate`
  * [#2714](https://github.com/midwayjs/midway/pull/2714) fix(validate): export ParsePipe from pipe.ts ([@savoygu](https://github.com/savoygu))

#### :nail_care: Polish
* `core`, `decorator`, `faas`, `validate`
  * [#2708](https://github.com/midwayjs/midway/pull/2708) feat: add web param optional ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* Other
  * [#2715](https://github.com/midwayjs/midway/pull/2715) docs(site): update validate.md ([@savoygu](https://github.com/savoygu))
* `bull`
  * [#2712](https://github.com/midwayjs/midway/pull/2712) fix(deps): update dependency bull to v4.10.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2709](https://github.com/midwayjs/midway/pull/2709) chore(deps): update dependency @typegoose/typegoose to v10.1.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#2710](https://github.com/midwayjs/midway/pull/2710) chore(deps): update dependency @types/express to v4.17.17 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#2705](https://github.com/midwayjs/midway/pull/2705) fix(deps): update dependency axios to v1.3.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#2706](https://github.com/midwayjs/midway/pull/2706) fix(deps): update dependency casbin to v5.23.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Frank Zhao ([@frank-zsy](https://github.com/frank-zsy))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- huel129 ([@savoygu](https://github.com/savoygu))



## v3.10.6 (2023-02-02)

#### :bug: Bug Fix
* `core`
  * [#2697](https://github.com/midwayjs/midway/pull/2697) fix: RouterService match router method all ([@luckyscript](https://github.com/luckyscript))
* `core`, `validate`
  * [#2703](https://github.com/midwayjs/midway/pull/2703) fix: @valid with other decorator ([@czy88840616](https://github.com/czy88840616))
* `typeorm`
  * [#2704](https://github.com/midwayjs/midway/pull/2704) fix: typeorm logging property ([@czy88840616](https://github.com/czy88840616))
* `cross-domain`
  * [#2699](https://github.com/midwayjs/midway/pull/2699) fix: repair the impact of JSONP on normal requests(#2692) ([@abnerCrack](https://github.com/abnerCrack))

#### :nail_care: Polish
* `otel`
  * [#2701](https://github.com/midwayjs/midway/pull/2701) feat: add ctx.traceId ([@czy88840616](https://github.com/czy88840616))

#### Committers: 3
- C ([@abnerCrack](https://github.com/abnerCrack))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 下雨就像弹钢琴 ([@luckyscript](https://github.com/luckyscript))



## v3.10.5 (2023-01-31)

#### :bug: Bug Fix
* `core`, `decorator`, `validate`
  * [#2695](https://github.com/midwayjs/midway/pull/2695) fix: web param set wrong pipe position ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.4 (2023-01-31)

#### :bug: Bug Fix
* `core`, `mock`
  * [#2694](https://github.com/midwayjs/midway/pull/2694) fix: missing pipes args in web param ([@czy88840616](https://github.com/czy88840616))

#### :wrench: Maintenance
* `core`
  * [#2693](https://github.com/midwayjs/midway/pull/2693) chore(core): add type DecoratorMetaData for custom decorator ([@waitingsong](https://github.com/waitingsong))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.10.3 (2023-01-31)

#### :bug: Bug Fix
* `core`
  * [#2691](https://github.com/midwayjs/midway/pull/2691) fix(core): variable options may undefined when use custom decorator ([@waitingsong](https://github.com/waitingsong))

#### Committers: 1
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.10.2 (2023-01-31)

#### :bug: Bug Fix
* `typeorm`
  * [#2690](https://github.com/midwayjs/midway/pull/2690) fix: create default logger when typeorm logger set undefined ([@czy88840616](https://github.com/czy88840616))
* `http-proxy`, `upload`
  * [#2563](https://github.com/midwayjs/midway/pull/2563) fix: remove content-length when proxy stream ([@echosoar](https://github.com/echosoar))

#### :package: Dependencies
* [#2622](https://github.com/midwayjs/midway/pull/2622) chore(deps): update dependency typescript to v4.9.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.1 (2023-01-31)

#### :bug: Bug Fix
* `core`
  * [#2689](https://github.com/midwayjs/midway/pull/2689) fix: logger async and egg will be start error with cluster mode ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.10.0 (2023-01-30)

#### :boom: Breaking Change
* `consul`, `core`
  * [#2688](https://github.com/midwayjs/midway/pull/2688) fix(deps): update dependency consul to v1 ([@czy88840616](https://github.com/czy88840616))
* `bull`, `core`, `decorator`, `faas`, `info`, `validate`, `web-express`, `web-koa`, `web`
  * [#2656](https://github.com/midwayjs/midway/pull/2656) feat: add pipes for parameter decorator ([@czy88840616](https://github.com/czy88840616))
* `jwt`
  * [#2595](https://github.com/midwayjs/midway/pull/2595) fix(deps): update dependency jsonwebtoken to v9 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2642](https://github.com/midwayjs/midway/pull/2642) chore(deps): update dependency @typegoose/typegoose to v10 ([@renovate[bot]](https://github.com/apps/renovate))

#### :rocket: New Feature
* `core`
  * [#2687](https://github.com/midwayjs/midway/pull/2687) feat: add simulator ([@czy88840616](https://github.com/czy88840616))
  * [#2654](https://github.com/midwayjs/midway/pull/2654) feat: add @Singleton and get namespace api ([@czy88840616](https://github.com/czy88840616))
* `core`, `typeorm`
  * [#2591](https://github.com/midwayjs/midway/pull/2591) feat: add typeorm logger and logger lazy create ([@czy88840616](https://github.com/czy88840616))
* `kafka`, `mock`
  * [#2679](https://github.com/midwayjs/midway/pull/2679) feat: support app enable ssl in dev mode ([@czy88840616](https://github.com/czy88840616))
* `bull`, `core`, `decorator`, `faas`, `info`, `validate`, `web-express`, `web-koa`, `web`
  * [#2656](https://github.com/midwayjs/midway/pull/2656) feat: add pipes for parameter decorator ([@czy88840616](https://github.com/czy88840616))
* `faas`, `mock`
  * [#2672](https://github.com/midwayjs/midway/pull/2672) feat: add custom response args ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `core`
  * [#2626](https://github.com/midwayjs/midway/pull/2626) fix: run stop lifecycle with reverse ([@czy88840616](https://github.com/czy88840616))
* `bootstrap`
  * [#2644](https://github.com/midwayjs/midway/pull/2644) fix: sticky post ([@echosoar](https://github.com/echosoar))
* `swagger`, `validate`
  * [#2640](https://github.com/midwayjs/midway/pull/2640) fix: swagger one of with type ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `core`
  * [#2646](https://github.com/midwayjs/midway/pull/2646) chore: change level for default logger level ([@czy88840616](https://github.com/czy88840616))
* `core`, `faas`, `mock`
  * [#2606](https://github.com/midwayjs/midway/pull/2606) feat: add ssr and custom trigger ([@czy88840616](https://github.com/czy88840616))
* `mock`
  * [#2643](https://github.com/midwayjs/midway/pull/2643) fix: output error when running test in jest environment ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2653](https://github.com/midwayjs/midway/pull/2653) docs(site): update guard.md ([@Sakuraine](https://github.com/Sakuraine))

#### :package: Dependencies
* `consul`, `core`
  * [#2688](https://github.com/midwayjs/midway/pull/2688) fix(deps): update dependency consul to v1 ([@czy88840616](https://github.com/czy88840616))
* `jwt`
  * [#2685](https://github.com/midwayjs/midway/pull/2685) fix(deps): update dependency @types/jsonwebtoken to v9 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2595](https://github.com/midwayjs/midway/pull/2595) fix(deps): update dependency jsonwebtoken to v9 [security] ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2683](https://github.com/midwayjs/midway/pull/2683) chore(deps): update dependency madge to v6 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2680](https://github.com/midwayjs/midway/pull/2680) chore(deps): update jest monorepo ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2678](https://github.com/midwayjs/midway/pull/2678) chore(deps): update dependency madge to v5.0.2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2673](https://github.com/midwayjs/midway/pull/2673) chore(deps): update dependency @vercel/ncc to v0.36.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2662](https://github.com/midwayjs/midway/pull/2662) chore(deps): update dependency ts-jest to v29.0.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2659](https://github.com/midwayjs/midway/pull/2659) chore(deps): update dependency @types/jest to v29.2.6 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2660](https://github.com/midwayjs/midway/pull/2660) chore(deps): update dependency lerna to v6.4.1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2649](https://github.com/midwayjs/midway/pull/2649) chore(deps): update dependency @midwayjs/jest-environment-service-worker to v0.1.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2647](https://github.com/midwayjs/midway/pull/2647) chore(deps): update dependency typedoc to v0.23.24 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2650](https://github.com/midwayjs/midway/pull/2650) chore(deps): update dependency @midwayjs/jsdom-service-worker to v0.1.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2639](https://github.com/midwayjs/midway/pull/2639) chore(deps): update dependency @types/node to v18 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2641](https://github.com/midwayjs/midway/pull/2641) chore(deps): update dependency lerna to v6.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`
  * [#2684](https://github.com/midwayjs/midway/pull/2684) chore(deps): update dependency sinon to v15 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `redis`
  * [#2681](https://github.com/midwayjs/midway/pull/2681) fix(deps): update dependency ioredis to v5.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2667](https://github.com/midwayjs/midway/pull/2667) fix(deps): update dependency ioredis to v5.2.5 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2676](https://github.com/midwayjs/midway/pull/2676) chore(deps): update dependency @typegoose/typegoose to v10.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2642](https://github.com/midwayjs/midway/pull/2642) chore(deps): update dependency @typegoose/typegoose to v10 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#2675](https://github.com/midwayjs/midway/pull/2675) fix(deps): update dependency axios to v1.2.6 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2665](https://github.com/midwayjs/midway/pull/2665) fix(deps): update dependency axios to v1.2.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2677](https://github.com/midwayjs/midway/pull/2677) chore(deps): update dependency mongoose to v6.9.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2661](https://github.com/midwayjs/midway/pull/2661) chore(deps): update dependency mongoose to v6.8.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2652](https://github.com/midwayjs/midway/pull/2652) chore(deps): update dependency mongoose to v6.8.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `web-express`
  * [#2670](https://github.com/midwayjs/midway/pull/2670) chore(deps): update dependency @types/express to v4.17.16 ([@renovate[bot]](https://github.com/apps/renovate))
* `mikro`
  * [#2671](https://github.com/midwayjs/midway/pull/2671) chore(deps): update mikro-orm monorepo to v5.6.8 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2663](https://github.com/midwayjs/midway/pull/2663) chore(deps): update mikro-orm monorepo to v5.6.7 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2648](https://github.com/midwayjs/midway/pull/2648) chore(deps): update mikro-orm monorepo to v5.6.6 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2674](https://github.com/midwayjs/midway/pull/2674) fix(deps): update dependency @grpc/grpc-js to v1.8.7 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2664](https://github.com/midwayjs/midway/pull/2664) fix(deps): update dependency @grpc/grpc-js to v1.8.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `consul`
  * [#2668](https://github.com/midwayjs/midway/pull/2668) chore(deps): update dependency nock to v13.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#2669](https://github.com/midwayjs/midway/pull/2669) fix(deps): update dependency ws to v8.12.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#2666](https://github.com/midwayjs/midway/pull/2666) fix(deps): update dependency casbin to v5.21.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `passport`
  * [#2651](https://github.com/midwayjs/midway/pull/2651) chore(deps): update dependency @types/passport-local to v1.0.35 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 3
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- iNE ([@Sakuraine](https://github.com/Sakuraine))



## v3.9.9 (2023-01-05)

#### :bug: Bug Fix
* `web-express`, `web-koa`, `web`
  * [#2629](https://github.com/midwayjs/midway/pull/2629) fix: use ctx.traceId with otel ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `mikro`
  * [#2638](https://github.com/midwayjs/midway/pull/2638) chore(deps): update mikro-orm monorepo to v5.6.4 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2613](https://github.com/midwayjs/midway/pull/2613) chore(deps): update mikro-orm monorepo to v5.6.3 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#2633](https://github.com/midwayjs/midway/pull/2633) chore(deps): update dependency @types/jest to v29.2.5 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2616](https://github.com/midwayjs/midway/pull/2616) chore(deps): update dependency @types/node to v16.18.11 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2619](https://github.com/midwayjs/midway/pull/2619) chore(deps): update dependency lerna to v6.3.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#2617](https://github.com/midwayjs/midway/pull/2617) chore(deps): update dependency @vercel/ncc to v0.36.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`
  * [#2635](https://github.com/midwayjs/midway/pull/2635) fix(deps): update dependency @grpc/grpc-js to v1.8.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `core`, `web-koa`
  * [#2636](https://github.com/midwayjs/midway/pull/2636) fix(deps): update dependency koa to v2.14.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `rabbitmq`
  * [#2634](https://github.com/midwayjs/midway/pull/2634) fix(deps): update dependency amqp-connection-manager to v4.1.10 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `ws`
  * [#2637](https://github.com/midwayjs/midway/pull/2637) fix(deps): update dependency ws to v8.11.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#2632](https://github.com/midwayjs/midway/pull/2632) fix(deps): update dependency casbin to v5.20.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `grpc`, `mock`, `rabbitmq`, `socketio`, `web-express`, `web-koa`, `web`, `ws`
  * [#2618](https://github.com/midwayjs/midway/pull/2618) chore(deps): update dependency fs-extra to v10.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`, `rabbitmq`
  * [#2615](https://github.com/midwayjs/midway/pull/2615) chore(deps): update dependency @types/amqplib to v0.10.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `bootstrap`, `mock`, `socketio`
  * [#2612](https://github.com/midwayjs/midway/pull/2612) fix(deps): update socket.io packages to v4.5.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `mongoose`, `typegoose`
  * [#2620](https://github.com/midwayjs/midway/pull/2620) chore(deps): update dependency mongoose to v6.8.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `sequelize`
  * [#2621](https://github.com/midwayjs/midway/pull/2621) chore(deps): update dependency sequelize to v6.28.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `typegoose`
  * [#2614](https://github.com/midwayjs/midway/pull/2614) chore(deps): update dependency @typegoose/typegoose to v9.13.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `mock`
  * [#2610](https://github.com/midwayjs/midway/pull/2610) fix(deps): update dependency supertest to v6.3.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `tablestore`
  * [#2611](https://github.com/midwayjs/midway/pull/2611) fix(deps): update dependency tablestore to v5.3.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `cos`
  * [#2609](https://github.com/midwayjs/midway/pull/2609) fix(deps): update dependency cos-nodejs-sdk-v5 to v2.11.19 ([@renovate[bot]](https://github.com/apps/renovate))
* `passport`
  * [#2608](https://github.com/midwayjs/midway/pull/2608) chore(deps): update dependency passport-jwt to v4.0.1 ([@renovate[bot]](https://github.com/apps/renovate))
* `axios`, `http-proxy`
  * [#2604](https://github.com/midwayjs/midway/pull/2604) fix(deps): update dependency axios to v1.2.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))




## v3.9.8 (2022-12-27)

#### :bug: Bug Fix
* `swagger`
  * [#2602](https://github.com/midwayjs/midway/pull/2602) fix: use lazy function to provide type ([@czy88840616](https://github.com/czy88840616))

#### :package: Dependencies
* `bull`
  * [#2598](https://github.com/midwayjs/midway/pull/2598) fix(deps): update dependency bull to v4.10.2 ([@renovate[bot]](https://github.com/apps/renovate))
* `cache`
  * [#2597](https://github.com/midwayjs/midway/pull/2597) fix(deps): update dependency @types/cache-manager to v3.4.3 ([@renovate[bot]](https://github.com/apps/renovate))
* `casbin-redis-adapter`, `casbin-typeorm-adapter`, `casbin`
  * [#2599](https://github.com/midwayjs/midway/pull/2599) fix(deps): update dependency casbin to v5.19.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.7 (2022-12-22)

#### :bug: Bug Fix
* `bull`
  * [#2594](https://github.com/midwayjs/midway/pull/2594) fix: bull read new config after config load ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.6 (2022-12-20)

#### :bug: Bug Fix
* `cross-domain`, `http-proxy`, `static-file`
  * [#2592](https://github.com/midwayjs/midway/pull/2592) fix: static with cors ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.5 (2022-12-20)

#### :bug: Bug Fix
* `typeorm`
  * [#2590](https://github.com/midwayjs/midway/pull/2590) fix: ignore migrate options for typeorm running ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.4 (2022-12-20)

#### :bug: Bug Fix
* `typeorm`
  * [#2588](https://github.com/midwayjs/midway/pull/2588) fix: add ts-node run in migrate ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.3 (2022-12-19)

#### :bug: Bug Fix
* `swagger`
  * [#2547](https://github.com/midwayjs/midway/pull/2547) fix: swagger query object ([@lhcn](https://github.com/lhcn))

#### :nail_care: Polish
* `axios`, `typeorm`
  * [#2587](https://github.com/midwayjs/midway/pull/2587) feat: support typeorm migrate cli ([@czy88840616](https://github.com/czy88840616))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- imlh.cn ([@lhcn](https://github.com/lhcn))



## v3.9.2 (2022-12-15)

#### :bug: Bug Fix
* `bull`
  * [#2582](https://github.com/midwayjs/midway/pull/2582) fix: merge queue options and job options ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.1 (2022-12-14)

#### :nail_care: Polish
* `bootstrap`
  * [#2580](https://github.com/midwayjs/midway/pull/2580) chore: add cluster exit binding ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.9.0 (2022-12-13)

#### :rocket: New Feature
* `bootstrap`
  * [#2551](https://github.com/midwayjs/midway/pull/2551) feat: support socket.io sticky session ([@czy88840616](https://github.com/czy88840616))
* `casbin-redis-adapter`, `casbin`, `core`, `redis`
  * [#2560](https://github.com/midwayjs/midway/pull/2560) feat: support casbin watcher ([@czy88840616](https://github.com/czy88840616))
* `core`
  * [#2574](https://github.com/midwayjs/midway/pull/2574) feat: add @injectClient for service factory ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `core`
  * [#2533](https://github.com/midwayjs/midway/pull/2533) fix: glob support more wildcard string ([@czy88840616](https://github.com/czy88840616))
* `web`
  * [#2573](https://github.com/midwayjs/midway/pull/2573) fix: ignore backup egg logger error ([@czy88840616](https://github.com/czy88840616))
* `faas`, `mock`
  * [#2576](https://github.com/midwayjs/midway/pull/2576) fix: event not format in faas ([@czy88840616](https://github.com/czy88840616))

#### :wrench: Maintenance
* `core`
  * [#2534](https://github.com/midwayjs/midway/pull/2534) chore: sync code from https://github.com/midwayjs/fork-dep-monitor/pu… ([@czy88840616](https://github.com/czy88840616))
* `web-koa`
  * [#2535](https://github.com/midwayjs/midway/pull/2535) chore: sync code from https://github.com/midwayjs/fork-dep-monitor/pu… ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.8.4 (2022-12-09)

#### :bug: Bug Fix
* `captcha`
  * [#2566](https://github.com/midwayjs/midway/pull/2566) fix: captcha store prefix ([@echosoar](https://github.com/echosoar))
* `bull`
  * [#2526](https://github.com/midwayjs/midway/pull/2526) fix: add default job options when create queue ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2557](https://github.com/midwayjs/midway/pull/2557) docs: update docker deploy ([@huangapple](https://github.com/huangapple))
* [#2549](https://github.com/midwayjs/midway/pull/2549) docs(site): update awesome_midway.md ([@waitingsong](https://github.com/waitingsong))

#### Committers: 4
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@huangapple](https://github.com/huangapple)
- waiting ([@waitingsong](https://github.com/waitingsong))



## v3.8.3 (2022-11-28)

#### :bug: Bug Fix
* `mikro`, `sequelize`, `typeorm`
  * [#2538](https://github.com/midwayjs/midway/pull/2538) fix: data source find sequence ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.8.2 (2022-11-26)

#### :bug: Bug Fix
* `sequelize`
  * [#2525](https://github.com/midwayjs/midway/pull/2525) fix: sequelize inject data source forgot to export ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `swagger`
  * [#2518](https://github.com/midwayjs/midway/pull/2518) fix: swagger global prefix without path ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2516](https://github.com/midwayjs/midway/pull/2516) docs: update the configuration description of AccessKey ([@yantze](https://github.com/yantze))
* [#2515](https://github.com/midwayjs/midway/pull/2515) docs(site): update awesome_midway.md ([@waitingsong](https://github.com/waitingsong))
* [#2514](https://github.com/midwayjs/midway/pull/2514) doc(consul.md): fix port type error ([@xnng](https://github.com/xnng))

#### Committers: 4
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@xnng](https://github.com/xnng)
- waiting ([@waitingsong](https://github.com/waitingsong))
- zhi ([@yantze](https://github.com/yantze))



## v3.8.1 (2022-11-20)

#### :bug: Bug Fix
* `etcd`
  * [#2512](https://github.com/midwayjs/midway/pull/2512) fix: etcd support default instance name ([@czy88840616](https://github.com/czy88840616))

#### Committers: 1
- Harry Chen ([@czy88840616](https://github.com/czy88840616))



## v3.8.0 (2022-11-18)

#### :rocket: New Feature
* `etcd`
  * [#2481](https://github.com/midwayjs/midway/pull/2481) feat: add etcd component ([@czy88840616](https://github.com/czy88840616))
* `axios`, `core`, `cos`, `oss`, `redis`, `tablestore`
  * [#2482](https://github.com/midwayjs/midway/pull/2482) feat: serviceFactory support default client name ([@czy88840616](https://github.com/czy88840616))
* `core`, `mikro`, `sequelize`, `typeorm`
  * [#2498](https://github.com/midwayjs/midway/pull/2498) feat: add injectDataSource for mikro/typeorm/sequelize ([@czy88840616](https://github.com/czy88840616))

#### :bug: Bug Fix
* `core`
  * [#2505](https://github.com/midwayjs/midway/pull/2505) fix: windows entity glob and Closes [#2488](https://github.com/midwayjs/midway/issues/2488) ([@czy88840616](https://github.com/czy88840616))
  * [#2504](https://github.com/midwayjs/midway/pull/2504) fix: remove router cache and fix issue #2319 ([@czy88840616](https://github.com/czy88840616))
* `bull`
  * [#2493](https://github.com/midwayjs/midway/pull/2493) fix: bull exports and typings ([@czy88840616](https://github.com/czy88840616))

#### :running_woman: Performance
* `core`
  * [#2506](https://github.com/midwayjs/midway/pull/2506) perf: remove babel isClass check ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2502](https://github.com/midwayjs/midway/pull/2502) docs: fix remoteConfig in Life Cycle ([@haitaodesign](https://github.com/haitaodesign))
* [#2491](https://github.com/midwayjs/midway/pull/2491) docs(site): update auto_run.md ([@cave-](https://github.com/cave-))
* [#2489](https://github.com/midwayjs/midway/pull/2489) docs(site): fix midway-throttler url link in awesome_midway.md ([@larryzhuo](https://github.com/larryzhuo))

#### Committers: 4
- Haitao Lee ([@haitaodesign](https://github.com/haitaodesign))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- [@cave-](https://github.com/cave-)
- larry zhuo ([@larryzhuo](https://github.com/larryzhuo))



## v3.7.4 (2022-11-08)

#### :bug: Bug Fix
* `captcha`
  * [#2483](https://github.com/midwayjs/midway/pull/2483) fix: noise and size support ([@echosoar](https://github.com/echosoar))
* `casbin`
  * [#2486](https://github.com/midwayjs/midway/pull/2486) fix: policyAdapter promise typings ([@czy88840616](https://github.com/czy88840616))
* `typegoose`
  * [#2477](https://github.com/midwayjs/midway/pull/2477) fix: duplicate mongoose import ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `bull`
  * [#2485](https://github.com/midwayjs/midway/pull/2485) chore: add job typings export ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2487](https://github.com/midwayjs/midway/pull/2487) docs(site): add a throttler like @nestjs/throttler to awesome_midway.md ([@larryzhuo](https://github.com/larryzhuo))
* [#2479](https://github.com/midwayjs/midway/pull/2479) docs(orm):  add OrmConnectionHook example for legacy orm.md ([@larryzhuo](https://github.com/larryzhuo))
* [#2478](https://github.com/midwayjs/midway/pull/2478) docs: fix serverless_yml link path ([@isaced](https://github.com/isaced))

#### Committers: 4
- Gao Yang ([@echosoar](https://github.com/echosoar))
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- isaced ([@isaced](https://github.com/isaced))
- larry zhuo ([@larryzhuo](https://github.com/larryzhuo))



## v3.7.3 (2022-11-03)

#### :bug: Bug Fix
* `swagger`
  * [#2469](https://github.com/midwayjs/midway/pull/2469) fix: swagger ui favicon output ([@czy88840616](https://github.com/czy88840616))
* `faas`, `mock`
  * [#2464](https://github.com/midwayjs/midway/pull/2464) fix: getServerlessInstance add ctx hook ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2470](https://github.com/midwayjs/midway/pull/2470) docs: update deployment.md ([@kukudelaomao](https://github.com/kukudelaomao))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- 酷酷的老猫 ([@kukudelaomao](https://github.com/kukudelaomao))


## v3.7.2 (2022-11-02)

#### :bug: Bug Fix
* `swagger`
  * [#2466](https://github.com/midwayjs/midway/pull/2466) fix: type property replace ts type ([@czy88840616](https://github.com/czy88840616))

#### :memo: Documentation
* [#2465](https://github.com/midwayjs/midway/pull/2465) docs: Add grafana to docker-compose.yml ([@zhangbowy](https://github.com/zhangbowy))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- zhangbowy ([@zhangbowy](https://github.com/zhangbowy))


## v3.7.1 (2022-10-30)

#### :bug: Bug Fix
* `validate`
  * [#2459](https://github.com/midwayjs/midway/pull/2459) fix: validate with custom options will override global config ([@czy88840616](https://github.com/czy88840616))

#### :nail_care: Polish
* `sequelize`
  * [#2458](https://github.com/midwayjs/midway/pull/2458) fix: add config sync options ([@czy88840616](https://github.com/czy88840616))

#### Committers: 2
- Harry Chen ([@czy88840616](https://github.com/czy88840616))
- yc6 ([@zane0904](https://github.com/zane0904))


## v3.7.0 (2022-10-29)

### Bug Fixes

- **deps:** pin dependency cron to v1.8.2 ([#2426](https://github.com/midwayjs/midway/issues/2426)) ([9873e13](https://github.com/midwayjs/midway/commit/9873e13224e4b935697fdc22ecca97d43f809083))
- **deps:** update dependency @bull-board/api to v4.6.0 ([#2415](https://github.com/midwayjs/midway/issues/2415)) ([bc7f83e](https://github.com/midwayjs/midway/commit/bc7f83ec7d586e847fa70a5974e28e2a79ac4b40))
- **deps:** update dependency @bull-board/api to v4.6.1 ([#2448](https://github.com/midwayjs/midway/issues/2448)) ([aaf7116](https://github.com/midwayjs/midway/commit/aaf7116385c4bd92b338e519afa15f9da402b5be))
- **deps:** update dependency @bull-board/ui to v4.6.0 ([#2416](https://github.com/midwayjs/midway/issues/2416)) ([ccb6d2b](https://github.com/midwayjs/midway/commit/ccb6d2bb95088261504d623cae6885cc24953b1c))
- **deps:** update dependency @bull-board/ui to v4.6.1 ([#2449](https://github.com/midwayjs/midway/issues/2449)) ([0a84692](https://github.com/midwayjs/midway/commit/0a846920c58868e5801db9d8e85edddad4074d2d))
- **deps:** update dependency @grpc/grpc-js to v1.7.2 ([#2411](https://github.com/midwayjs/midway/issues/2411)) ([5f433a1](https://github.com/midwayjs/midway/commit/5f433a16afcb4f031310811608eaa8fdd5968ed8))
- **deps:** update dependency @grpc/grpc-js to v1.7.3 ([#2433](https://github.com/midwayjs/midway/issues/2433)) ([07c7acc](https://github.com/midwayjs/midway/commit/07c7accb4294a98d0726bc53b8bcec33038dd794))
- **deps:** update dependency amqp-connection-manager to v4.1.9 ([#2450](https://github.com/midwayjs/midway/issues/2450)) ([f0a4ccc](https://github.com/midwayjs/midway/commit/f0a4ccceba4a9fc8ef76c28b1e7cbca453d15a20))
- **deps:** update dependency bull to v4.10.1 ([#2412](https://github.com/midwayjs/midway/issues/2412)) ([992ee59](https://github.com/midwayjs/midway/commit/992ee59b4ab9cb82ad390f819f8cee73a2514684))
- **deps:** update dependency express to v4.18.2 ([#2413](https://github.com/midwayjs/midway/issues/2413)) ([ace153b](https://github.com/midwayjs/midway/commit/ace153b796a8b962d307ee1568634869f727431a))
- **deps:** update dependency sequelize to v6.25.3 ([#2417](https://github.com/midwayjs/midway/issues/2417)) ([0289fe9](https://github.com/midwayjs/midway/commit/0289fe93136980b897d6d1de38557680e4f08840))
- **deps:** update dependency supertest to v6.3.0 ([#2435](https://github.com/midwayjs/midway/issues/2435)) ([6342e1d](https://github.com/midwayjs/midway/commit/6342e1d2a5301f3bd512d7c58b90482bca390898))
- **deps:** update dependency tablestore to v5.3.0 ([#2418](https://github.com/midwayjs/midway/issues/2418)) ([c7f0f56](https://github.com/midwayjs/midway/commit/c7f0f56b736acd710efea03ccc4cffcec630d065))
- **deps:** update socket.io packages to v4.5.3 ([#2414](https://github.com/midwayjs/midway/issues/2414)) ([3bc64d6](https://github.com/midwayjs/midway/commit/3bc64d60d1648e18304259f1b957349f8d8e9ac6))
- framework loaded by import sequence ([#2394](https://github.com/midwayjs/midway/issues/2394)) ([c87f125](https://github.com/midwayjs/midway/commit/c87f1253c8ae217940f24efb7f97fe6fe61d20e4))
- init context missing when dev test ([#2423](https://github.com/midwayjs/midway/issues/2423)) ([fd26d92](https://github.com/midwayjs/midway/commit/fd26d92b5dea068e4f86e6d60ab0dfa47eaa55c9))
- upload whitelist set null ([#2431](https://github.com/midwayjs/midway/issues/2431)) ([06a765e](https://github.com/midwayjs/midway/commit/06a765ecfb6e4e16c982c9b39408f420d0c27be5))

### Features

- add server timeout config ([#2395](https://github.com/midwayjs/midway/issues/2395)) ([52f63b6](https://github.com/midwayjs/midway/commit/52f63b6726e6d5177ff018579be616c221379625))
- **core:** add custom route param decorator ([#2400](https://github.com/midwayjs/midway/issues/2400)) ([#2441](https://github.com/midwayjs/midway/issues/2441)) ([d5895bf](https://github.com/midwayjs/midway/commit/d5895bf09f454b34345fc11b642e4529a555b19b))
- support default data source name ([#2430](https://github.com/midwayjs/midway/issues/2430)) ([b953a15](https://github.com/midwayjs/midway/commit/b953a153bf09869a0ad3ff5e9617ca6a3db5bf77))
- support user to observe histogram value ([#2401](https://github.com/midwayjs/midway/issues/2401)) ([1d8c9ad](https://github.com/midwayjs/midway/commit/1d8c9ad1cad4f8863b1b6fd899388e554deb807e))
- verification code ([#2402](https://github.com/midwayjs/midway/issues/2402)) ([e96cf0a](https://github.com/midwayjs/midway/commit/e96cf0aa2de21b15cc69009df371834b3db22d47))

### Performance Improvements

- update triggerFunction args ([#2404](https://github.com/midwayjs/midway/issues/2404)) ([7ae42eb](https://github.com/midwayjs/midway/commit/7ae42ebe23c2c1a88f43e4516f7fabb22a2914c9))

## v3.6.1 (2022-10-13)

### Bug Fixes

- [#2309](https://github.com/midwayjs/midway/issues/2309) ([#2371](https://github.com/midwayjs/midway/issues/2371)) ([919242d](https://github.com/midwayjs/midway/commit/919242d1d7228caa0d450960113396627ce359db))
- fix axios typings and upgrade to v1 ([#2379](https://github.com/midwayjs/midway/issues/2379)) ([f0666f0](https://github.com/midwayjs/midway/commit/f0666f03c1404b7d11e8b3e8da7082a35432fe48))

## v3.6.0 (2022-10-10)

### Bug Fixes

- add default generic type to MikroConfigOptions ([#2342](https://github.com/midwayjs/midway/issues/2342)) ([d5fbab6](https://github.com/midwayjs/midway/commit/d5fbab666dabbae6fad0e0946b733ea73ac1a9d5))
- **deps:** update dependency amqp-connection-manager to v4.1.7 ([#2354](https://github.com/midwayjs/midway/issues/2354)) ([79d4d5b](https://github.com/midwayjs/midway/commit/79d4d5bede926be2c00e21250f8edffca747d932))
- **deps:** update dependency body-parser to v1.20.1 ([#2355](https://github.com/midwayjs/midway/issues/2355)) ([4cf6bda](https://github.com/midwayjs/midway/commit/4cf6bdaa8b10b4ae40598305e1df9ad29dd701ed))
- **deps:** update dependency sequelize to v6.24.0 ([#2356](https://github.com/midwayjs/midway/issues/2356)) ([ecc43d0](https://github.com/midwayjs/midway/commit/ecc43d0b96ad7fcc6766831b6db0cb8ca204580c))

### Features

- add casbin module ([#2358](https://github.com/midwayjs/midway/issues/2358)) ([a7d2786](https://github.com/midwayjs/midway/commit/a7d27863b756dcf81abc4d7dedaf35c517c2c1e3))
- add filter params for add controller ([#2359](https://github.com/midwayjs/midway/issues/2359)) ([1805011](https://github.com/midwayjs/midway/commit/1805011d3b2d86f04d6a887f4a86afb093a2a75f))
- add guard ([#2345](https://github.com/midwayjs/midway/issues/2345)) ([1b952a1](https://github.com/midwayjs/midway/commit/1b952a1b09adbb88ff3cff9a2974eb1e37ce53a5))
- add new bull component ([#2275](https://github.com/midwayjs/midway/issues/2275)) ([0a37b49](https://github.com/midwayjs/midway/commit/0a37b491720c5d5f0b98e9e42835ba263dd8b975))

## v3.5.3 (2022-09-25)

### Bug Fixes

- **deps:** update dependency @grpc/grpc-js to v1.7.1 ([#2331](https://github.com/midwayjs/midway/issues/2331)) ([4a962dc](https://github.com/midwayjs/midway/commit/4a962dce8f3d2990fc3a2668b7e009b670f99166))
- **deps:** update dependency @grpc/proto-loader to v0.7.3 ([#2327](https://github.com/midwayjs/midway/issues/2327)) ([d05dab5](https://github.com/midwayjs/midway/commit/d05dab5e9c2f73fc14d2bb82f61fb8e6bd52416f))
- **deps:** update dependency sequelize to v6.23.1 ([#2332](https://github.com/midwayjs/midway/issues/2332)) ([2a5c6eb](https://github.com/midwayjs/midway/commit/2a5c6eb82394c4b1427e936da3525d999d459b4e))
- **deps:** update dependency ws to v8.9.0 ([#2333](https://github.com/midwayjs/midway/issues/2333)) ([8a84a10](https://github.com/midwayjs/midway/commit/8a84a109b0a304c3f75db6cfb6dcf11e6d3edd78))
- make addAspect public ([#2317](https://github.com/midwayjs/midway/issues/2317)) ([ded7a07](https://github.com/midwayjs/midway/commit/ded7a0798b4f94936f851b202e2406d6dd3902e6))
- path parameters set ([#2314](https://github.com/midwayjs/midway/issues/2314)) ([cf1b441](https://github.com/midwayjs/midway/commit/cf1b441fa1d80894e69ea6ac3bd159f04a0c6ba5))
- scripts in `benchmark/` ([#2310](https://github.com/midwayjs/midway/issues/2310)) ([a039d3d](https://github.com/midwayjs/midway/commit/a039d3d269311e42cbc15c4431508219351bb521))
- **view:** fix setLocals ([#2321](https://github.com/midwayjs/midway/issues/2321)) ([72789a1](https://github.com/midwayjs/midway/commit/72789a114b1142674c1a8141c7af382538d92400))

### Features

- add proxyTimeout for httpProxy ([#2308](https://github.com/midwayjs/midway/issues/2308)) ([fb14118](https://github.com/midwayjs/midway/commit/fb141183223098534a075ab20bd3e2c366e40d4a))

## v3.5.2 (2022-09-08)

### Bug Fixes

- ctx.locals missing in faas ([#2302](https://github.com/midwayjs/midway/issues/2302)) ([a0a5903](https://github.com/midwayjs/midway/commit/a0a59036e0a0e8b5f92b17829af3f79191c1ee91))
- example missing in swagger ([#2305](https://github.com/midwayjs/midway/issues/2305)) ([8bc8fcc](https://github.com/midwayjs/midway/commit/8bc8fcc9467bcee1f7cd1cf609c93b918c96bc5a))

## v3.5.1 (2022-09-06)

### Bug Fixes

- glob with pattern ([#2293](https://github.com/midwayjs/midway/issues/2293)) ([1e05d41](https://github.com/midwayjs/midway/commit/1e05d41240094b0849caef53f10ef53a54e752ab))

### Features

- support add locals and add case ([#2289](https://github.com/midwayjs/midway/issues/2289)) ([fc373d9](https://github.com/midwayjs/midway/commit/fc373d9ac4d2ae82c90cd476292012fae2f5fc2d))
- support receiver to bind this ([#2292](https://github.com/midwayjs/midway/issues/2292)) ([159184c](https://github.com/midwayjs/midway/commit/159184c87087cf9f76bc55a5cda46f90771bf7db))

## v3.5.0 (2022-08-29)

### Bug Fixes

- **axios:** fix @midway/axios more configuration instance problems ([#2273](https://github.com/midwayjs/midway/issues/2273)) ([edf9377](https://github.com/midwayjs/midway/commit/edf937753a1b290de77bea334a052b22adbb9684))
- oss config typings ([#2277](https://github.com/midwayjs/midway/issues/2277)) ([f62e42a](https://github.com/midwayjs/midway/commit/f62e42abf18ff4df3b6d2f23189ec0a46db72c11))

### Features

- add retry wrapper for invoke some remote data ([#2271](https://github.com/midwayjs/midway/issues/2271)) ([1c47338](https://github.com/midwayjs/midway/commit/1c473386937293104369cc8e5727c5330de4f85c))
- **core:** config option for validating database connection during initialization ([#2234](https://github.com/midwayjs/midway/issues/2234)) ([cf5d360](https://github.com/midwayjs/midway/commit/cf5d360d7300db12f12cc3e1ce67806ad082a7b1))

## v3.4.13 (2022-08-24)

### Bug Fixes

- passport strategy this missing ([#2264](https://github.com/midwayjs/midway/issues/2264)) ([2e5467a](https://github.com/midwayjs/midway/commit/2e5467a7c1cd4b7aa5574ddab624861dea54346b))

## v3.4.12 (2022-08-20)

### Bug Fixes

- grpc context typings ([#2259](https://github.com/midwayjs/midway/issues/2259)) ([9449097](https://github.com/midwayjs/midway/commit/944909705413cebdfe0ae11301e8fd0e536c1edd))
- service factory client & clients merge ([#2248](https://github.com/midwayjs/midway/issues/2248)) ([cfdee64](https://github.com/midwayjs/midway/commit/cfdee6449cb2770bc238e74fd754b783c331b822))

## v3.4.11 (2022-08-16)

### Bug Fixes

- IMiddleware interface ([#2242](https://github.com/midwayjs/midway/issues/2242)) ([1b435fb](https://github.com/midwayjs/midway/commit/1b435fb86f1ae141f2906b64c236fb8926c4c380))

### Features

- **kafka:** update kafka framework & add test demo ([#2236](https://github.com/midwayjs/midway/issues/2236)) ([5eae117](https://github.com/midwayjs/midway/commit/5eae117dc302d1bd56d15564970441e1cd17b185))

## v3.4.10 (2022-08-12)

### Bug Fixes

- catch kafaka start error ([#2230](https://github.com/midwayjs/midway/issues/2230)) ([60c7c41](https://github.com/midwayjs/midway/commit/60c7c41eaaaa062bf63ca1f938dd2cbd15bd2f7d))
- **deps:** update dependency @grpc/grpc-js to v1.6.9 ([#2223](https://github.com/midwayjs/midway/issues/2223)) ([e0c6d4d](https://github.com/midwayjs/midway/commit/e0c6d4d78410d38149d4347a3bfb270498ae5f14))
- **deps:** update dependency amqp-connection-manager to v4.1.6 ([#2225](https://github.com/midwayjs/midway/issues/2225)) ([ff7506a](https://github.com/midwayjs/midway/commit/ff7506a7bb986409e8c9a85ea55a23a3d935bdf5))
- revert node 14 supported ([#2219](https://github.com/midwayjs/midway/issues/2219)) ([08e4152](https://github.com/midwayjs/midway/commit/08e4152bb9530b699de4150c2494f04795348719))
- stop duplicate invoke ([#2221](https://github.com/midwayjs/midway/issues/2221)) ([6bd3f57](https://github.com/midwayjs/midway/commit/6bd3f57dbd68742c5b789335b46e929b7f71c6c4))

## v3.4.9 (2022-08-10)

### Bug Fixes

- **deps:** update dependency amqp-connection-manager to v4.1.4 ([#2206](https://github.com/midwayjs/midway/issues/2206)) ([c80e85f](https://github.com/midwayjs/midway/commit/c80e85f47288b3dfff93a29404187a9b15e8963e))
- **deps:** update dependency tablestore to v5.2.1 ([#2197](https://github.com/midwayjs/midway/issues/2197)) ([7b6f3b5](https://github.com/midwayjs/midway/commit/7b6f3b587dc2bdf429c1f50f6af723b2d5b2431b))
- **grpc:** 🐞 Uncaught TypeError: Cannot read properties… ([#2201](https://github.com/midwayjs/midway/issues/2201)) ([f5c993f](https://github.com/midwayjs/midway/commit/f5c993f29a788d0df30f41398cfbc71b5c41defa))
- middleware repeat execute in request ([#2210](https://github.com/midwayjs/midway/issues/2210)) ([0466046](https://github.com/midwayjs/midway/commit/0466046a8843168459bcd5dedee4d17bad83301d))
- query parser with array ([#2207](https://github.com/midwayjs/midway/issues/2207)) ([94ddd69](https://github.com/midwayjs/midway/commit/94ddd691e2c0a8e06d88704d4e85a39443deef52))
- super agent typings ([#2204](https://github.com/midwayjs/midway/issues/2204)) ([87572a6](https://github.com/midwayjs/midway/commit/87572a63ba8226c2380bfdd3252c271336f6bfeb))
- support mikro-orm multi entities manager in request context ([#2193](https://github.com/midwayjs/midway/issues/2193)) ([60f65b2](https://github.com/midwayjs/midway/commit/60f65b2caa77b6770af65d7a24fa8023f1bc2085))
- typeorm config typings key ([#2192](https://github.com/midwayjs/midway/issues/2192)) ([6533942](https://github.com/midwayjs/midway/commit/6533942d88234234a3c7e5bcd877eb8c2200c7be))

### Features

- **core:** createInstance() accepts 3rd param cacheInstance (default true) ([#2208](https://github.com/midwayjs/midway/issues/2208)) ([a9149c2](https://github.com/midwayjs/midway/commit/a9149c2ae49a60085c910d8daaf2224aeef92c67))

### Performance Improvements

- move body patch without middleware ([#2209](https://github.com/midwayjs/midway/issues/2209)) ([97c9301](https://github.com/midwayjs/midway/commit/97c930107c6fa93d8209516b15348c988848ca3d))

## v3.4.8 (2022-08-02)

### Performance Improvements

- add ctx attach hook ([#2189](https://github.com/midwayjs/midway/issues/2189)) ([04a5b3f](https://github.com/midwayjs/midway/commit/04a5b3f6e0cbfc251c115a486948b0c3401ba4df))

## v3.4.7 (2022-08-01)

### Bug Fixes

- middleware disable in express ([#2187](https://github.com/midwayjs/midway/issues/2187)) ([8cad157](https://github.com/midwayjs/midway/commit/8cad157c84bf808763afa2d648c502fdd4264a54))
- unexpected token 'export' in load \*\*.d.ts file in prod mode ([#2185](https://github.com/midwayjs/midway/issues/2185)) ([6d634ce](https://github.com/midwayjs/midway/commit/6d634ce9361dd319e9d710118702e5543e42d4f0))

## v3.4.6 (2022-07-31)

### Bug Fixes

- **deps:** update dependency @grpc/grpc-js to v1.6.8 ([#2177](https://github.com/midwayjs/midway/issues/2177)) ([a8a8693](https://github.com/midwayjs/midway/commit/a8a86934ffe815458d2c4140d60589b3ef36b97e))
- **deps:** update dependency tablestore to v5.2.0 ([#2179](https://github.com/midwayjs/midway/issues/2179)) ([17e7f9b](https://github.com/midwayjs/midway/commit/17e7f9b0707584a0ad10f593c4ec7f52f598cf54))
- sls metadata npe ([#2167](https://github.com/midwayjs/midway/issues/2167)) ([98bf8b5](https://github.com/midwayjs/midway/commit/98bf8b5ec4d47f69dd8e53dae9a702a9c550a9b1))
- **task:** createClient config missing ([#2163](https://github.com/midwayjs/midway/issues/2163)) ([129ce16](https://github.com/midwayjs/midway/commit/129ce1643201b36d10eac08a97dd6d99e35026aa))

### Performance Improvements

- **core:** destroy connection concurrently within DataSourceManager.… ([#2169](https://github.com/midwayjs/midway/issues/2169)) ([53bcf65](https://github.com/midwayjs/midway/commit/53bcf65dc2699857a41a6400b4c04e0c46b30948))

## v3.4.5 (2022-07-25)

### Bug Fixes

- add getSchema method for validate ([#2155](https://github.com/midwayjs/midway/issues/2155)) ([aee9353](https://github.com/midwayjs/midway/commit/aee9353fb2c39f4996dff97b901a7b6d99f7cb9f))
- rabbit mq disconnect ([#2152](https://github.com/midwayjs/midway/issues/2152)) ([a98f37d](https://github.com/midwayjs/midway/commit/a98f37de69ee0b05ee027bdc8ff6b5cfcc485920))

## v3.4.4 (2022-07-25)

### Bug Fixes

- add config filter and modify sequelize & mongoose config ([#2150](https://github.com/midwayjs/midway/issues/2150)) ([5db3b9b](https://github.com/midwayjs/midway/commit/5db3b9b56b6eac393820acf9f089e6f8cdd6a8b6))
- add createBootstrap export ([#2145](https://github.com/midwayjs/midway/issues/2145)) ([8bd9491](https://github.com/midwayjs/midway/commit/8bd94910af98496d17966d44f7a88ec28ecc9b95))
- some passport strategy verify callback arguments length ([#2151](https://github.com/midwayjs/midway/issues/2151)) ([65c9025](https://github.com/midwayjs/midway/commit/65c9025a3b399d9d7e5061cecb30ad4943d337cd))
- **view-nunjucks:** add autoescape config && add ts interface ([#2148](https://github.com/midwayjs/midway/issues/2148)) ([8d39739](https://github.com/midwayjs/midway/commit/8d39739eb99d9baa2d6da229352d90f18bf072d5))

## v3.4.3 (2022-07-21)

### Bug Fixes

- sequelize typings and filter empty metadata([#2140](https://github.com/midwayjs/midway/issues/2140)) ([eaa360c](https://github.com/midwayjs/midway/commit/eaa360c028dca67d0df79efa61eed605d784c58d))
- throw error when authenticate ([#2141](https://github.com/midwayjs/midway/issues/2141)) ([730a282](https://github.com/midwayjs/midway/commit/730a28209162bb18b989cb783b54936a4bb747e0))

## v3.4.2 (2022-07-21)

### Bug Fixes

- export server credentials class & lock version ([#2138](https://github.com/midwayjs/midway/issues/2138)) ([5f48299](https://github.com/midwayjs/midway/commit/5f4829903de744b4b9343e8bc441b373d78d78ed))

## v3.4.1 (2022-07-20)

### Bug Fixes

- class name and controller prefix conflict ([#2137](https://github.com/midwayjs/midway/issues/2137)) ([f6607ca](https://github.com/midwayjs/midway/commit/f6607cac43ff19cf669f03978817f13cc1da00fd))

## v3.4.0 (2022-07-20)

**Note:** Version bump only for package midway_project

# [3.4.0-beta.12](https://github.com/midwayjs/midway/compare/v3.4.0-beta.11...v3.4.0-beta.12) (2022-07-20)

### Bug Fixes

- passport compatible code ([#2133](https://github.com/midwayjs/midway/issues/2133)) ([2975e4f](https://github.com/midwayjs/midway/commit/2975e4f5b6cf8cbcd42cbfb8ce3e08633dbba383))

# [3.4.0-beta.11](https://github.com/midwayjs/midway/compare/v3.4.0-beta.10...v3.4.0-beta.11) (2022-07-19)

### Bug Fixes

- async context manager key ([099e4a0](https://github.com/midwayjs/midway/commit/099e4a0a03465b258671b2de48e64df6109b08a5))
- **deps:** update dependency sequelize to v6.21.3 ([#2124](https://github.com/midwayjs/midway/issues/2124)) ([ef05883](https://github.com/midwayjs/midway/commit/ef05883d698f2dc4797fdff75d05cec7790120b0))
- throw error when rabbitmq connect fail ([#2130](https://github.com/midwayjs/midway/issues/2130)) ([e7f55a8](https://github.com/midwayjs/midway/commit/e7f55a863583a3c641b2467799e1d80b1761ecce))

# [3.4.0-beta.10](https://github.com/midwayjs/midway/compare/v3.4.0-beta.9...v3.4.0-beta.10) (2022-07-18)

### Bug Fixes

- **deps:** update dependency ws to v8.8.1 ([#2125](https://github.com/midwayjs/midway/issues/2125)) ([fabf2a4](https://github.com/midwayjs/midway/commit/fabf2a4b773c3c132043592c5e1ec7cb57f7dae0))

### Features

- add get current context manager global method ([#2129](https://github.com/midwayjs/midway/issues/2129)) ([2ac829f](https://github.com/midwayjs/midway/commit/2ac829fe4cb26851a21a211d17d9bfc2195beab6))

# [3.4.0-beta.9](https://github.com/midwayjs/midway/compare/v3.4.0-beta.8...v3.4.0-beta.9) (2022-07-14)

### Bug Fixes

- **deps:** update dependency @koa/router to v11 ([#2111](https://github.com/midwayjs/midway/issues/2111)) ([0f6b34e](https://github.com/midwayjs/midway/commit/0f6b34e964a1bfc98ddf020878b43af99557291d))
- faas close server ([#2113](https://github.com/midwayjs/midway/issues/2113)) ([f627f27](https://github.com/midwayjs/midway/commit/f627f27c0a6afb6f1e4a04a68ae96ef6d579ed3f))
- ignore middleware can't return in resolve ([#2112](https://github.com/midwayjs/midway/issues/2112)) ([ec018a3](https://github.com/midwayjs/midway/commit/ec018a3365b06c1cc809e014afede0a24ce1dd74))
- use redis client before it's ready, most likely to occur during unit test ([#2102](https://github.com/midwayjs/midway/issues/2102)) ([3f4f0cd](https://github.com/midwayjs/midway/commit/3f4f0cdd5d74c5b7f6c39edfeb453accd6ec0fa3))
- when `resolve` return null, the current loop should end, otherwi… ([#2114](https://github.com/midwayjs/midway/issues/2114)) ([cae3c8b](https://github.com/midwayjs/midway/commit/cae3c8b325d57b1da982eec55216eceaf4596cf9))

### Features

- add context manager with middleware ([#2116](https://github.com/midwayjs/midway/issues/2116)) ([99ba506](https://github.com/midwayjs/midway/commit/99ba506b82b1061af26bf333892ae90b654a7b31))

# [3.4.0-beta.8](https://github.com/midwayjs/midway/compare/v3.4.0-beta.7...v3.4.0-beta.8) (2022-07-12)

### Bug Fixes

- ssl ([be82dcb](https://github.com/midwayjs/midway/commit/be82dcb3c0992f138969ac57a67c67e9dc1727d9))

# [3.4.0-beta.7](https://github.com/midwayjs/midway/compare/v3.4.0-beta.6...v3.4.0-beta.7) (2022-07-12)

### Bug Fixes

- egg default custom logger level ([#2099](https://github.com/midwayjs/midway/issues/2099)) ([7b8c4ba](https://github.com/midwayjs/midway/commit/7b8c4ba14d3233777366e643dbd91d1aaca07101))
- regexp for root path match ([#2105](https://github.com/midwayjs/midway/issues/2105)) ([97ccc03](https://github.com/midwayjs/midway/commit/97ccc0391cd1436ef5106a7e35f0d81dca4477dd))

### Features

- add display options and fix array bug ([#2103](https://github.com/midwayjs/midway/issues/2103)) ([4f8e06d](https://github.com/midwayjs/midway/commit/4f8e06d98e1c14f4403b87ccddf90a2bb81b4862))
- support socket connection and message middleware ([#1984](https://github.com/midwayjs/midway/issues/1984)) ([886d0bf](https://github.com/midwayjs/midway/commit/886d0bf6b47aecf870df15853d4ba82256c08858))

# [3.4.0-beta.6](https://github.com/midwayjs/midway/compare/v3.4.0-beta.5...v3.4.0-beta.6) (2022-07-07)

### Features

- add matched method in router service ([#2098](https://github.com/midwayjs/midway/issues/2098)) ([6c00665](https://github.com/midwayjs/midway/commit/6c006656d06587deee808160d536d785412f0c6d))

# [3.4.0-beta.5](https://github.com/midwayjs/midway/compare/v3.4.0-beta.4...v3.4.0-beta.5) (2022-07-07)

### Bug Fixes

- koa dynamic router case ([#2094](https://github.com/midwayjs/midway/issues/2094)) ([646ee6e](https://github.com/midwayjs/midway/commit/646ee6e95995136b7795c1f821a7b6e74ffdbbcd))
- replace onReady to onServerReady ([#2092](https://github.com/midwayjs/midway/issues/2092)) ([b3a2804](https://github.com/midwayjs/midway/commit/b3a2804820bc651366c1c3f83118262cd8947884))

# [3.4.0-beta.4](https://github.com/midwayjs/midway/compare/v3.4.0-beta.3...v3.4.0-beta.4) (2022-07-04)

### Bug Fixes

- config export default case ([#2089](https://github.com/midwayjs/midway/issues/2089)) ([15c66d8](https://github.com/midwayjs/midway/commit/15c66d894e42bf488e3cb74084a1ecb17a42752b))
- missing client options in grpc ([#2087](https://github.com/midwayjs/midway/issues/2087)) ([be99f10](https://github.com/midwayjs/midway/commit/be99f10f20084932663f76e34e3fb9e55ebaa71e))
- return buffer in serverless environment ([#2085](https://github.com/midwayjs/midway/issues/2085)) ([ef4f70a](https://github.com/midwayjs/midway/commit/ef4f70ac20f8c7dc05165947114349aa991eda56))

### Features

- add kafka ([#2062](https://github.com/midwayjs/midway/issues/2062)) ([a83003b](https://github.com/midwayjs/midway/commit/a83003bf0db86d640b60e45ee6cbf71e656008a0))
- code dye ([#2078](https://github.com/midwayjs/midway/issues/2078)) ([a9cf1c5](https://github.com/midwayjs/midway/commit/a9cf1c50199b5bad1e3d6024a87d1c4761370fde))

## v3.3.14 (2022-06-17)

### Bug Fixes

- swagger delete example when extends ([#2041](https://github.com/midwayjs/midway/issues/2041)) ([47b62b8](https://github.com/midwayjs/midway/commit/47b62b8ebfb4a5ad4fe9ca0ba0038bb324711404))
- throw error when task run fail and add task to fail queue ([#2044](https://github.com/midwayjs/midway/issues/2044)) ([3c6cd0f](https://github.com/midwayjs/midway/commit/3c6cd0f69bb3c934c56ab5d1e30a333bac6b3e1a))

## v3.3.13 (2022-06-06)

### Bug Fixes

- swagger items assign bug ([#2025](https://github.com/midwayjs/midway/issues/2025)) ([e81a79f](https://github.com/midwayjs/midway/commit/e81a79fd9f88af56d5e1da7421548388d118b2ec))

## v3.3.12 (2022-06-02)

### Bug Fixes

- add duplicate check for task ([#2019](https://github.com/midwayjs/midway/issues/2019)) ([0b42b56](https://github.com/midwayjs/midway/commit/0b42b560c11d6ff718493b752e2c32cb2c44eb59))
- cache typings ([#2018](https://github.com/midwayjs/midway/issues/2018)) ([8db4e69](https://github.com/midwayjs/midway/commit/8db4e698e534da3eb7b4a37eeb7485b4fe34b977))

## v3.3.11 (2022-05-27)

**Note:** Version bump only for package midway_project

## v3.3.10 (2022-05-26)

### Features

- add grpc server options ([#2005](https://github.com/midwayjs/midway/issues/2005)) ([a35d94b](https://github.com/midwayjs/midway/commit/a35d94b37e3134e12d0ec7ff2f4751fc0d7e9d73))

## v3.3.9 (2022-05-25)

### Bug Fixes

- i18 resolver and task typing ([#2003](https://github.com/midwayjs/midway/issues/2003)) ([c7b8ad1](https://github.com/midwayjs/midway/commit/c7b8ad1a86eb680059ab685e1f84ffe046a59292))

## v3.3.8 (2022-05-17)

### Bug Fixes

- compatible date type ([#1979](https://github.com/midwayjs/midway/issues/1979)) ([24140f1](https://github.com/midwayjs/midway/commit/24140f1c2b93e8c3a10b996e0f135b260abfbf86))

## v3.3.7 (2022-05-13)

### Bug Fixes

- koa pipe ([#1973](https://github.com/midwayjs/midway/issues/1973)) ([5cebb76](https://github.com/midwayjs/midway/commit/5cebb76e793abd75bc34dd328d9c1db3d430b58a))

## v3.3.6 (2022-05-11)

### Bug Fixes

- **deps:** update dependency ejs to v3.1.7 [security] ([#1949](https://github.com/midwayjs/midway/issues/1949)) ([ef8e3fc](https://github.com/midwayjs/midway/commit/ef8e3fcc005b76196ac120dbb0f36e07b6fe6d91))
- egg missing session definition ([#1969](https://github.com/midwayjs/midway/issues/1969)) ([9ded02a](https://github.com/midwayjs/midway/commit/9ded02adce74c59f8644a5f92e5a437deb0d1d8c))
- session maxAge definition ([#1968](https://github.com/midwayjs/midway/issues/1968)) ([3e93254](https://github.com/midwayjs/midway/commit/3e93254b54b30215ddeb3ad6d60469bdb42e284c))

## v3.3.5 (2022-04-27)

### Bug Fixes

- add original url proxy from url ([#1936](https://github.com/midwayjs/midway/issues/1936)) ([402ad24](https://github.com/midwayjs/midway/commit/402ad249d10f5e9a30d68ee58bc57dc33d7b3107))
- cluster compatible ([#1942](https://github.com/midwayjs/midway/issues/1942)) ([3891150](https://github.com/midwayjs/midway/commit/3891150deec98c9f09edee0973ca8f52d79c66f5))
- oss cluster typings ([#1924](https://github.com/midwayjs/midway/issues/1924)) ([ab2e2be](https://github.com/midwayjs/midway/commit/ab2e2beb9cadb80885ffeb3406da1fb78530f7ef))
- throw error if config is invalid ([#1939](https://github.com/midwayjs/midway/issues/1939)) ([cc5fc1e](https://github.com/midwayjs/midway/commit/cc5fc1e0500554e52853246b90655c05f481fe6c))

## v3.3.4 (2022-04-21)

### Bug Fixes

- close logger before egg app close ([#1928](https://github.com/midwayjs/midway/issues/1928)) ([d30d21f](https://github.com/midwayjs/midway/commit/d30d21f7b2727a2891ac3810dc8dbcbc5276abd7))
- is express method got error result ([#1919](https://github.com/midwayjs/midway/issues/1919)) ([7ca9359](https://github.com/midwayjs/midway/commit/7ca9359c8421f77f1f410c56730cb8babaf65a8c))
- register app before framework init ([#1925](https://github.com/midwayjs/midway/issues/1925)) ([e2fd742](https://github.com/midwayjs/midway/commit/e2fd7425983e30b5ff61fe27db4215b05d33b778))
- typings for app decorator ([#1929](https://github.com/midwayjs/midway/issues/1929)) ([c508458](https://github.com/midwayjs/midway/commit/c508458f9f7505185e676330b3668d38701c6137))

### Features

- add recommend extension for site ([#1922](https://github.com/midwayjs/midway/issues/1922)) ([290179c](https://github.com/midwayjs/midway/commit/290179ce47c287f2b39599e609a349c14907cccc))

## v3.3.3 (2022-04-14)

### Bug Fixes

- ctx.getLogger does not overwrite success ([#1908](https://github.com/midwayjs/midway/issues/1908)) ([5fcb1c6](https://github.com/midwayjs/midway/commit/5fcb1c6273675c5a1123a94bdaae057781eb217f))

## v3.3.2 (2022-04-13)

### Bug Fixes

- main framework found ([#1903](https://github.com/midwayjs/midway/issues/1903)) ([8a22267](https://github.com/midwayjs/midway/commit/8a22267db744e2269e41089a27fd8e935c1f69e3))

## v3.3.1 (2022-04-11)

### Bug Fixes

- cookies and BodyParserOptions definition in Koa after [#1856](https://github.com/midwayjs/midway/issues/1856) ([#1899](https://github.com/midwayjs/midway/issues/1899)) ([02fa026](https://github.com/midwayjs/midway/commit/02fa0262ccc2a44fb7e4482ed780cda9026a9a6c))
- swagger_extend_bug ([#1894](https://github.com/midwayjs/midway/issues/1894)) ([b918ef8](https://github.com/midwayjs/midway/commit/b918ef871f6daf43a1bf3754e705b7c3e12bf3cd))

## v3.3.0 (2022-04-07)

### Bug Fixes

- mapping prod and test config in object mode ([#1886](https://github.com/midwayjs/midway/issues/1886)) ([d00f622](https://github.com/midwayjs/midway/commit/d00f622f2a2dc095c8e829b862f2ac155a8e6c91))
- mock when app not start ([#1876](https://github.com/midwayjs/midway/issues/1876)) ([bd32f3e](https://github.com/midwayjs/midway/commit/bd32f3e3e366f5f81c05bfa2b00530ea5ec95744))

### Features

- add ApiExtraModel && fix items bug ([#1873](https://github.com/midwayjs/midway/issues/1873)) ([40cce3b](https://github.com/midwayjs/midway/commit/40cce3be1d8ebd5b2723aff2e6d6d488024c5a56))
- add koa init options ([#1885](https://github.com/midwayjs/midway/issues/1885)) ([93d4aed](https://github.com/midwayjs/midway/commit/93d4aed45bc45c2742ceb2bfb990edeaa59d7187))
- upgrade ioredis to v5 ([#1893](https://github.com/midwayjs/midway/issues/1893)) ([42b3dc7](https://github.com/midwayjs/midway/commit/42b3dc723cd291d37f7fd40da90cf031a45f6d78))

## v3.2.2 (2022-03-30)

### Bug Fixes

- match and ignore method missing this ([#1868](https://github.com/midwayjs/midway/issues/1868)) ([4a3800a](https://github.com/midwayjs/midway/commit/4a3800a05a827b2beebc2e22d12ca8b16ffe0548))
- output error ([#1869](https://github.com/midwayjs/midway/issues/1869)) ([e804fc0](https://github.com/midwayjs/midway/commit/e804fc07e4eb07c49e28c8cd2d995401dee71dda))
- typings missing ([#1863](https://github.com/midwayjs/midway/issues/1863)) ([7d684a0](https://github.com/midwayjs/midway/commit/7d684a0b58c2598b3f242343a5c3797e47ba7efd))

## v3.2.1 (2022-03-27)

### Bug Fixes

- swagger ui replace json path ([#1860](https://github.com/midwayjs/midway/issues/1860)) ([0f3728d](https://github.com/midwayjs/midway/commit/0f3728daccba12923f23f5b498c7dda13ced36d7))

## v3.2.0 (2022-03-25)

### Bug Fixes

- add lock file for site ([ef2bd57](https://github.com/midwayjs/midway/commit/ef2bd5772d49efb4d0b6865670303a5be776d383))
- fix ts build error (orm) ([#1859](https://github.com/midwayjs/midway/issues/1859)) ([c44e18d](https://github.com/midwayjs/midway/commit/c44e18d00f966792e46238c7d8807d5b3c543873))
- logger create failed cause file size too large to create V8 string ([#1854](https://github.com/midwayjs/midway/issues/1854)) ([8a10d03](https://github.com/midwayjs/midway/commit/8a10d033063ef46bb80f1252bfb6815281a940d8))
- swagger getSchemaPath bug ([#1850](https://github.com/midwayjs/midway/issues/1850)) ([e3adda0](https://github.com/midwayjs/midway/commit/e3adda0e4f5c470d44d66b11e2e5b39a7ecc6bea))
- throw error when cluster exec ([#1848](https://github.com/midwayjs/midway/issues/1848)) ([bf0e209](https://github.com/midwayjs/midway/commit/bf0e209ec724ab41b5bc9b43b08d7c44d3b77e3b))
- upload file support more http method ([#1846](https://github.com/midwayjs/midway/issues/1846)) ([7587898](https://github.com/midwayjs/midway/commit/75878986ba69c41f58de1165d07938f094ce9ab2))

### Features

- add http proxy component ([#1843](https://github.com/midwayjs/midway/issues/1843)) ([5281e31](https://github.com/midwayjs/midway/commit/5281e316220591b84a0200c6cdf1572680f6e2f6))

## v3.1.6 (2022-03-21)

### Bug Fixes

- otel test ([#1837](https://github.com/midwayjs/midway/issues/1837)) ([36fa998](https://github.com/midwayjs/midway/commit/36fa998c077551e3ce9e0f0fda89d8bf1a3f0be7))

## v3.1.5 (2022-03-18)

### Bug Fixes

- **deps:** update dependency @midwayjs/cookies to v1.0.2 ([#1834](https://github.com/midwayjs/midway/issues/1834)) ([e99a5fa](https://github.com/midwayjs/midway/commit/e99a5fad0b9e0a7021d3b0158eafe7809e90b652))
- missing appDir value with egg-scripts cluster mode ([#1828](https://github.com/midwayjs/midway/issues/1828)) ([dc333ef](https://github.com/midwayjs/midway/commit/dc333ef4928d34c2c4ca061ce9331e676467c52e))

## v3.1.4 (2022-03-16)

### Bug Fixes

- invoke method after agent overwrite method ([#1822](https://github.com/midwayjs/midway/issues/1822)) ([63f53cc](https://github.com/midwayjs/midway/commit/63f53cce66e4c8172b11e006ab3ab1a2e8491bdc))

## v3.1.3 (2022-03-15)

### Bug Fixes

- add midway method to agent ([#1819](https://github.com/midwayjs/midway/issues/1819)) ([e9fa48b](https://github.com/midwayjs/midway/commit/e9fa48bf4d5347dc38f9190228820c8169270f89))
- EggAppConfig with PowerPartial ([#1818](https://github.com/midwayjs/midway/issues/1818)) ([6e2d1dd](https://github.com/midwayjs/midway/commit/6e2d1ddbbf67e7d77d6e316c76b535d5cbedabec))

## v3.1.2 (2022-03-15)

### Bug Fixes

- add a inject for [@inject](https://github.com/inject) logger in singleton scope ([#1816](https://github.com/midwayjs/midway/issues/1816)) ([4e9cf96](https://github.com/midwayjs/midway/commit/4e9cf96793acff829a2a8ca6598081cc331d6d25))
- agent load config ([#1815](https://github.com/midwayjs/midway/issues/1815)) ([95a6505](https://github.com/midwayjs/midway/commit/95a650544b921d6285c1beb97c7df7a0917ea4fb))
- consule config definition ([#1804](https://github.com/midwayjs/midway/issues/1804)) ([2a0d57c](https://github.com/midwayjs/midway/commit/2a0d57c183f3fad22fe878f538a26182291b7b44))
- remove swagger validator url ([#1813](https://github.com/midwayjs/midway/issues/1813)) ([ded291a](https://github.com/midwayjs/midway/commit/ded291a308f81961f9f3c2a9c21b5862d7d73ca6))
- worker starter origin context ([#1814](https://github.com/midwayjs/midway/issues/1814)) ([0168bcc](https://github.com/midwayjs/midway/commit/0168bcceef0f7cf39a8f0d903c24496f5f4f056f))

### Features

- add otel component ([#1808](https://github.com/midwayjs/midway/issues/1808)) ([8fda71e](https://github.com/midwayjs/midway/commit/8fda71e82cedfcf05e590780c55fbff10c4132cb))
- security helper ([#1795](https://github.com/midwayjs/midway/issues/1795)) ([cc8a148](https://github.com/midwayjs/midway/commit/cc8a148bf7a2ea1351d3912084de2ad755c465e7))

## v3.1.1 (2022-03-09)

### Bug Fixes

- default error dir and loadMidwayController ([#1791](https://github.com/midwayjs/midway/issues/1791)) ([4fd6b64](https://github.com/midwayjs/midway/commit/4fd6b643d683b85335f4bd314a9574ef8501a3f6))
- preload module position ([#1794](https://github.com/midwayjs/midway/issues/1794)) ([1456a83](https://github.com/midwayjs/midway/commit/1456a83fd2bd2afc1b3d92b4d1315ad6af7650df))

## v3.1.0 (2022-03-07)

### Bug Fixes

- egg logger create context logger case ([#1760](https://github.com/midwayjs/midway/issues/1760)) ([f9bebf1](https://github.com/midwayjs/midway/commit/f9bebf18cffbced4bd596d1ab39b585ea4d6a229))
- express use router and middleware ([#1777](https://github.com/midwayjs/midway/issues/1777)) ([21a69bb](https://github.com/midwayjs/midway/commit/21a69bbfc5535aaafcb3751f4c0c54ffcf109e9d))
- koa default onerrror now returns json correctly ([#1779](https://github.com/midwayjs/midway/issues/1779)) ([0b2be53](https://github.com/midwayjs/midway/commit/0b2be5329e11b3ea30fb6b748b23ed310b620394))
- not transform when RouteParam got undefined ([#1762](https://github.com/midwayjs/midway/issues/1762)) ([d714e31](https://github.com/midwayjs/midway/commit/d714e317aec771c8971bf6093c767eba9bccc976))
- nunjucks local cache ([#1774](https://github.com/midwayjs/midway/issues/1774)) ([413ec44](https://github.com/midwayjs/midway/commit/413ec44ea309077ce482fe55db3819aaab45894a))
- use hook to load egg application ([#1782](https://github.com/midwayjs/midway/issues/1782)) ([b47f27b](https://github.com/midwayjs/midway/commit/b47f27bf441431ddb1d0d35d5ee0ae80ae56fce8))

### Features

- starter for node.js and serverless-worker environment ([#1768](https://github.com/midwayjs/midway/issues/1768)) ([0c48b73](https://github.com/midwayjs/midway/commit/0c48b739e54be4e18aeff4c989fd3b96e955805c))
- support event for worker starter ([#1788](https://github.com/midwayjs/midway/issues/1788)) ([2d97dc7](https://github.com/midwayjs/midway/commit/2d97dc7908b0a76245d8a8e3089b9756fb579394))

## v3.0.13 (2022-03-01)

### Bug Fixes

- **deps:** update dependency raw-body to v2.5.1 ([#1754](https://github.com/midwayjs/midway/issues/1754)) ([6d9d819](https://github.com/midwayjs/midway/commit/6d9d819a3628ac8ecf91e75120a73f0533ba4bc9))
- **deps:** update dependency sequelize to ~6.17.0 ([#1750](https://github.com/midwayjs/midway/issues/1750)) ([5176df9](https://github.com/midwayjs/midway/commit/5176df979528fd41e648771847c32236f19e2baf))
- rabbitmq config key ([#1758](https://github.com/midwayjs/midway/issues/1758)) ([b667011](https://github.com/midwayjs/midway/commit/b667011df4c2604a8eaccc40bce7ae75e0330514))

## v3.0.12 (2022-02-25)

### Bug Fixes

- remove winston logger compatibility code ([#1749](https://github.com/midwayjs/midway/issues/1749)) ([3b4c67c](https://github.com/midwayjs/midway/commit/3b4c67cc11ead3923ba060aa9369406fbb16c187))

## v3.0.11 (2022-02-25)

### Bug Fixes

- **deps:** update dependency tablestore to v5.1.1 ([#1743](https://github.com/midwayjs/midway/issues/1743)) ([5087e7d](https://github.com/midwayjs/midway/commit/5087e7d58bf70f903aed7f0b384e70551bffd8d7))
- none level ([#1744](https://github.com/midwayjs/midway/issues/1744)) ([dccb726](https://github.com/midwayjs/midway/commit/dccb7260ad98f9e702392deea6984a65b9bef985))

## v3.0.10 (2022-02-24)

### Bug Fixes

- **deps:** update dependency raw-body to v2.5.0 ([#1731](https://github.com/midwayjs/midway/issues/1731)) ([6caec96](https://github.com/midwayjs/midway/commit/6caec96b976b9dce1a8cda4d3f809efd346ceaf5))
- missing express cookie parser typings ([#1735](https://github.com/midwayjs/midway/issues/1735)) ([965e850](https://github.com/midwayjs/midway/commit/965e850e004f39870e8d371be573ecfc754e4627))
- remove configuration resolve handler and add detectorOptions ([#1740](https://github.com/midwayjs/midway/issues/1740)) ([7af24e8](https://github.com/midwayjs/midway/commit/7af24e8cc55f0ba798b4d774084ace4069a8a54c))

## v3.0.9 (2022-02-21)

### Bug Fixes

- egg missing setAttr and getAttr ([#1730](https://github.com/midwayjs/midway/issues/1730)) ([7c6de3f](https://github.com/midwayjs/midway/commit/7c6de3ffa437e23f717efa0065ba60e482b3d225))
- missing getLocalTask method ([#1728](https://github.com/midwayjs/midway/issues/1728)) ([1c916e9](https://github.com/midwayjs/midway/commit/1c916e9f6bb8de6ea8b64f45f8043ca315396d62))
- redis on method missing ([#1729](https://github.com/midwayjs/midway/issues/1729)) ([61fde02](https://github.com/midwayjs/midway/commit/61fde024324b9774d51dd9ebd805883207f783b5))

## v3.0.8 (2022-02-19)

### Bug Fixes

- cookies definition in koa ([#1720](https://github.com/midwayjs/midway/issues/1720)) ([91adc35](https://github.com/midwayjs/midway/commit/91adc35f1dbcc1b362419b501ffa86be2f1050bc))
- update koa ctx.app definition ([#1721](https://github.com/midwayjs/midway/issues/1721)) ([2b3aced](https://github.com/midwayjs/midway/commit/2b3aced49bb3ca6dfc7652f4df668f6fa171238b))

## v3.0.7 (2022-02-17)

### Bug Fixes

- benchmark ([#1719](https://github.com/midwayjs/midway/issues/1719)) ([088e306](https://github.com/midwayjs/midway/commit/088e3066962b5ad9c5ecae3ba602a3ca5b215f5d))
- **deps:** update dependency body-parser to v1.19.2 ([#1708](https://github.com/midwayjs/midway/issues/1708)) ([01626e8](https://github.com/midwayjs/midway/commit/01626e882710108cc9bede8c6f2adcfd142f72f0))
- **deps:** update dependency express to v4.17.3 ([#1713](https://github.com/midwayjs/midway/issues/1713)) ([c781eca](https://github.com/midwayjs/midway/commit/c781eca27586b1d07cf672e71776ad9a521e149f))
- **deps:** update dependency nanoid to v3.3.1 ([#1704](https://github.com/midwayjs/midway/issues/1704)) ([7e31d41](https://github.com/midwayjs/midway/commit/7e31d41d9d66a3667b21c5c6aa7fedc675ed38aa))
- **deps:** update dependency raw-body to v2.4.3 ([#1705](https://github.com/midwayjs/midway/issues/1705)) ([d4a6b8c](https://github.com/midwayjs/midway/commit/d4a6b8c0a17d5187ac21afd72e8dbf86424fb14f))
- export asyncWrapper from runtime-engine ([#1717](https://github.com/midwayjs/midway/issues/1717)) ([f40d0b9](https://github.com/midwayjs/midway/commit/f40d0b9bbd05025f0472ae0a0e62fd9accb84937))
- passport middleware definition ([#1701](https://github.com/midwayjs/midway/issues/1701)) ([bca3860](https://github.com/midwayjs/midway/commit/bca38603437f7645603feba3cd47ad9b696f8db7))

## v3.0.6 (2022-02-13)

### Bug Fixes

- [#1692](https://github.com/midwayjs/midway/issues/1692) ([#1696](https://github.com/midwayjs/midway/issues/1696)) ([a3ac74a](https://github.com/midwayjs/midway/commit/a3ac74ab1152e8762ab6ae7d6bfa513255de4a56))
- add missing dep ([#1684](https://github.com/midwayjs/midway/issues/1684)) ([fbd02e2](https://github.com/midwayjs/midway/commit/fbd02e2097ba0bbd774c012ebad647608b588e28))
- missing import component will be throw error ([#1694](https://github.com/midwayjs/midway/issues/1694)) ([c17f049](https://github.com/midwayjs/midway/commit/c17f049ef698ba55509e4ef5ea915668345dc50f))
- not found after no router set. ([#1698](https://github.com/midwayjs/midway/issues/1698)) ([c7f466f](https://github.com/midwayjs/midway/commit/c7f466f118008bf001c17f1145deba5fbf2a7827))
- queue service scope ([#1699](https://github.com/midwayjs/midway/issues/1699)) ([d2e46e5](https://github.com/midwayjs/midway/commit/d2e46e5d4ef8af8016a4153bf132fed32770f06f))
- **web:** check type of variable this.app.middleware ([#1688](https://github.com/midwayjs/midway/issues/1688)) ([f69fb5a](https://github.com/midwayjs/midway/commit/f69fb5a59dac41d4457a48a591dc15df8dce36e0))

## v3.0.5 (2022-02-10)

### Bug Fixes

- mock options ([#1681](https://github.com/midwayjs/midway/issues/1681)) ([9680929](https://github.com/midwayjs/midway/commit/9680929b9b4e4e991970879c4925b513969453d2))
- swagger query/param bug ([#1682](https://github.com/midwayjs/midway/issues/1682)) ([c05df75](https://github.com/midwayjs/midway/commit/c05df757bc8fd15d893d0dcf7455fc1b6a12d171))

## v3.0.4 (2022-02-09)

### Bug Fixes

- createFunctionApp ([#1628](https://github.com/midwayjs/midway/issues/1628)) ([8d6f6e8](https://github.com/midwayjs/midway/commit/8d6f6e89786ece993dc3c71cb5cd2e1da69b2732))
- **deps:** update dependency amqp-connection-manager to v4.1.0 ([#1653](https://github.com/midwayjs/midway/issues/1653)) ([9221a49](https://github.com/midwayjs/midway/commit/9221a49f086956d8fd5f8e232a8ea8cbd4cee4b9))
- **deps:** update dependency amqp-connection-manager to v4.1.1 ([#1663](https://github.com/midwayjs/midway/issues/1663)) ([8508913](https://github.com/midwayjs/midway/commit/85089131cdace9e47ec2c46e6d99be9b3c327ecf))
- **deps:** update dependency sequelize to ~6.15.0 ([#1644](https://github.com/midwayjs/midway/issues/1644)) ([eb241f2](https://github.com/midwayjs/midway/commit/eb241f2a3f7aea5c70d28ae1dca265ddf2a78b5a))
- **deps:** update dependency sequelize to ~6.16.0 ([#1677](https://github.com/midwayjs/midway/issues/1677)) ([bf84760](https://github.com/midwayjs/midway/commit/bf8476078801eb34551df242b56345cd2621c6ff))
- **deps:** update dependency ws to v8.5.0 ([#1668](https://github.com/midwayjs/midway/issues/1668)) ([5326c43](https://github.com/midwayjs/midway/commit/5326c43ebf0641a745be1e772c2a5a527dfcb688))
- run in egg cluster mode ([#1645](https://github.com/midwayjs/midway/issues/1645)) ([d6146cc](https://github.com/midwayjs/midway/commit/d6146cccb4ffa9158d87c1f64199bce9f408b43c))
- supertest typings and createFunctionApp ([#1642](https://github.com/midwayjs/midway/issues/1642)) ([484f4f4](https://github.com/midwayjs/midway/commit/484f4f41b3b9e889d4d285f4871a0b37fa51e73f))
- swagger not support more than one @Body ([#1662](https://github.com/midwayjs/midway/issues/1662)) ([a13ec48](https://github.com/midwayjs/midway/commit/a13ec48fa4b3f97f013dc73be409631b4ce2e24e))
- swagger support globalprefix ([#1670](https://github.com/midwayjs/midway/issues/1670)) ([75e83f9](https://github.com/midwayjs/midway/commit/75e83f9fbedb7acbcc20ffac15cb4afaf4513957))
- task typings ([#1678](https://github.com/midwayjs/midway/issues/1678)) ([02aeef6](https://github.com/midwayjs/midway/commit/02aeef69a472709fba97e8250757b6136f859a84))

### Features

- move context format to user config ([#1673](https://github.com/midwayjs/midway/issues/1673)) ([db53b8e](https://github.com/midwayjs/midway/commit/db53b8eaf22b50df61945ff11086e1eb7aec99a1))

## v3.0.3 (2022-01-28)

### Bug Fixes

- crc error in ncc bundle ([#1636](https://github.com/midwayjs/midway/issues/1636)) ([8f1dc91](https://github.com/midwayjs/midway/commit/8f1dc918e914bc30024181466b42f383d98369f2))
- **deps:** update dependency sequelize to ~6.14.0 ([#1617](https://github.com/midwayjs/midway/issues/1617)) ([f29fc0f](https://github.com/midwayjs/midway/commit/f29fc0fb166cafa09e8cfd7e801417ea7731d437))

## v3.0.2 (2022-01-24)

### Bug Fixes

- i18n cookie set ([#1621](https://github.com/midwayjs/midway/issues/1621)) ([582dd97](https://github.com/midwayjs/midway/commit/582dd97d35b91837481e7fca558f68f123210027))
- singleton invoke request scope not valid ([#1622](https://github.com/midwayjs/midway/issues/1622)) ([f97c063](https://github.com/midwayjs/midway/commit/f97c0632107b47cf357d17774a4e4bb5233bba57))

## v3.0.1 (2022-01-24)

### Bug Fixes

- [#1610](https://github.com/midwayjs/midway/issues/1610) use origin args when parameter decorator throw error ([#1613](https://github.com/midwayjs/midway/issues/1613)) ([797ece6](https://github.com/midwayjs/midway/commit/797ece6364b1b512d64aeb82f51ddcb97ef42c0f))
- add missing maxAge ([#1612](https://github.com/midwayjs/midway/issues/1612)) ([5f21909](https://github.com/midwayjs/midway/commit/5f21909104db650e96f1e3445bbbfceadf536c06))
- config key required ([#1615](https://github.com/midwayjs/midway/issues/1615)) ([fb2188e](https://github.com/midwayjs/midway/commit/fb2188eaf5c24ffc9972f73323773a5899825037))
- **deps:** update dependency ws to v8.4.2 ([#1570](https://github.com/midwayjs/midway/issues/1570)) ([932b034](https://github.com/midwayjs/midway/commit/932b034d6fa98dc149ab876df05d081b855ce2bb))
- **serverless-app:** fix findNpmModule in pnp ([#1605](https://github.com/midwayjs/midway/issues/1605)) ([37f46e0](https://github.com/midwayjs/midway/commit/37f46e08811ae43d983e2076a33d16f5f57c795c))
- tablestore ref ([#1616](https://github.com/midwayjs/midway/issues/1616)) ([6b31f4f](https://github.com/midwayjs/midway/commit/6b31f4f00042bed3fb7575b1fff53161e31da243))

### Reverts

- Revert "chore: update ci yml to sync api" ([1ab4994](https://github.com/midwayjs/midway/commit/1ab4994688b55253414f6b8b1478e050ec5940b1))

## v3.0.0 (2022-01-20)

### Bug Fixes

- **deps:** update dependency supertest to v6.2.2 ([#1599](https://github.com/midwayjs/midway/issues/1599)) ([982d888](https://github.com/midwayjs/midway/commit/982d88816e90e43785f4c429608ce8eafed4da81))

### Features

- add favicon middleware and remove koa-onerror ([#1601](https://github.com/midwayjs/midway/issues/1601)) ([2956174](https://github.com/midwayjs/midway/commit/295617498c099982b1c2b3f192ffefb7adbf6b38))
- add hooks doc ([#1606](https://github.com/midwayjs/midway/issues/1606)) ([dd29231](https://github.com/midwayjs/midway/commit/dd29231d9a8093cd2fbb14257b43994307d286be))

# [3.0.0-beta.17](https://github.com/midwayjs/midway/compare/v3.0.0-beta.16...v3.0.0-beta.17) (2022-01-18)

### Bug Fixes

- **deps:** update dependency axios to ^0.25.0 ([#1596](https://github.com/midwayjs/midway/issues/1596)) ([b30f1ae](https://github.com/midwayjs/midway/commit/b30f1aecc66755972f0572692918eb3408e22be2))
- **deps:** update dependency supertest to v6.2.1 ([#1561](https://github.com/midwayjs/midway/issues/1561)) ([0bcde23](https://github.com/midwayjs/midway/commit/0bcde231d562d2daedcbefcdaaa8ddcf5bb9ad58))
- move koa-session and definition ([#1572](https://github.com/midwayjs/midway/issues/1572)) ([95743c1](https://github.com/midwayjs/midway/commit/95743c11917507ccf4c218f5353e1b88917237a5))
- move register to on server ready ([#1576](https://github.com/midwayjs/midway/issues/1576)) ([b5f8256](https://github.com/midwayjs/midway/commit/b5f8256d8cab103e3b9c7f22d5fc66bd5fa6c525))
- remove bodyParser typings ([#1579](https://github.com/midwayjs/midway/issues/1579)) ([a967fdf](https://github.com/midwayjs/midway/commit/a967fdf2cba305804ce2355f7fcdb23db1f09ab2))

### Features

- add static file ([#1597](https://github.com/midwayjs/midway/issues/1597)) ([2e6baae](https://github.com/midwayjs/midway/commit/2e6baae852f338023e39c72801e6c89319dd2e2e))
- Allows the user to provide the response after authentication fa… ([#1567](https://github.com/midwayjs/midway/issues/1567)) ([57efdee](https://github.com/midwayjs/midway/commit/57efdee91ba81d02be6d0e0e0c2566ba30577386))
- security ([#1569](https://github.com/midwayjs/midway/issues/1569)) ([30762cc](https://github.com/midwayjs/midway/commit/30762cc84ed0df090086841f5470c00dfcbebe51))
- support multi root ([#1584](https://github.com/midwayjs/midway/issues/1584)) ([b23dda2](https://github.com/midwayjs/midway/commit/b23dda258563fba143f23c8779680df3ab8ec3d5))
- throw error when singleton invoke request scope ([#1589](https://github.com/midwayjs/midway/issues/1589)) ([e71bfa8](https://github.com/midwayjs/midway/commit/e71bfa8cc43317989adebd4a2f7b6a24a74e36be))

# [3.0.0-beta.16](https://github.com/midwayjs/midway/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2022-01-11)

### Bug Fixes

- @File/@Files schema no type bug ([#1532](https://github.com/midwayjs/midway/issues/1532)) ([a776b3d](https://github.com/midwayjs/midway/commit/a776b3d890ab1faeb3164a42e1dcc953415f8f89))
- **deps:** update dependency amqp-connection-manager to v4 ([#1534](https://github.com/midwayjs/midway/issues/1534)) ([78612e1](https://github.com/midwayjs/midway/commit/78612e13211332112f28e868404473b9fe5a7b75))
- **deps:** update dependency sequelize to ~6.13.0 ([#1554](https://github.com/midwayjs/midway/issues/1554)) ([0a82a2c](https://github.com/midwayjs/midway/commit/0a82a2c698f9b85debf3d09850fb9d350b27bba7))
- **deps:** update dependency supertest to v6.2.0 ([#1555](https://github.com/midwayjs/midway/issues/1555)) ([4ff0e03](https://github.com/midwayjs/midway/commit/4ff0e03e833825b7a79c530665b4ab27b5d25294))
- typings ([4afffe6](https://github.com/midwayjs/midway/commit/4afffe62ddfa97346863691a24065f5820bb9531))

### Features

- swagger tags support ascii order ([#1548](https://github.com/midwayjs/midway/issues/1548)) ([f60438f](https://github.com/midwayjs/midway/commit/f60438f4dcf56538de0a1f0978fde8053660ec4c))

# [3.0.0-beta.15](https://github.com/midwayjs/midway/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2022-01-07)

### Bug Fixes

- **deps:** update socket.io packages to v4.4.1 ([#1528](https://github.com/midwayjs/midway/issues/1528)) ([14b27ea](https://github.com/midwayjs/midway/commit/14b27eaa0eeb479a80d171ede3af3ebda689ec46))
- serverless app run ([#1523](https://github.com/midwayjs/midway/issues/1523)) ([5a25eb7](https://github.com/midwayjs/midway/commit/5a25eb7ebb17bf9b0e2ba4feee5bc1649f70d56f))

### Features

- add data listener ([#1525](https://github.com/midwayjs/midway/issues/1525)) ([0bd0db8](https://github.com/midwayjs/midway/commit/0bd0db8c7f3338c754ae852619bbbb4f2336cc16))
- add info middleware ([#1530](https://github.com/midwayjs/midway/issues/1530)) ([7077f1d](https://github.com/midwayjs/midway/commit/7077f1d84355633a1c2fced35bfcc2152f42a7ac))
- add secret filter ([#1531](https://github.com/midwayjs/midway/issues/1531)) ([ce77e48](https://github.com/midwayjs/midway/commit/ce77e4804aaffc18a0a091d3726e36d7ec1514b2))
- compatible with @File/@Files/@Fields ([#1527](https://github.com/midwayjs/midway/issues/1527)) ([3fe983f](https://github.com/midwayjs/midway/commit/3fe983f2a67c366af370c41df98510adf5dab289))
- cross domain component ([#1493](https://github.com/midwayjs/midway/issues/1493)) ([ca81b2f](https://github.com/midwayjs/midway/commit/ca81b2fa2824fbddc7870a971fa23274c86d05df))
- support hooks 3 ([#1524](https://github.com/midwayjs/midway/issues/1524)) ([1cf446d](https://github.com/midwayjs/midway/commit/1cf446d99ac8bff252820beb7cf7dd036215a864))

# [3.0.0-beta.14](https://github.com/midwayjs/midway/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2022-01-04)

### Bug Fixes

- cos config definition & 3.x doc update ([#1515](https://github.com/midwayjs/midway/issues/1515)) ([0ac7ac5](https://github.com/midwayjs/midway/commit/0ac7ac5805b7ab8873f8792fc1712a74e3223172))
- **deps:** update dependency @grpc/proto-loader to ^0.6.0 ([#1505](https://github.com/midwayjs/midway/issues/1505)) ([67eaee7](https://github.com/midwayjs/midway/commit/67eaee791878908ccad8a1fdaac39ac6786e889e))
- **deps:** update dependency axios to ^0.24.0 ([#1506](https://github.com/midwayjs/midway/issues/1506)) ([d2a7dab](https://github.com/midwayjs/midway/commit/d2a7dab55e6f96528e6087ae503f6328013088fb))
- **deps:** update dependency bull to v4 ([#1511](https://github.com/midwayjs/midway/issues/1511)) ([9100d21](https://github.com/midwayjs/midway/commit/9100d21d0cd29ff948981f1c5616dd996929f6e3))
- **deps:** update dependency cookie-session to v2 ([#1483](https://github.com/midwayjs/midway/issues/1483)) ([ef1c1d1](https://github.com/midwayjs/midway/commit/ef1c1d1b8fd7dd297761e7ed3666c6bc0d496fc2))
- **deps:** update dependency http-errors to v2 ([#1512](https://github.com/midwayjs/midway/issues/1512)) ([f3580e1](https://github.com/midwayjs/midway/commit/f3580e14c55cb3ddbc09c75694c2adc45765d7ad))
- **deps:** update dependency prom-client to v14 ([#1486](https://github.com/midwayjs/midway/issues/1486)) ([87b6678](https://github.com/midwayjs/midway/commit/87b6678b179e239f8dbe5d0adb935df2c713d94b))
- **deps:** update dependency sequelize to ~6.12.0 ([#1509](https://github.com/midwayjs/midway/issues/1509)) ([6f96bf7](https://github.com/midwayjs/midway/commit/6f96bf745761c849c94a8977436dc2955f3d9a3c))
- **deps:** update dependency statuses to v2 ([#1487](https://github.com/midwayjs/midway/issues/1487)) ([5f99204](https://github.com/midwayjs/midway/commit/5f99204f7ca28fbf9c8048bcbba0d9d1eb49d2aa))
- **deps:** update dependency ws to v8 ([#1488](https://github.com/midwayjs/midway/issues/1488)) ([7e71bb4](https://github.com/midwayjs/midway/commit/7e71bb4eeb731d3bf91f0caf06bc9d9acb6297ca))
- upload support auto clean and whitelist ([#1484](https://github.com/midwayjs/midway/issues/1484)) ([7daa037](https://github.com/midwayjs/midway/commit/7daa0371f4a3e79cd4789959d8427fc5b6c91d08))

# [3.0.0-beta.13](https://github.com/midwayjs/midway/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2021-12-30)

### Features

- 404 error ([#1465](https://github.com/midwayjs/midway/issues/1465)) ([e7e8a9d](https://github.com/midwayjs/midway/commit/e7e8a9dedfa7198ac05b161b41024c2871f93965))
- add custom decorator filter ([#1477](https://github.com/midwayjs/midway/issues/1477)) ([97501a9](https://github.com/midwayjs/midway/commit/97501a989abc211b0c7400b1df45e050bb237c6a))

# [3.0.0-beta.12](https://github.com/midwayjs/midway/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2021-12-28)

### Bug Fixes

- 3.x copy all properties ([#1444](https://github.com/midwayjs/midway/issues/1444)) ([21ec8b6](https://github.com/midwayjs/midway/commit/21ec8b6a85b6ba3f4fbff0c8a571484aaa078788))

### Features

- add fileupload support ([#1439](https://github.com/midwayjs/midway/issues/1439)) ([0a81e72](https://github.com/midwayjs/midway/commit/0a81e720f525ddab0718301f44f80fce376f9bfe))
- custom error code & add @Files/@Fields ([#1438](https://github.com/midwayjs/midway/issues/1438)) ([b0032af](https://github.com/midwayjs/midway/commit/b0032afd2fa9ea0416fe69f4bd0c1a58bea5314e))
- support throw err status ([#1440](https://github.com/midwayjs/midway/issues/1440)) ([7b98110](https://github.com/midwayjs/midway/commit/7b98110d65c5287a8fcb3eb5356dea2d7a32cee9))

# [3.0.0-beta.11](https://github.com/midwayjs/midway/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2021-12-21)

**Note:** Version bump only for package midway_project

# [3.0.0-beta.10](https://github.com/midwayjs/midway/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2021-12-20)

### Features

- 3.x swagger ([#1409](https://github.com/midwayjs/midway/issues/1409)) ([e00fbbf](https://github.com/midwayjs/midway/commit/e00fbbf7a494f300a53f3bd8635966364cfd96a9))
- 3.x upload ([#1422](https://github.com/midwayjs/midway/issues/1422)) ([cbd8e33](https://github.com/midwayjs/midway/commit/cbd8e334a918222f526552859401f0cf222737b6))
- add swagger doc & fix bug ([#1427](https://github.com/midwayjs/midway/issues/1427)) ([82dc6f1](https://github.com/midwayjs/midway/commit/82dc6f10f7244a75f58922edda1b0625fc6cb90e))
- default add session & bodyparser support for koa/express/faas ([#1420](https://github.com/midwayjs/midway/issues/1420)) ([cdaff31](https://github.com/midwayjs/midway/commit/cdaff317c3e862a95494a167995a28280af639bf))
- implement i18n for validate ([#1426](https://github.com/midwayjs/midway/issues/1426)) ([4c7ed2f](https://github.com/midwayjs/midway/commit/4c7ed2ff2e7ccf10f88f62abad230f92f5e76b97))
- support express ([61e73db](https://github.com/midwayjs/midway/commit/61e73db509bfea21c8251855fccb02a4ce09988f))

# [3.0.0-beta.9](https://github.com/midwayjs/midway/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2021-12-09)

### Bug Fixes

- faas missing config in framework ([#1413](https://github.com/midwayjs/midway/issues/1413)) ([7ab16a2](https://github.com/midwayjs/midway/commit/7ab16a24b29d5254a762bfffcdf18385effdf639))

# [3.0.0-beta.8](https://github.com/midwayjs/midway/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2021-12-08)

### Bug Fixes

- express routing middleware takes effect at the controller level ([#1364](https://github.com/midwayjs/midway/issues/1364)) ([b9272e0](https://github.com/midwayjs/midway/commit/b9272e0971003443304b0c53815be31a0061b4bd))
- mongoose remote config bug ([#1399](https://github.com/midwayjs/midway/issues/1399)) ([e37602d](https://github.com/midwayjs/midway/commit/e37602d54ae503aeee48afa320709aae3d18b329))
- passport missing proxy file ([#1405](https://github.com/midwayjs/midway/issues/1405)) ([5c9bdae](https://github.com/midwayjs/midway/commit/5c9bdae8323b41ead72c3d3f867aa11150bb3e78))
- typeorm EntityView missing connectionName ([#1403](https://github.com/midwayjs/midway/issues/1403)) ([30b2b37](https://github.com/midwayjs/midway/commit/30b2b3711db485cb85d825d56aeabf53b1374cae))

### Features

- passport add presetProperty ([#1358](https://github.com/midwayjs/midway/issues/1358)) ([4db8eda](https://github.com/midwayjs/midway/commit/4db8eda592c0486898edabcacbc9a69eb2d87004))
- support passport and jwt ([#1343](https://github.com/midwayjs/midway/issues/1343)) ([f26af4f](https://github.com/midwayjs/midway/commit/f26af4f3e16507d6f3ffe0467f8f5be69e6306d7))

# [3.0.0-beta.7](https://github.com/midwayjs/midway/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2021-12-03)

### Bug Fixes

- add app.keys ([#1395](https://github.com/midwayjs/midway/issues/1395)) ([c44afc6](https://github.com/midwayjs/midway/commit/c44afc6cc6764a959d1fa7ae04d60099282d156a))
- middleware with ctx.body ([#1389](https://github.com/midwayjs/midway/issues/1389)) ([77af5c0](https://github.com/midwayjs/midway/commit/77af5c0b456f1843f4dcfd3dbfd2c0aa244c51bd))
- validate typing and config ([#1388](https://github.com/midwayjs/midway/issues/1388)) ([0883569](https://github.com/midwayjs/midway/commit/08835691942183e972359cbaa076db06b6bf85ef))

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

### Bug Fixes

- middleware decorator missing ([#1366](https://github.com/midwayjs/midway/issues/1366)) ([5f9a8c1](https://github.com/midwayjs/midway/commit/5f9a8c1f7cdd940f785f6c9871fb67b9738de940))

# [3.0.0-beta.1](https://github.com/midwayjs/midway/compare/v2.12.4...v3.0.0-beta.1) (2021-11-14)

### Bug Fixes

- add log for 'Internal Server Error' ([#1282](https://github.com/midwayjs/midway/issues/1282)) ([f333466](https://github.com/midwayjs/midway/commit/f333466d138a319b417964cdb9cb065f2b955722))
- ci、build and type error with rabbitmq ([#1253](https://github.com/midwayjs/midway/issues/1253)) ([80ae991](https://github.com/midwayjs/midway/commit/80ae9919e1c21c9e326b5f186f891d14d43495a5))
- circular inject for provide uuid ([#1285](https://github.com/midwayjs/midway/issues/1285)) ([34533bf](https://github.com/midwayjs/midway/commit/34533bfe9bf1c4acdffb1360ab24c716b5196de8))
- component env filter ([#1234](https://github.com/midwayjs/midway/issues/1234)) ([1ad365f](https://github.com/midwayjs/midway/commit/1ad365fd8ef5e0e7dae3d08a2427a2300038290a))
- correct aspect chain bug ([#1204](https://github.com/midwayjs/midway/issues/1204)) ([5de5284](https://github.com/midwayjs/midway/commit/5de5284c70b44acc73eaaad651fd2edc72d54f28))
- disable performance marking for invoke handlers ([#1299](https://github.com/midwayjs/midway/issues/1299)) ([2de9221](https://github.com/midwayjs/midway/commit/2de92214542b8df3abb57b618befde5e161de79e))
- empty options in default ([#1241](https://github.com/midwayjs/midway/issues/1241)) ([802109d](https://github.com/midwayjs/midway/commit/802109ddd098afb04d6d540bff509e0aee85b806))
- encode request path in serverless ([#1230](https://github.com/midwayjs/midway/issues/1230)) ([c826e68](https://github.com/midwayjs/midway/commit/c826e6899c884af9f3365ab77b95449a68889afe))
- find egg plugin in cwd ([#1236](https://github.com/midwayjs/midway/issues/1236)) ([d9ac0ff](https://github.com/midwayjs/midway/commit/d9ac0ff6d4e7a58a8924636806d3894acf94fcd8))
- form-data for egg-layer ([#1097](https://github.com/midwayjs/midway/issues/1097)) ([66057e8](https://github.com/midwayjs/midway/commit/66057e8910c00db0ae2b2ea801cdd94aa063fe84))
- functional configuration load async code ([#1300](https://github.com/midwayjs/midway/issues/1300)) ([32bcf03](https://github.com/midwayjs/midway/commit/32bcf030ed1ab04482dc557f8b0c6904e47b31e1))
- getCustomRepository bug ([#1309](https://github.com/midwayjs/midway/issues/1309)) ([04487a8](https://github.com/midwayjs/midway/commit/04487a8029ac42ed8001ed11a13eb29b846460d8))
- load component with enabledEnvironment ([#1329](https://github.com/midwayjs/midway/issues/1329)) ([3182271](https://github.com/midwayjs/midway/commit/3182271a1eab931e2bf872bff6e2725ebb906ad0))
- node v16 typings ([#1269](https://github.com/midwayjs/midway/issues/1269)) ([e3443b5](https://github.com/midwayjs/midway/commit/e3443b58fc1faddadf1e95dd03a2f319410941bb))
- remove connection key ([#1337](https://github.com/midwayjs/midway/issues/1337)) ([6ac219e](https://github.com/midwayjs/midway/commit/6ac219e786792b32d19a364bffbe9e6318c2f9e1))
- serverless app support applicationContext ([#1281](https://github.com/midwayjs/midway/issues/1281)) ([b692001](https://github.com/midwayjs/midway/commit/b692001c451b17a10d26cb6778a8566d5fa569c5))
- serverless local dev bodyparser limit ([#1245](https://github.com/midwayjs/midway/issues/1245)) ([6bdf378](https://github.com/midwayjs/midway/commit/6bdf37841260b1f77e20d913ee85a45ae41ca559))
- static prefix ([#1321](https://github.com/midwayjs/midway/issues/1321)) ([31fe961](https://github.com/midwayjs/midway/commit/31fe961931fed7656a144b1682ee4c4bb25fdff5))
- winston rotate log size limit in cluster mode ([#1268](https://github.com/midwayjs/midway/issues/1268)) ([09f9d81](https://github.com/midwayjs/midway/commit/09f9d81ac80f660907c5d8a97c897e375bde8ecc))

### Features

- add a process agent component ([#1278](https://github.com/midwayjs/midway/issues/1278)) ([e630fb1](https://github.com/midwayjs/midway/commit/e630fb143ba14eed64436612e9a86afc0d46b42d))
- add cos component ([#1271](https://github.com/midwayjs/midway/issues/1271)) ([c18e597](https://github.com/midwayjs/midway/commit/c18e597d55a6452188cc7daecd0062bf161028cc))
- add ctx.throw for serverless app ([#1262](https://github.com/midwayjs/midway/issues/1262)) ([70008b3](https://github.com/midwayjs/midway/commit/70008b32157286708ec01390b0bf8233ba5a84dd))
- add http2 support ([#1242](https://github.com/midwayjs/midway/issues/1242)) ([6cda27e](https://github.com/midwayjs/midway/commit/6cda27e9e22689e46ace543326b43ae21b134911))
- add mongoose component and support multi-instance for typegoose ([#1334](https://github.com/midwayjs/midway/issues/1334)) ([ca0b73f](https://github.com/midwayjs/midway/commit/ca0b73fec77e8871e4001b4c9d3e45397ce32450))
- add prometheus-socket-io ([#1275](https://github.com/midwayjs/midway/issues/1275)) ([55e2b53](https://github.com/midwayjs/midway/commit/55e2b53e83f9b6756df0ffac2e2d7d791aa2154f))
- add redis component ([#1270](https://github.com/midwayjs/midway/issues/1270)) ([09c993a](https://github.com/midwayjs/midway/commit/09c993ac308d26fa9c742a659471c3f4cf5c5782))
- add sequelize component ([#1283](https://github.com/midwayjs/midway/issues/1283)) ([9ad91d1](https://github.com/midwayjs/midway/commit/9ad91d1e3ef3cf4cd799a1f8ef3d57b7efae60cf))
- add setDiff ([#1263](https://github.com/midwayjs/midway/issues/1263)) ([9dd1a08](https://github.com/midwayjs/midway/commit/9dd1a08326540da52abf79cf31182d4e63b7f4d9))
- add tablestore component and typescript definition ([#1302](https://github.com/midwayjs/midway/issues/1302)) ([aaa4877](https://github.com/midwayjs/midway/commit/aaa4877dc2e6a148346e130dcc6f5401c470eb4c))
- add view, view-ejs and view-nunjucks ([#1308](https://github.com/midwayjs/midway/issues/1308)) ([a00f44b](https://github.com/midwayjs/midway/commit/a00f44bd769052245cd49d49ab417d621bb89caa))
- merge DTO Helper for [#1250](https://github.com/midwayjs/midway/issues/1250) ([#1288](https://github.com/midwayjs/midway/issues/1288)) ([3f8f937](https://github.com/midwayjs/midway/commit/3f8f93765a66f49940565231d50405a7dbd593c7))
- queue support concurrency config ([#1231](https://github.com/midwayjs/midway/issues/1231)) ([67bb7f5](https://github.com/midwayjs/midway/commit/67bb7f50b3dcf80439d1b4b4b9c06f930a8b4468))
- serverless-worker-starter ([#1171](https://github.com/midwayjs/midway/issues/1171)) ([081a3ec](https://github.com/midwayjs/midway/commit/081a3ec360af4f0d771bd4cc5a39b185c87c0307))

## v2.12.4 (2021-08-13)

### Bug Fixes

- post missing data ([#1225](https://github.com/midwayjs/midway/issues/1225)) ([ca99368](https://github.com/midwayjs/midway/commit/ca9936839d407c4c6e1a279eb57338e30a8cbb62))
- update FaasMddleware interface.ts ([#1219](https://github.com/midwayjs/midway/issues/1219)) ([190a729](https://github.com/midwayjs/midway/commit/190a7292d495ebf2af8c66a2257fef41f3362ad1))

## v2.12.3 (2021-08-09)

### Bug Fixes

- decorator manager singleton ([#1211](https://github.com/midwayjs/midway/issues/1211)) ([7e9150e](https://github.com/midwayjs/midway/commit/7e9150ef6805389a1a550361f78e3bb997ae9196))
- task redefine context logger ([#1213](https://github.com/midwayjs/midway/issues/1213)) ([f8887c9](https://github.com/midwayjs/midway/commit/f8887c94b234b0156b8b4c6ad728c97a748c5a4f))

### Features

- support object config load and async config ([#1212](https://github.com/midwayjs/midway/issues/1212)) ([a035ccb](https://github.com/midwayjs/midway/commit/a035ccbb513b0ba423bd2b48bc228b5e916c89e8))
- vercel starter and trigger ([#1199](https://github.com/midwayjs/midway/issues/1199)) ([7d978a2](https://github.com/midwayjs/midway/commit/7d978a2bd46bf0b96c689ace2a9268e31a2e4acd))

## v2.12.2 (2021-08-04)

### Bug Fixes

- change limit for fc ([0546c81](https://github.com/midwayjs/midway/commit/0546c817e8d60a86dfd5dd5703bd96a29e365c27))

## v2.12.1 (2021-08-01)

### Bug Fixes

- add preload modules options ([#1194](https://github.com/midwayjs/midway/issues/1194)) ([1681f42](https://github.com/midwayjs/midway/commit/1681f42157ceaa0950ab5d548c0ff5f84dd9908e))
- server hostname args ([#1196](https://github.com/midwayjs/midway/issues/1196)) ([b9d73f0](https://github.com/midwayjs/midway/commit/b9d73f036befd13c1db28f967fb769459237c52e))

### Features

- add http client component ([#1098](https://github.com/midwayjs/midway/issues/1098)) ([4e2f90a](https://github.com/midwayjs/midway/commit/4e2f90a9de946fa5abc2af4cd8a0ad9ee4188991))

## v2.12.0 (2021-07-30)

### Features

- add oss component ([#1181](https://github.com/midwayjs/midway/issues/1181)) ([e83171c](https://github.com/midwayjs/midway/commit/e83171c73cdc1098796f06919dc652a6d83c3af4))
- add support hostname to http-listening ([#1186](https://github.com/midwayjs/midway/issues/1186)) ([6f8356f](https://github.com/midwayjs/midway/commit/6f8356f610c49f87ce8fb9e7d1e60fbd0527d97c))
- add task log ([#1173](https://github.com/midwayjs/midway/issues/1173)) ([00ca5e8](https://github.com/midwayjs/midway/commit/00ca5e8028141db94d8e2ed0ca2729efdc449e75))
- enhance cache for [#1103](https://github.com/midwayjs/midway/issues/1103) ([#1189](https://github.com/midwayjs/midway/issues/1189)) ([562236c](https://github.com/midwayjs/midway/commit/562236cfa5970d47454f26d92c350165d73a63cd))

## v2.11.7 (2021-07-24)

### Bug Fixes

- add generateMiddleware definition for express app ([#1170](https://github.com/midwayjs/midway/issues/1170)) ([246a244](https://github.com/midwayjs/midway/commit/246a244add49cc1f87b8707bc6403dae8a7b5dae))
- socket listen sequelize ([#1175](https://github.com/midwayjs/midway/issues/1175)) ([84f9b68](https://github.com/midwayjs/midway/commit/84f9b68def0761d48242fa73d64f83de03f582ab))
- test error ([#1174](https://github.com/midwayjs/midway/issues/1174)) ([9f47f64](https://github.com/midwayjs/midway/commit/9f47f64fb2a6388d8b3e1b015c0de40949aa3bdc))

## v2.11.6 (2021-07-16)

### Features

- support ssl ([#1160](https://github.com/midwayjs/midway/issues/1160)) ([2e442ae](https://github.com/midwayjs/midway/commit/2e442ae0c67af93df4f8d2f82cb213744befa8d2))

## v2.11.5 (2021-07-15)

### Bug Fixes

- add missing arg "groupBy?" at exported attachPropertyDataToClass in decoratorManager ([#1146](https://github.com/midwayjs/midway/issues/1146)) ([f4f7a55](https://github.com/midwayjs/midway/commit/f4f7a55d9329cd9167b5a5aa2b58a29db16e1e23))
- cors and trigger bugs in serverless ([#1156](https://github.com/midwayjs/midway/issues/1156)) ([2df53c2](https://github.com/midwayjs/midway/commit/2df53c277bb33d31b5a86cd3daa04b937caedc48))
- find baseDir in egg ([#1154](https://github.com/midwayjs/midway/issues/1154)) ([2fc9a44](https://github.com/midwayjs/midway/commit/2fc9a44fbf20ee6d4da00555114bf5e9e44eb5df))

### Features

- Optimize typeorm to initialize loading entities ([#1150](https://github.com/midwayjs/midway/issues/1150)) ([f0faf2f](https://github.com/midwayjs/midway/commit/f0faf2f1fbdb14f26f157eb554520377c06e6ef8))

## v2.11.4 (2021-07-06)

### Bug Fixes

- @Func decorator with empty metadata ([#1137](https://github.com/midwayjs/midway/issues/1137)) ([621a99a](https://github.com/midwayjs/midway/commit/621a99a9ee77a8f370a28a395363f585057bd054))
- add target parameter ([#1139](https://github.com/midwayjs/midway/issues/1139)) ([5be4757](https://github.com/midwayjs/midway/commit/5be475710ee19e16a99643a355f7f1774f3435bc))
- remove port with other framework ([#1140](https://github.com/midwayjs/midway/issues/1140)) ([88fec38](https://github.com/midwayjs/midway/commit/88fec380ec410bc4c44b30d4d5a751d5341b266f))
- support ignore dsl ([#1133](https://github.com/midwayjs/midway/issues/1133)) ([3ca6c23](https://github.com/midwayjs/midway/commit/3ca6c236d97853fcd7eaed7732fa782b74b45c07))

## v2.11.3 (2021-07-02)

### Bug Fixes

- add origin args ([#1120](https://github.com/midwayjs/midway/issues/1120)) ([fe593fc](https://github.com/midwayjs/midway/commit/fe593fcdbc91f86eb8402f94e12f9ee5d23b1719))
- get complete origin args ([#1130](https://github.com/midwayjs/midway/issues/1130)) ([d652016](https://github.com/midwayjs/midway/commit/d65201666eb4d0326aaecee29e4a91e2f0805245))
- hide real error when user code throw error ([#1128](https://github.com/midwayjs/midway/issues/1128)) ([e728b0b](https://github.com/midwayjs/midway/commit/e728b0b80956c09cfb856ffe082f44fa29cfeb82))
- remove egg dep ([#1118](https://github.com/midwayjs/midway/issues/1118)) ([633cb17](https://github.com/midwayjs/midway/commit/633cb1773dd2133811fe8b500502cabbd3ef0375))
- serverless app invoke args ([#1127](https://github.com/midwayjs/midway/issues/1127)) ([3467b73](https://github.com/midwayjs/midway/commit/3467b73994f755e230e34de36d24b810a65ab854))
- uppercase for header decorator ([#1123](https://github.com/midwayjs/midway/issues/1123)) ([cfcfb1f](https://github.com/midwayjs/midway/commit/cfcfb1fb8860b110e2671e9bff57f6c537f11f90))
- **prometheus:** this.http_server may undefined onStop ([#1124](https://github.com/midwayjs/midway/issues/1124)) ([300a3ec](https://github.com/midwayjs/midway/commit/300a3ec9d308e4f32b7b266f41370dd920145e0b))

## v2.11.2 (2021-06-28)

### Bug Fixes

- add uncaughtException handler ([#1113](https://github.com/midwayjs/midway/issues/1113)) ([8c32165](https://github.com/midwayjs/midway/commit/8c32165daf688a40be5d9b804eb9ebb1bad0fd53))
- logger parameter join output ([#1104](https://github.com/midwayjs/midway/issues/1104)) ([e85e5f1](https://github.com/midwayjs/midway/commit/e85e5f1184e69b0a9aceaabf7f22a4a3df6f0b8f))
- replace ctx.logger in fc serverless environment ([#1112](https://github.com/midwayjs/midway/issues/1112)) ([8ac87b8](https://github.com/midwayjs/midway/commit/8ac87b832154f2ec0fe82df1ec31e283f03b9b2f))

## v2.11.1 (2021-06-19)

### Bug Fixes

- ignore directory with app prefix ([#1100](https://github.com/midwayjs/midway/issues/1100)) ([0911635](https://github.com/midwayjs/midway/commit/09116355bf7f34892d1c7ad975047ed20e65bee5))
- remove emit required parameter ([#1091](https://github.com/midwayjs/midway/issues/1091)) ([54a29d8](https://github.com/midwayjs/midway/commit/54a29d8fe072c15a0b3d1fe9a616d2c84996edc3))

### Features

- add date pattern parameter ([#1102](https://github.com/midwayjs/midway/issues/1102)) ([de4c28e](https://github.com/midwayjs/midway/commit/de4c28e62282d72a0815a6e650e63b2f3c3b2341))
- support EventSubscriberModel with provide ([#1095](https://github.com/midwayjs/midway/issues/1095)) ([05431d2](https://github.com/midwayjs/midway/commit/05431d28b9812cf6f658945b3fe7f69801224559))

## v2.11.0 (2021-06-10)

### Bug Fixes

- rabbitmq reconnection and test ([#1012](https://github.com/midwayjs/midway/issues/1012)) ([c2bea86](https://github.com/midwayjs/midway/commit/c2bea861430a13e53e5b100ea3935f20889c1fff))
- rule required options ([#1000](https://github.com/midwayjs/midway/issues/1000)) ([d76e9f7](https://github.com/midwayjs/midway/commit/d76e9f7473bfe79ff6f07452a2ebad74cce19981))

### Features

- add ws support ([#1058](https://github.com/midwayjs/midway/issues/1058)) ([e73cfcb](https://github.com/midwayjs/midway/commit/e73cfcb0ede82244a4eb8fe7c7612adf5586f47d))
- support close consul service check ([#1083](https://github.com/midwayjs/midway/issues/1083)) ([a632bae](https://github.com/midwayjs/midway/commit/a632bae4c87eeed77b448a65cd2164a9d4f59779))

## v2.10.19 (2021-05-27)

### Bug Fixes

- declare definition error in schedule ([#1076](https://github.com/midwayjs/midway/issues/1076)) ([ec8af5a](https://github.com/midwayjs/midway/commit/ec8af5a35a270855c22b8875c11a0c01a0e78188))

## v2.10.18 (2021-05-26)

### Bug Fixes

- task execute typo ([#1068](https://github.com/midwayjs/midway/issues/1068)) ([20b424d](https://github.com/midwayjs/midway/commit/20b424d9bf7eeca0e9247571000d02d44f342ad9))

### Features

- add decorator metadata ([#1072](https://github.com/midwayjs/midway/issues/1072)) ([db4de9c](https://github.com/midwayjs/midway/commit/db4de9cd787bdbe1effca61dfe162f6678ad5d66))
- add zlib logger file ([#1038](https://github.com/midwayjs/midway/issues/1038)) ([2ae9131](https://github.com/midwayjs/midway/commit/2ae9131b8c8745d2840c40a5d50aa2d3f73bafbf))

## v2.10.17 (2021-05-17)

### Bug Fixes

- serverless app layer ([#1046](https://github.com/midwayjs/midway/issues/1046)) ([0f8dd18](https://github.com/midwayjs/midway/commit/0f8dd18da29eeb76514e203b3ec91cac0928ae15))

## v2.10.16 (2021-05-17)

### Bug Fixes

- **prometheus:** bootstrap for egg ([#1045](https://github.com/midwayjs/midway/issues/1045)) ([aeb0888](https://github.com/midwayjs/midway/commit/aeb0888930d35a3e13a139f30ce4c39710823cfa))

### Features

- **task:** add job parameter for task execute ([#1044](https://github.com/midwayjs/midway/issues/1044)) ([314a1f0](https://github.com/midwayjs/midway/commit/314a1f08dea08ca10ac64a4a408997eefa4352f5))

## v2.10.15 (2021-05-12)

### Bug Fixes

- support aliyun fc cors in local env ([#1041](https://github.com/midwayjs/midway/issues/1041)) ([245925a](https://github.com/midwayjs/midway/commit/245925aaf1a2568c3c90a7d03bc1c6df468b8950))

### Features

- prometheus qps rt ([#1039](https://github.com/midwayjs/midway/issues/1039)) ([398203e](https://github.com/midwayjs/midway/commit/398203e8f371e74a8c0aeff476c814e764e2b5df))

## v2.10.14 (2021-05-11)

### Bug Fixes

- serverless app more method ([#1034](https://github.com/midwayjs/midway/issues/1034)) ([9c44c3f](https://github.com/midwayjs/midway/commit/9c44c3f58930d0c12464d00eceee93cb9e7aaa62))

## v2.10.13 (2021-05-08)

### Bug Fixes

- remove zlib ([#1035](https://github.com/midwayjs/midway/issues/1035)) ([cc2cd40](https://github.com/midwayjs/midway/commit/cc2cd405a104b3388d93a09d981b59b472fd8ea1))

## v2.10.12 (2021-05-07)

### Bug Fixes

- change all requestMethod to real method for serverless http request ([#1028](https://github.com/midwayjs/midway/issues/1028)) ([23e2943](https://github.com/midwayjs/midway/commit/23e29436e3a1b3ab10484171f0dfcd5de068f124))
- disable wait event loop in tencent serverless ([#1029](https://github.com/midwayjs/midway/issues/1029)) ([89d5c2e](https://github.com/midwayjs/midway/commit/89d5c2ec9b83f619d72b31cc003a41bc691a1f19))
- output serverless error in some environment ([#1030](https://github.com/midwayjs/midway/issues/1030)) ([b162b89](https://github.com/midwayjs/midway/commit/b162b897812d1a1a5e981328fbbb43aa75eacf10))
- remove winston-daily-rotate-file ([#1032](https://github.com/midwayjs/midway/issues/1032)) ([ae242c1](https://github.com/midwayjs/midway/commit/ae242c10439b035e42634e723af0a0f9b92da239))
- serverless logger close when runtime stop ([#1022](https://github.com/midwayjs/midway/issues/1022)) ([28548da](https://github.com/midwayjs/midway/commit/28548da888005047123523066ca47207f02eb1c8))
- throw error when router duplicate ([#1023](https://github.com/midwayjs/midway/issues/1023)) ([61bc58d](https://github.com/midwayjs/midway/commit/61bc58d29d637f1c9e54fec0a09f24d90c1286c9))
- use egg-logger got empty logger ([#1031](https://github.com/midwayjs/midway/issues/1031)) ([4077c70](https://github.com/midwayjs/midway/commit/4077c70a71507477c7a5fa15449771cc395bc0c0))

## v2.10.11 (2021-04-29)

### Bug Fixes

- lifecycle missing container when run onStop method ([#1016](https://github.com/midwayjs/midway/issues/1016)) ([3b6303c](https://github.com/midwayjs/midway/commit/3b6303c7bba0d28e821da8062ae71aa4c1029d63))
- load functional config ([#1017](https://github.com/midwayjs/midway/issues/1017)) ([51566c0](https://github.com/midwayjs/midway/commit/51566c08124275798b92d3c931b27a86a48a2ba7))
- logger eol with default value ([#1018](https://github.com/midwayjs/midway/issues/1018)) ([7d3f58d](https://github.com/midwayjs/midway/commit/7d3f58d4841fab12c229591b94f5a488f1841827))
- serverless-app stop need close runtime ([#1015](https://github.com/midwayjs/midway/issues/1015)) ([1bef223](https://github.com/midwayjs/midway/commit/1bef223b5c6bf8225c5ca24f6ff0eeec957d2ac8))

## v2.10.10 (2021-04-24)

### Bug Fixes

- router sort ([#1009](https://github.com/midwayjs/midway/issues/1009)) ([e9bf8ed](https://github.com/midwayjs/midway/commit/e9bf8ed0a6537714e3004a334e417994ea369aa9))
- serverless app support serverless dev ([#1010](https://github.com/midwayjs/midway/issues/1010)) ([bbeeda5](https://github.com/midwayjs/midway/commit/bbeeda5055cfd9dd6988c484354ac701121ae9da))

## v2.10.9 (2021-04-21)

### Bug Fixes

- rabbitmq parameter error ([#1002](https://github.com/midwayjs/midway/issues/1002)) ([cdbd5f9](https://github.com/midwayjs/midway/commit/cdbd5f9e5ba3b1d1e2cf26cb59eaec9447514416))
- revert missing code ([#1006](https://github.com/midwayjs/midway/issues/1006)) ([132bdbb](https://github.com/midwayjs/midway/commit/132bdbb96a88b92b7635072840e58c011ebfcb13))

## v2.10.8 (2021-04-21)

### Bug Fixes

- serverless app typings missing ([#1001](https://github.com/midwayjs/midway/issues/1001)) ([2500f11](https://github.com/midwayjs/midway/commit/2500f11faf8e2308ff6d2bf55910b98e57b48001))

## v2.10.7 (2021-04-17)

### Bug Fixes

- add event name args ([#986](https://github.com/midwayjs/midway/issues/986)) ([bfd8232](https://github.com/midwayjs/midway/commit/bfd82320aee8600d8fa30bd2821a0e68c80fd755))
- add midway case for egg-layer and add warn for DecoratorManager ([#994](https://github.com/midwayjs/midway/issues/994)) ([3d601aa](https://github.com/midwayjs/midway/commit/3d601aa19104081870eb32ba09170357a9da4d03))
- format ([#997](https://github.com/midwayjs/midway/issues/997)) ([456cc14](https://github.com/midwayjs/midway/commit/456cc14513bdb000d1aa3130e9719caf7a8a803f))
- inject class when use component by import string ([#996](https://github.com/midwayjs/midway/issues/996)) ([8bfda7d](https://github.com/midwayjs/midway/commit/8bfda7da4b4a0d34bf0b0d0291416ef4655fb8a5))
- remove reset bootstrap logger ([#993](https://github.com/midwayjs/midway/issues/993)) ([9dc9596](https://github.com/midwayjs/midway/commit/9dc9596fffb6b76897b28ba51d4a1af3e8c6544c))
- serverless logger rotator error ([#992](https://github.com/midwayjs/midway/issues/992)) ([df681b3](https://github.com/midwayjs/midway/commit/df681b34136e66c8bed0f85711163bc4ffb27867))

### Features

- add midway task component ([#995](https://github.com/midwayjs/midway/issues/995)) ([befb81d](https://github.com/midwayjs/midway/commit/befb81dee90f01a20bba2c1835e8685cf85a76e7))

## v2.10.6 (2021-04-14)

### Bug Fixes

- remove eol ([#990](https://github.com/midwayjs/midway/issues/990)) ([e97d5de](https://github.com/midwayjs/midway/commit/e97d5ded9b3e4e3995c99b532bf80586a5324e71))

## v2.10.5 (2021-04-13)

### Bug Fixes

- configuration file path join on windows ([#984](https://github.com/midwayjs/midway/issues/984)) ([099e76c](https://github.com/midwayjs/midway/commit/099e76ca892decd02b536b97494590f598d140ac))
- delay load without layer and egg-cluster ([#985](https://github.com/midwayjs/midway/issues/985)) ([52ba60d](https://github.com/midwayjs/midway/commit/52ba60d67d6e2df7a53609f72ec067dc083317ce))
- serverless app stop ([#988](https://github.com/midwayjs/midway/issues/988)) ([279a3c5](https://github.com/midwayjs/midway/commit/279a3c5682786be8ec5ec34081c8ef700afa2ec9))

### Features

- support getCurrentApplicationContext API ([#981](https://github.com/midwayjs/midway/issues/981)) ([dd6ce11](https://github.com/midwayjs/midway/commit/dd6ce11d6f8eb2884eb1b03b171a069f55aec04f))

## v2.10.4 (2021-04-10)

### Bug Fixes

- clear container cache when test ([#978](https://github.com/midwayjs/midway/issues/978)) ([a202075](https://github.com/midwayjs/midway/commit/a202075b52d281e06f1ed7c6139e968fafc960f6))

## v2.10.3 (2021-04-07)

### Bug Fixes

- scf starter name error ([#972](https://github.com/midwayjs/midway/issues/972)) ([4e5de60](https://github.com/midwayjs/midway/commit/4e5de60e73eaf0722c5bc4efad776c55d73077cf))

## v2.10.2 (2021-04-05)

### Bug Fixes

- load config once and support load singleton service before framework start ([#970](https://github.com/midwayjs/midway/issues/970)) ([201dd59](https://github.com/midwayjs/midway/commit/201dd5930bd97f62e5717777b2941b47b54d68c6))
- serverless event test ([#967](https://github.com/midwayjs/midway/issues/967)) ([e0c15e3](https://github.com/midwayjs/midway/commit/e0c15e316c2813fd574f38bdf6a16a339bfede18))

## v2.10.1 (2021-04-03)

### Bug Fixes

- remove MIDWAY_SERVER_ENV default value ([#966](https://github.com/midwayjs/midway/issues/966)) ([e9f7165](https://github.com/midwayjs/midway/commit/e9f71653612142204c1160efaedc909b41621c3a))

## v2.10.0 (2021-04-02)

### Bug Fixes

- directory filter and ignore test pattern ([#957](https://github.com/midwayjs/midway/issues/957)) ([dbd1a5a](https://github.com/midwayjs/midway/commit/dbd1a5a4bc712a5ce14c409a7f2aee96e34eea4f))

### Features

- **consul:** register to consul server and lookup service with balancer ([#949](https://github.com/midwayjs/midway/issues/949)) ([d5f9916](https://github.com/midwayjs/midway/commit/d5f99167b63102e0e98ef7e5a92368320ef0e0f2))
- support prometheus client ([#963](https://github.com/midwayjs/midway/issues/963)) ([b0edd42](https://github.com/midwayjs/midway/commit/b0edd428cbda986a472b8fa3055de1bdfb54b146))
- use @ServerlessTrigger replace functions in f.yml ([#919](https://github.com/midwayjs/midway/issues/919)) ([a85af14](https://github.com/midwayjs/midway/commit/a85af14e06231e8cd82eff8755794ffd13c3ad95))

## v2.9.3 (2021-03-30)

### Bug Fixes

- bootstrap cache error framework ([#955](https://github.com/midwayjs/midway/issues/955)) ([59ec100](https://github.com/midwayjs/midway/commit/59ec10096418fd1e7be2dbce8f254bce1073e931))
- client ip proxy to real server ([#956](https://github.com/midwayjs/midway/issues/956)) ([fa6d53c](https://github.com/midwayjs/midway/commit/fa6d53cde0f8bcbca875cf69faa08a708746c0bc))
- set error logger key ([#953](https://github.com/midwayjs/midway/issues/953)) ([25b4302](https://github.com/midwayjs/midway/commit/25b4302b16431031aa2c20304848db9a14a8babb))

## v2.9.2 (2021-03-27)

### Bug Fixes

- framework find and sort ([#946](https://github.com/midwayjs/midway/issues/946)) ([2aac414](https://github.com/midwayjs/midway/commit/2aac4142178417ccd0a60a1007e8ce8b53ed4d4f))
- interface in serverless-app ([#947](https://github.com/midwayjs/midway/issues/947)) ([0b56648](https://github.com/midwayjs/midway/commit/0b566483d92d0ddac516e49dccc9218e05019220))
- missing namespace requestContainer ([#942](https://github.com/midwayjs/midway/issues/942)) ([92e4ee6](https://github.com/midwayjs/midway/commit/92e4ee638d657677b1295bb71c033471b850990b))

## v2.9.1 (2021-03-24)

### Bug Fixes

- /user/ => /user ([#941](https://github.com/midwayjs/midway/issues/941)) ([6883400](https://github.com/midwayjs/midway/commit/688340021d145c9ce07a05fdda0c1ad8788959df))
- npe for faas ([#943](https://github.com/midwayjs/midway/issues/943)) ([8c062f9](https://github.com/midwayjs/midway/commit/8c062f994b89a129a710586e517003f9e6524c31))

## v2.9.0 (2021-03-22)

### Bug Fixes

- create log dir in serverless environment ([#935](https://github.com/midwayjs/midway/issues/935)) ([8a15f69](https://github.com/midwayjs/midway/commit/8a15f694a19a6274bce5172f1dce716ef3d8c0a8))
- lint ([8a34e92](https://github.com/midwayjs/midway/commit/8a34e925ea31910596bd03326f582ad9d4bb72e2))
- lint ([467a03b](https://github.com/midwayjs/midway/commit/467a03bebf7499ce6f9f7002043eae2fc83730da))
- providerWrapper get empty object in component ([#926](https://github.com/midwayjs/midway/issues/926)) ([5e46d19](https://github.com/midwayjs/midway/commit/5e46d19386ae91820e9df71a02a3de7b3f54d3dc))

### Features

- add midway cache ([#911](https://github.com/midwayjs/midway/issues/911)) ([cc49eee](https://github.com/midwayjs/midway/commit/cc49eee739ba6d2c37b9270b6cf5239afde4a912))
- add socket.io-redis support ([#874](https://github.com/midwayjs/midway/issues/874)) ([2818920](https://github.com/midwayjs/midway/commit/2818920b9d3391c81666c5b8587a899b9b237d9e))
- run multi framework in one process ([#925](https://github.com/midwayjs/midway/issues/925)) ([330555f](https://github.com/midwayjs/midway/commit/330555f93b9af2a783771edd58bb9431a325938f))
- support bootstrap load config first ([#931](https://github.com/midwayjs/midway/issues/931)) ([ae9ed26](https://github.com/midwayjs/midway/commit/ae9ed261aacdb483d3a9a612be79fff384503bcc))

## v2.8.13 (2021-03-17)

### Bug Fixes

- add missing typings ([#924](https://github.com/midwayjs/midway/issues/924)) ([a17c8d8](https://github.com/midwayjs/midway/commit/a17c8d8655d3f7a93469b922529b7a1aba212c10))

## v2.8.12 (2021-03-14)

### Bug Fixes

- multi package name in grpc client ([#917](https://github.com/midwayjs/midway/issues/917)) ([9e08c93](https://github.com/midwayjs/midway/commit/9e08c938988ee965685d751f33730989893a291c))
- serverless app layers ([#903](https://github.com/midwayjs/midway/issues/903)) ([73cd61a](https://github.com/midwayjs/midway/commit/73cd61aa3d847a1a61322eaf7950f01cd0c77a2d))

## v2.8.11 (2021-03-12)

### Bug Fixes

- load egg router before midway container ready ([#909](https://github.com/midwayjs/midway/issues/909)) ([4640674](https://github.com/midwayjs/midway/commit/4640674c752122ef4706282b55cff2deb097867e))
- validator class extends ([#896](https://github.com/midwayjs/midway/issues/896)) ([ea2edfe](https://github.com/midwayjs/midway/commit/ea2edfe86f19de983dc634c2e53d750feec906ee))

### Features

- add logger dynamic change info method ([#897](https://github.com/midwayjs/midway/issues/897)) ([5a11374](https://github.com/midwayjs/midway/commit/5a113744da64ca31c5e0a1eb18af2fd5739f4c43))
- compatible read config.prod and config.unittest ([#899](https://github.com/midwayjs/midway/issues/899)) ([f90cfe3](https://github.com/midwayjs/midway/commit/f90cfe3a28912ad43f371aff66d4a52e9efa3a68))
- complete static-layer ([#908](https://github.com/midwayjs/midway/issues/908)) ([75033b5](https://github.com/midwayjs/midway/commit/75033b51c89e51e573c0789ec2466447918bcd61))

## v2.8.10 (2021-03-09)

### Bug Fixes

- serverless app layers support ([#892](https://github.com/midwayjs/midway/issues/892)) ([45cd7fe](https://github.com/midwayjs/midway/commit/45cd7fee07223ebb00cf5132cf5b98f372dcdf91))

## v2.8.9 (2021-03-08)

### Bug Fixes

- delete method parse body and form body ([#891](https://github.com/midwayjs/midway/issues/891)) ([f5c1e70](https://github.com/midwayjs/midway/commit/f5c1e7042ed85656e323563421391a719999979e))

## v2.8.8 (2021-03-06)

### Bug Fixes

- app proxy ([#886](https://github.com/midwayjs/midway/issues/886)) ([e8fba77](https://github.com/midwayjs/midway/commit/e8fba77ea9920a9bc0b48011f85d77717cab77fd))
- handler ([#885](https://github.com/midwayjs/midway/issues/885)) ([89c6b53](https://github.com/midwayjs/midway/commit/89c6b53d2de8601394d1799c914dbf8177d37f5b))

## v2.8.7 (2021-03-04)

### Bug Fixes

- exports missing ([#884](https://github.com/midwayjs/midway/issues/884)) ([a360a0e](https://github.com/midwayjs/midway/commit/a360a0e645a9551cb9d90ceaf7871f3e0ab5b4d3))

## v2.8.6 (2021-03-03)

### Bug Fixes

- load custom framework in midwayjs/web ([#883](https://github.com/midwayjs/midway/issues/883)) ([7a11cac](https://github.com/midwayjs/midway/commit/7a11cac1cea753e781ac358a75277400f8aa87bf))

## v2.8.5 (2021-03-03)

### Bug Fixes

- empty framework ready ([#882](https://github.com/midwayjs/midway/issues/882)) ([a2dc36f](https://github.com/midwayjs/midway/commit/a2dc36f8dd785e7dce3a5499f5774b990dfd33c4))

## v2.8.4 (2021-03-03)

### Bug Fixes

- case ([df2efb6](https://github.com/midwayjs/midway/commit/df2efb6837ee1bdb877825bc7869b82d9e220fb1))
- check case ([4df51ed](https://github.com/midwayjs/midway/commit/4df51ed64157a7b3f76bc050825cf2b59182cc07))
- get singleton from shared context ([3ebcf13](https://github.com/midwayjs/midway/commit/3ebcf13ab0f4151e507b51cda219682859f648d3))
- koa-router support wildcard ([#881](https://github.com/midwayjs/midway/issues/881)) ([0321497](https://github.com/midwayjs/midway/commit/0321497421de648dc791ceb60316c78026dc3cf9))
- multi framework run configuration ([44abb6c](https://github.com/midwayjs/midway/commit/44abb6c710e044d9256325c721cdeb8d9a7e0a7a))
- multi framework run configuration ([db98d6a](https://github.com/midwayjs/midway/commit/db98d6aba820aa86982b491835bb4167b3a1b6b2))
- property decorator and class decorator extends ([#845](https://github.com/midwayjs/midway/issues/845)) ([8d0227d](https://github.com/midwayjs/midway/commit/8d0227dfe946af6fefa832d574cdcfe976ed8ce2))
- serverless support ts ([#879](https://github.com/midwayjs/midway/issues/879)) ([8aea51d](https://github.com/midwayjs/midway/commit/8aea51d3e5a25edb81e269c6ca67050411d4bc74))

### Features

- add conflictCheck ([2e08976](https://github.com/midwayjs/midway/commit/2e0897671fd4cb4b36ab351b626347e2f17ace56))
- add conflictCheck ([a892223](https://github.com/midwayjs/midway/commit/a8922234abb2c585d59e37aaa443b14d73a14b2f))

## v2.8.3 (2021-03-01)

### Bug Fixes

- inject definition bug ([#878](https://github.com/midwayjs/midway/issues/878)) ([e11a057](https://github.com/midwayjs/midway/commit/e11a057d25f5205f3641f89e9c8ecd201a2bfdc7))
- router sort with param ([#877](https://github.com/midwayjs/midway/issues/877)) ([7405745](https://github.com/midwayjs/midway/commit/7405745330cbeedc74829bc7683686866d91b633))

## v2.8.2 (2021-02-27)

### Bug Fixes

- remove file options ([#869](https://github.com/midwayjs/midway/issues/869)) ([2287e00](https://github.com/midwayjs/midway/commit/2287e00f617b365ac28b6b2d01d3cf89d0935f9b))

### Features

- support fun router ([#867](https://github.com/midwayjs/midway/issues/867)) ([01e673f](https://github.com/midwayjs/midway/commit/01e673f50d48d302e449ab88c2e419bcaeab1458))

## v2.8.0 (2021-02-24)

### Features

- add router collector and export router table ([#852](https://github.com/midwayjs/midway/issues/852)) ([3641ac9](https://github.com/midwayjs/midway/commit/3641ac9c78ed9888525ce0c87415b961d4602fa8))
- move context logger to @midwayjs/logger and add createFileL… ([#859](https://github.com/midwayjs/midway/issues/859)) ([49f568f](https://github.com/midwayjs/midway/commit/49f568f372b610494d59fa415f4f241c400c7db0))
- support gRPC stream API ([#855](https://github.com/midwayjs/midway/issues/855)) ([bd51c46](https://github.com/midwayjs/midway/commit/bd51c46a1986d9a0666d6af2a1f053ad74560dcc))
- support inject by class ([#832](https://github.com/midwayjs/midway/issues/832)) ([ba5364f](https://github.com/midwayjs/midway/commit/ba5364fcdf9b83c5f778bb7e18d48b821be8f25b))
- support queries decorator ([#858](https://github.com/midwayjs/midway/issues/858)) ([ddb080b](https://github.com/midwayjs/midway/commit/ddb080bbba0b24a4c1f826d8552966275f31ebeb))

## v2.7.7 (2021-02-20)

### Bug Fixes

- add request secure ([#854](https://github.com/midwayjs/midway/issues/854)) ([800d30b](https://github.com/midwayjs/midway/commit/800d30bc0374b208434f328efeeb0c9239063520))
- bootstrap in dev ([#851](https://github.com/midwayjs/midway/issues/851)) ([0e616da](https://github.com/midwayjs/midway/commit/0e616da5a20a1ac5da68d5086b3e0309ce1fdd18))

## v2.7.6 (2021-02-09)

### Bug Fixes

- loggers with egg logger instance and invoke disableConsole method ([#849](https://github.com/midwayjs/midway/issues/849)) ([b5d18e2](https://github.com/midwayjs/midway/commit/b5d18e22764b06b0a9f95e924c475678e78f6b42))

## v2.7.5 (2021-02-08)

### Bug Fixes

- ctx logger overwrite in egg extend ([#846](https://github.com/midwayjs/midway/issues/846)) ([a9d7a0d](https://github.com/midwayjs/midway/commit/a9d7a0dab8db24c970fe6528deb62afcf24c11b0))
- load ready after super.load ([#840](https://github.com/midwayjs/midway/issues/840)) ([e329333](https://github.com/midwayjs/midway/commit/e3293338514909179da31847027f46f23cdc1759))
- stack missing in context logger ([#841](https://github.com/midwayjs/midway/issues/841)) ([7b27145](https://github.com/midwayjs/midway/commit/7b27145ec49c1f89740f8d6f811a00308e90e498))

### Features

- add configuration functional support ([#843](https://github.com/midwayjs/midway/issues/843)) ([bfaa0aa](https://github.com/midwayjs/midway/commit/bfaa0aad9e8ce667a4bb98af60f1c706e09e7810))
- add enable method ([#847](https://github.com/midwayjs/midway/issues/847)) ([a85b99d](https://github.com/midwayjs/midway/commit/a85b99dd775b9cf69dec3a7fa78248d4d82ad814))
- add logger.write method ([#844](https://github.com/midwayjs/midway/issues/844)) ([0051d07](https://github.com/midwayjs/midway/commit/0051d07d22e9cf88828b723861925d75b00a985f))

## v2.7.4 (2021-02-03)

### Bug Fixes

- http parser get body ([#837](https://github.com/midwayjs/midway/issues/837)) ([9afdbbb](https://github.com/midwayjs/midway/commit/9afdbbbd201834ec989f45a4d54cb26883d812e6))

## v2.7.3 (2021-02-02)

### Bug Fixes

- context logger mixin ([#836](https://github.com/midwayjs/midway/issues/836)) ([21c78c2](https://github.com/midwayjs/midway/commit/21c78c2a6d3d313d5e504394abdf2d4e91b71b24))
- egg socket io missing session middleware ([#835](https://github.com/midwayjs/midway/issues/835)) ([6e605a1](https://github.com/midwayjs/midway/commit/6e605a15b64bf51182b393b68d66d0867c571b94))

## v2.7.2 (2021-01-28)

### Bug Fixes

- mock empty options ([#831](https://github.com/midwayjs/midway/issues/831)) ([7668461](https://github.com/midwayjs/midway/commit/7668461c6ba6097cba9f132fc868f180c66b57d8))

## v2.7.1 (2021-01-28)

### Bug Fixes

- disable coreLogger info console output in local env ([#829](https://github.com/midwayjs/midway/issues/829)) ([adaaaea](https://github.com/midwayjs/midway/commit/adaaaeaa9694c072de709c6643c0d7cffbdf3065))

## v2.7.0 (2021-01-27)

### Bug Fixes

- add info level for core logger in local env ([#826](https://github.com/midwayjs/midway/issues/826)) ([8e8fc59](https://github.com/midwayjs/midway/commit/8e8fc59435bd77c917d7ce7bdf4e486492455a61))
- date string error in ISO pattern ([#817](https://github.com/midwayjs/midway/issues/817)) ([6557e95](https://github.com/midwayjs/midway/commit/6557e95f70517900df113aa44d1dc42ee1435e9b))
- midway logger and mixin egg logger will be missing log ([#823](https://github.com/midwayjs/midway/issues/823)) ([ac33af2](https://github.com/midwayjs/midway/commit/ac33af217f59a4b06224cb5d6f7eead007a4da41))

### Features

- add component mongoose ([#805](https://github.com/midwayjs/midway/issues/805)) ([0092831](https://github.com/midwayjs/midway/commit/0092831858d469ebfbd1a678d665aa956ef1f2fa))
- add midway gRPC framework ([#786](https://github.com/midwayjs/midway/issues/786)) ([d90362c](https://github.com/midwayjs/midway/commit/d90362c6bf15c00621ffc2981f19842f216395f8))
- rabbitmq component ([#802](https://github.com/midwayjs/midway/issues/802)) ([d40197a](https://github.com/midwayjs/midway/commit/d40197a66cdff4a49ad16c6cd1a3467003c9a0a1))
- support entry file in bootstrap ([#819](https://github.com/midwayjs/midway/issues/819)) ([49a5ff6](https://github.com/midwayjs/midway/commit/49a5ff662134bdd42dc3a80738b44a05138f8f7c))

## v2.6.13 (2021-01-21)

### Bug Fixes

- fc runtime default ctx ([#813](https://github.com/midwayjs/midway/issues/813)) ([23ad9a2](https://github.com/midwayjs/midway/commit/23ad9a281cbba0e37e3356b15151d8bf08937662))
- file transport context formatter missing ([#815](https://github.com/midwayjs/midway/issues/815)) ([45bd3d5](https://github.com/midwayjs/midway/commit/45bd3d58104e859805f0d7feb84ff17c136966c9))
- optional options ([#811](https://github.com/midwayjs/midway/issues/811)) ([ed3f659](https://github.com/midwayjs/midway/commit/ed3f6594efc32cf2bc9930a687836ae014cb7d90))
- winston-transport build error when enable esModuleInterop ([#814](https://github.com/midwayjs/midway/issues/814)) ([da6e762](https://github.com/midwayjs/midway/commit/da6e762fe32df37307c4f805a38a79f84c36af16))

## v2.6.12 (2021-01-15)

### Bug Fixes

- express router missing ([#804](https://github.com/midwayjs/midway/issues/804)) ([30cd26c](https://github.com/midwayjs/midway/commit/30cd26cc505ea91fb7d0796c59238962c5045b3d))
- mockClassFunction missing ([#807](https://github.com/midwayjs/midway/issues/807)) ([88fa763](https://github.com/midwayjs/midway/commit/88fa7636dbfaba89fb420b70f96cd904630e687c))
- rabbitmq client mock ([#801](https://github.com/midwayjs/midway/issues/801)) ([18d0fcd](https://github.com/midwayjs/midway/commit/18d0fcd24df722ec5a58775fd4d795f22c4e4725))

## v2.6.11 (2021-01-11)

### Bug Fixes

- missing originContext property in http trigger ([#799](https://github.com/midwayjs/midway/issues/799)) ([5cd96a0](https://github.com/midwayjs/midway/commit/5cd96a00bdbd733d89dbcb50e460e4a9392679d5))

## v2.6.10 (2021-01-10)

### Bug Fixes

- bootstrap missing create logger ([#797](https://github.com/midwayjs/midway/issues/797)) ([f7aac5f](https://github.com/midwayjs/midway/commit/f7aac5fcd9a59a3a36856af58c17ee1d0c9dfca4))
- disable logrotator and avoid file exists error ([#798](https://github.com/midwayjs/midway/issues/798)) ([64ac85c](https://github.com/midwayjs/midway/commit/64ac85c68bf479e9474de9ac8f22c491d8bfce39))

## v2.6.9 (2021-01-08)

### Bug Fixes

- remove array type for label and remove verbose level ([#795](https://github.com/midwayjs/midway/issues/795)) ([622163c](https://github.com/midwayjs/midway/commit/622163c30bd3bf89423850caa39ea58433f18df3))

## v2.6.8 (2021-01-06)

### Bug Fixes

- force add logger ([#793](https://github.com/midwayjs/midway/issues/793)) ([f095543](https://github.com/midwayjs/midway/commit/f0955438ba5645daf62b107700f2b01537ecf827))

## v2.6.7 (2021-01-05)

### Bug Fixes

- can't throw error in faas ([#790](https://github.com/midwayjs/midway/issues/790)) ([e740cda](https://github.com/midwayjs/midway/commit/e740cdaec5fbae0c4addb1eefbb428ea0a50d3eb))
- remove error and symbol link in windows ([#792](https://github.com/midwayjs/midway/issues/792)) ([7434724](https://github.com/midwayjs/midway/commit/7434724a2cf422724ea143032ecb6ccb601d7d7f))
- remove log method in ILogger definition ([#791](https://github.com/midwayjs/midway/issues/791)) ([e716349](https://github.com/midwayjs/midway/commit/e71634957c3e3f183c3f7c03e32db27e9ac82017))

## v2.6.6 (2021-01-04)

**Note:** Version bump only for package midway

## v2.6.5 (2021-01-04)

### Bug Fixes

- egg logger definition ([#788](https://github.com/midwayjs/midway/issues/788)) ([a5464f4](https://github.com/midwayjs/midway/commit/a5464f48f5e7f7aee71fadf8e26b187b5802fe24))

## v2.6.4 (2021-01-02)

### Bug Fixes

- definition fix for getLogger and getCoreLogger ([#783](https://github.com/midwayjs/midway/issues/783)) ([264b481](https://github.com/midwayjs/midway/commit/264b4819f8f96dccabd1e5cd6ad2c7b3b8277136))

## v2.6.3 (2020-12-30)

### Bug Fixes

- add more args for egg transport ([#782](https://github.com/midwayjs/midway/issues/782)) ([adbbfc9](https://github.com/midwayjs/midway/commit/adbbfc9f98c0e9d5617e37232113e7f1e2f92a15))

## v2.6.2 (2020-12-30)

### Bug Fixes

- output logs dir when development env ([#780](https://github.com/midwayjs/midway/issues/780)) ([557d874](https://github.com/midwayjs/midway/commit/557d8743cf5183740b25a987b1a1135ea09c9d28))

## v2.6.1 (2020-12-29)

### Bug Fixes

- logger build ([#779](https://github.com/midwayjs/midway/issues/779)) ([ee3589e](https://github.com/midwayjs/midway/commit/ee3589e0bed5d79fade9c2067de1452eeb718da4))

## v2.6.0 (2020-12-28)

### Bug Fixes

- egg layer x forwarded for ([#768](https://github.com/midwayjs/midway/issues/768)) ([568379f](https://github.com/midwayjs/midway/commit/568379fca58744410b273cc6fdb40cec83700d08))
- ouput console in serverless environment ([#759](https://github.com/midwayjs/midway/issues/759)) ([bad20d7](https://github.com/midwayjs/midway/commit/bad20d7950d1ed96a0448aedfac5ae8f909a7960))
- parse http is type ([#763](https://github.com/midwayjs/midway/issues/763)) ([ee77af5](https://github.com/midwayjs/midway/commit/ee77af5e32b36807ddc5d05555826b8562ec6769))

### Features

- add midway logger ([#743](https://github.com/midwayjs/midway/issues/743)) ([13e8cc7](https://github.com/midwayjs/midway/commit/13e8cc753d994e6f9f073688e22527f75d39984a))
- support https config for web/koa/express ([#742](https://github.com/midwayjs/midway/issues/742)) ([a0c07b9](https://github.com/midwayjs/midway/commit/a0c07b9e3cc2eec7e88e49085f1e66242fa1ec50))

## v2.5.5 (2020-12-15)

### Bug Fixes

- aspect wrapper requestContext instance ([#755](https://github.com/midwayjs/midway/issues/755)) ([84193a0](https://github.com/midwayjs/midway/commit/84193a0a50483a0ec8e25b25a17654d4fc77ed1d))

## v2.5.4 (2020-12-12)

### Bug Fixes

- monorepo use different cwd ([#752](https://github.com/midwayjs/midway/issues/752)) ([cb3ba35](https://github.com/midwayjs/midway/commit/cb3ba35343101c1cb34cc10bdd31237c226266bb))

## v2.5.3 (2020-12-11)

### Bug Fixes

- runtime mock support initHandler ([#749](https://github.com/midwayjs/midway/issues/749)) ([0b993be](https://github.com/midwayjs/midway/commit/0b993beff72ef648dc438dda4d0214f4e3b13954))
- support eggjs in monorepo ([#751](https://github.com/midwayjs/midway/issues/751)) ([18c32b9](https://github.com/midwayjs/midway/commit/18c32b980167dd9a3547b0a930a043f9c37f86ad))

## v2.5.2 (2020-12-04)

### Bug Fixes

- definition for getAsync and get ([#740](https://github.com/midwayjs/midway/issues/740)) ([d40de78](https://github.com/midwayjs/midway/commit/d40de7899f3b816c61229dce463d9b2de6842259))
- ignore set body after user set status ([#741](https://github.com/midwayjs/midway/issues/741)) ([4fdb2a6](https://github.com/midwayjs/midway/commit/4fdb2a62c0ff694aa0b6bffaec3386a36d4334c9))

## v2.5.1 (2020-11-29)

### Bug Fixes

- return ctx.body and set header after send ([#738](https://github.com/midwayjs/midway/issues/738)) ([4c8e740](https://github.com/midwayjs/midway/commit/4c8e740865ece6a62176144a877863c1d5317d65))

## v2.5.0 (2020-11-28)

### Bug Fixes

- got egg env from serverEnv ([#735](https://github.com/midwayjs/midway/issues/735)) ([ac19c94](https://github.com/midwayjs/midway/commit/ac19c94a708cb6c5798ae43b04c7e5e5a8382b6c))
- koa response 204 ([#733](https://github.com/midwayjs/midway/issues/733)) ([2463d77](https://github.com/midwayjs/midway/commit/2463d77cf2d9b03216acff901839816be45c5e73))

### Features

- add getFunctionName() and functionSerivceName() method to runtime and faas framework ([#734](https://github.com/midwayjs/midway/issues/734)) ([f0bc5aa](https://github.com/midwayjs/midway/commit/f0bc5aadd224e6ec85691b9c82cc7993cbc32cdb))

## v2.4.8 (2020-11-24)

### Bug Fixes

- use egg-layer load framework circular reference ([#730](https://github.com/midwayjs/midway/issues/730)) ([f012d78](https://github.com/midwayjs/midway/commit/f012d78599fa0f877937cdb0caaec04da518b917))

## v2.4.7 (2020-11-23)

**Note:** Version bump only for package midway

## v2.4.6 (2020-11-19)

**Note:** Version bump only for package midway

## v2.4.5 (2020-11-19)

### Bug Fixes

- core middleware load ([#724](https://github.com/midwayjs/midway/issues/724)) ([9697834](https://github.com/midwayjs/midway/commit/96978348412284b421adff4be1bdacc1a539fc64))
- get function args error ([#725](https://github.com/midwayjs/midway/issues/725)) ([7ec5317](https://github.com/midwayjs/midway/commit/7ec531776efc65a84d60a7c55dc29ad4e08d999a))

## v2.4.4 (2020-11-17)

### Bug Fixes

- remove error process env branch ([#723](https://github.com/midwayjs/midway/issues/723)) ([53ddc4c](https://github.com/midwayjs/midway/commit/53ddc4caec322162889e50f21b50aef96907a607))

## v2.4.3 (2020-11-16)

### Bug Fixes

- aspect mapping npe ([#722](https://github.com/midwayjs/midway/issues/722)) ([1954eed](https://github.com/midwayjs/midway/commit/1954eed145cbb8fc929394f6cb0c1bc8cb80c823))
- fc egg app body parse ([#719](https://github.com/midwayjs/midway/issues/719)) ([18c0aad](https://github.com/midwayjs/midway/commit/18c0aad1d9a187d59da6d9f11940ef82b2770ff0))

## v2.4.2 (2020-11-13)

### Bug Fixes

- error pattern for ignore node_modules ([#717](https://github.com/midwayjs/midway/issues/717)) ([16f1292](https://github.com/midwayjs/midway/commit/16f1292359b8c65548eea3926de8eaaa13133538))

## v2.4.1 (2020-11-12)

### Bug Fixes

- first schedule ignore stop other schedule ([#715](https://github.com/midwayjs/midway/issues/715)) ([d296636](https://github.com/midwayjs/midway/commit/d2966361cbaf33bc8f53c30c097bbbd3e64a139f))
- load ignore node_modules ([#714](https://github.com/midwayjs/midway/issues/714)) ([ad13f13](https://github.com/midwayjs/midway/commit/ad13f1357263fad143ad18527a3c04bd4a629798))

## v2.4.0 (2020-11-11)

### Bug Fixes

- mock method missing ([#710](https://github.com/midwayjs/midway/issues/710)) ([0088cb2](https://github.com/midwayjs/midway/commit/0088cb2253f4f99dc945a5fc99b580bfa4d4a594))

### Features

- support define custom egg framework ([#709](https://github.com/midwayjs/midway/issues/709)) ([f5baba1](https://github.com/midwayjs/midway/commit/f5baba18d10e3dc91ba9651effadd00b8f66cf8b))
- **hooks:** use app hooks ([#708](https://github.com/midwayjs/midway/issues/708)) ([faf05c5](https://github.com/midwayjs/midway/commit/faf05c5cdba3e743568db74720f4927374c15f19))

## v2.3.23 (2020-11-03)

### Bug Fixes

- delay loader.load after midway bootstrap init ([#699](https://github.com/midwayjs/midway/issues/699)) ([2d12a55](https://github.com/midwayjs/midway/commit/2d12a551707099e0fc7ea188466190e63d02a29a))
- trigger lifecycle after egg load ([#701](https://github.com/midwayjs/midway/issues/701)) ([4d63e3a](https://github.com/midwayjs/midway/commit/4d63e3ae38f9d8492894353b1794f1b571790e9d))

## v2.3.22 (2020-10-31)

### Bug Fixes

- aspect bind missing ctx ([#694](https://github.com/midwayjs/midway/issues/694)) ([871ea80](https://github.com/midwayjs/midway/commit/871ea80b8090e28f02dc74405de5da3969ccf5c4))

## v2.3.21 (2020-10-29)

### Bug Fixes

- setHeader loop with array ([#691](https://github.com/midwayjs/midway/issues/691)) ([9ed5acc](https://github.com/midwayjs/midway/commit/9ed5acc0f136a2dc6d013b1fd0ee0ab9b7546eab))

## v2.3.20 (2020-10-29)

### Bug Fixes

- missing router options ([#689](https://github.com/midwayjs/midway/issues/689)) ([b1693b8](https://github.com/midwayjs/midway/commit/b1693b885a0804f4924616bf0bdafd98b4698d4e))

## v2.3.19 (2020-10-28)

### Features

- add swagger description meta for swagger

## v2.3.18 (2020-10-27)

### Bug Fixes

- configuration inject plugin and more in production environment ([#680](https://github.com/midwayjs/midway/issues/680)) ([41bce5d](https://github.com/midwayjs/midway/commit/41bce5d8a60a6fde61ff62794612eecff2e260ed))

## v2.3.17 (2020-10-22)

**Note:** Version bump only for package midway

## v2.3.16 (2020-10-16)

### Bug Fixes

- use new ctx bind req and res in express ([#674](https://github.com/midwayjs/midway/issues/674)) ([1d26396](https://github.com/midwayjs/midway/commit/1d2639698e8e292fe12506a6e530a6d032f46d7e))

## v2.3.15 (2020-10-15)

**Note:** Version bump only for package midway

## v2.3.14 (2020-10-15)

**Note:** Version bump only for package midway

## v2.3.13 (2020-10-13)

### Bug Fixes

- [@plugin](https://github.com/plugin) inject undefined in web middleware ([#667](https://github.com/midwayjs/midway/issues/667)) ([cacb2fa](https://github.com/midwayjs/midway/commit/cacb2faa61258172ef445db0a86e45c3f19014a6))
- when middleware config options is undefined, options.match ([#670](https://github.com/midwayjs/midway/issues/670)) ([1893049](https://github.com/midwayjs/midway/commit/18930498434d8bc0254fa1db013346443a96e9f5))
- when middleware config options is undefined. options.enable expr… ([#668](https://github.com/midwayjs/midway/issues/668)) ([3378ea4](https://github.com/midwayjs/midway/commit/3378ea41d0715e4451fb1cda3e72612d458582b0))

## v2.3.12 (2020-10-10)

### Bug Fixes

- egg framework support ignore and match ([#666](https://github.com/midwayjs/midway/issues/666)) ([b541dc0](https://github.com/midwayjs/midway/commit/b541dc0a5437c172d835d215022096bbb2a4889e))

## v2.3.11 (2020-10-08)

**Note:** Version bump only for package midway

## v2.3.10 (2020-10-08)

### Bug Fixes

- component inject global object and add case ([#663](https://github.com/midwayjs/midway/issues/663)) ([e768ee8](https://github.com/midwayjs/midway/commit/e768ee872ed9855252346920318a32133328c0fe))

### Features

- replace configuration.imports to object directly and deprecated string ([#657](https://github.com/midwayjs/midway/issues/657)) ([f1b42a1](https://github.com/midwayjs/midway/commit/f1b42a1b338a69cdfaf63e2d951a65333e4f3007))

## v2.3.9 (2020-10-05)

### Bug Fixes

- include files ([#661](https://github.com/midwayjs/midway/issues/661)) ([d48e145](https://github.com/midwayjs/midway/commit/d48e145198939cb5bb2a396edbd438cbd531ca3c))

## v2.3.8 (2020-10-05)

### Bug Fixes

- schedule case ([#660](https://github.com/midwayjs/midway/issues/660)) ([c9fb3fb](https://github.com/midwayjs/midway/commit/c9fb3fbe5e4edff5e89e11bfbe19c5fcc3515883))

## v2.3.7 (2020-10-04)

### Bug Fixes

- transform type after validate ([#659](https://github.com/midwayjs/midway/issues/659)) ([2b30ba7](https://github.com/midwayjs/midway/commit/2b30ba77d0c897d84d8a6f3222b60c083ec3e869))

## v2.3.6 (2020-10-02)

### Bug Fixes

- fix core pkg name ([#656](https://github.com/midwayjs/midway/issues/656)) ([2d26b0d](https://github.com/midwayjs/midway/commit/2d26b0d3cd6bb541295deb2b5b5c13d955f8587d))
- implement optional dep for amqplib in mock package ([#654](https://github.com/midwayjs/midway/issues/654)) ([3319872](https://github.com/midwayjs/midway/commit/33198727855ff042db7d96723992b49c632aa25d))

### Features

- add request path and ip decorator ([#655](https://github.com/midwayjs/midway/issues/655)) ([3354c26](https://github.com/midwayjs/midway/commit/3354c263c92957fd68b90c383c33afc6ad9ae967))

## v2.3.4 (2020-09-28)

**Note:** Version bump only for package midway

## v2.3.3 (2020-09-28)

### Bug Fixes

- egg definition ([#650](https://github.com/midwayjs/midway/issues/650)) ([3e2f1e9](https://github.com/midwayjs/midway/commit/3e2f1e9d65d37acf1f80ece022a7471d09975b30))

## v2.3.2 (2020-09-28)

### Bug Fixes

- component get config and merge egg config ([#649](https://github.com/midwayjs/midway/issues/649)) ([aa95a3e](https://github.com/midwayjs/midway/commit/aa95a3eb9ff70d691c2420e58b357e2889d03ebb))

## v2.3.1 (2020-09-27)

### Bug Fixes

- fix debugger logger create in every request ([#648](https://github.com/midwayjs/midway/issues/648)) ([8e70fb0](https://github.com/midwayjs/midway/commit/8e70fb0b57241bb6e0b2fcca5c4fa2b26fc2eb5e))

## v2.3.0 (2020-09-27)

### Features

- add rabbitmq ([#647](https://github.com/midwayjs/midway/issues/647)) ([2c03eb4](https://github.com/midwayjs/midway/commit/2c03eb4f5e979d309048a11f17f7579a1d299ba1))

## v2.2.10 (2020-09-24)

### Bug Fixes

- query decorator with empty args ([#646](https://github.com/midwayjs/midway/issues/646)) ([815e230](https://github.com/midwayjs/midway/commit/815e2308e8f40601ee3b94a3ccb2b1567dc03b9f))

## v2.2.9 (2020-09-24)

### Bug Fixes

- remove sourcemap and src in dist ([#645](https://github.com/midwayjs/midway/issues/645)) ([e561a88](https://github.com/midwayjs/midway/commit/e561a88f4a70af15d4be3d5fe0bd39487677d4ce))

## v2.2.8 (2020-09-23)

### Bug Fixes

- fix validate error ([e6e58d3](https://github.com/midwayjs/midway/commit/e6e58d371cbc52ddf51a7d03de48ef44b020aaa9))

## v2.2.7 (2020-09-20)

### Bug Fixes

- WebMiddleare to IWebMiddleware ([e69cf28](https://github.com/midwayjs/midway/commit/e69cf286fa76ab3144404806c5cbbe8642cdcd61))

## v2.2.6 (2020-09-18)

### Features

- add aop ([#640](https://github.com/midwayjs/midway/issues/640)) ([c3e15b3](https://github.com/midwayjs/midway/commit/c3e15b328c184318e364bf40d32fa4df6be2a30a))

## v2.2.5 (2020-09-17)

### Bug Fixes

- move @types/joi to dependencies ([#638](https://github.com/midwayjs/midway/issues/638)) ([7c31164](https://github.com/midwayjs/midway/commit/7c31164ae8959b00213527c7fb384a07929790b9))

### Features

- add generateMiddleware for express and faas ([bfcfc9a](https://github.com/midwayjs/midway/commit/bfcfc9a377f01026a459aaed35a3f0fdf0530f26))
- add property for web params ([5c19644](https://github.com/midwayjs/midway/commit/5c1964482b4c8efe0ac23c3c1feb1f48ce5b7889))
- use midway cli replace egg-bin ([#639](https://github.com/midwayjs/midway/issues/639)) ([62bbf38](https://github.com/midwayjs/midway/commit/62bbf3852899476600a0b594cb7dc274b05e29ec))

## v2.2.4 (2020-09-15)

### Bug Fixes

- support midway global middleware use id ([8dc9ae3](https://github.com/midwayjs/midway/commit/8dc9ae33acd559d74f144a75f08fc039037fa45b))

### Features

- type extension bootstrap ([71f9358](https://github.com/midwayjs/midway/commit/71f9358b736b9e5f7f8c604be38ca53582863e1e))

## v2.2.3 (2020-09-14)

### Bug Fixes

- remove midway-bin dep ([632bd96](https://github.com/midwayjs/midway/commit/632bd96d105b554b8523fd7d24af60f00e67f01d))

## v2.2.2 (2020-09-14)

### Bug Fixes

- add missing typing dep ([083395f](https://github.com/midwayjs/midway/commit/083395f76709e4b5e8c32e7a9f89d839d8e16b5f))

## v2.2.1 (2020-09-14)

### Bug Fixes

- add missing typing dep ([09a9473](https://github.com/midwayjs/midway/commit/09a9473d0ddc73b7e9e624e1bed1fe58691e36ec))
- fix default logger dir ([ce0e06a](https://github.com/midwayjs/midway/commit/ce0e06ab1cc121074d0b64e35c127982f7b27296))
- fix some problem in 2.x boilerplate ([80608a1](https://github.com/midwayjs/midway/commit/80608a18f5f04798028e1a5c33a264753ee61121))

## v2.2.0 (2020-09-13)

### Features

- complete 2.x beta ([#630](https://github.com/midwayjs/midway/issues/630)) ([b23cd00](https://github.com/midwayjs/midway/commit/b23cd00fe9cefc9057a2284d38d5419773539206))
- parameters validation ([#451](https://github.com/midwayjs/midway/issues/451)) ([92735b0](https://github.com/midwayjs/midway/commit/92735b009b59ed150b946a387c5ae56893bee53a))

## v2.1.4 (2020-06-17)

### Bug Fixes

- 2.x extends bug ([#498](https://github.com/midwayjs/midway/issues/498)) ([19ec029](https://github.com/midwayjs/midway/commit/19ec0292eedd94cb2e40e69af8897703fc8f55c7))

## v2.1.3 (2020-05-07)

### Bug Fixes

- configuration use package name ([#485](https://github.com/midwayjs/midway/issues/485)) ([a00cb18](https://github.com/midwayjs/midway/commit/a00cb189b10a7353f6e0545c17837e8c9b10ca2c))

## v2.1.2 (2020-05-02)

### Bug Fixes

- fix util import ([7d76cbf](https://github.com/midwayjs/midway/commit/7d76cbf4cedc31b141adc76194c89a284e4fe8ee))
- fix wrap app ([c16ea0b](https://github.com/midwayjs/midway/commit/c16ea0b0a0d02539f80586c5a08a027a28ce2d00))

## v2.1.1 (2020-04-30)

### Bug Fixes

- add metadata when configuration load controller ([#483](https://github.com/midwayjs/midway/issues/483)) ([e4e3c57](https://github.com/midwayjs/midway/commit/e4e3c5784df844a290a57a3d309a5f4e866e4831))

## v2.1.0 (2020-04-29)

### Features

- refactor hook & add @App ([#482](https://github.com/midwayjs/midway/issues/482)) ([3bfd300](https://github.com/midwayjs/midway/commit/3bfd300daf21fce96f2ff92be22ecb0f12bdd033))

## v2.0.17 (2020-04-21)

### Bug Fixes

- fix export service method ([#477](https://github.com/midwayjs/midway/issues/477)) ([586b0be](https://github.com/midwayjs/midway/commit/586b0be05ee9ef38cef9d312f19de4318c2b1701))
- fun typing ([#467](https://github.com/midwayjs/midway/issues/467)) ([fdf2814](https://github.com/midwayjs/midway/commit/fdf28148da961d20961c95ecea128e92e3bc9819))

## v2.0.16 (2020-04-12)

### Bug Fixes

- Fix cov ([#469](https://github.com/midwayjs/midway/issues/469)) ([1d65da9](https://github.com/midwayjs/midway/commit/1d65da96c34b46fc0e81373c137545613fb1d7b7))

## v2.0.15 (2020-04-11)

### Bug Fixes

- Fix default env ([#468](https://github.com/midwayjs/midway/issues/468)) ([db9ffcf](https://github.com/midwayjs/midway/commit/db9ffcfcc412bfb7613d46eb3b3b30f44e3b553f)), closes [#450](https://github.com/midwayjs/midway/issues/450) [#454](https://github.com/midwayjs/midway/issues/454) [#379](https://github.com/midwayjs/midway/issues/379) [#455](https://github.com/midwayjs/midway/issues/455) [#463](https://github.com/midwayjs/midway/issues/463) [#464](https://github.com/midwayjs/midway/issues/464) [#466](https://github.com/midwayjs/midway/issues/466)

## v2.0.14 (2020-04-08)

**Note:** Version bump only for package midway

## v2.0.13 (2020-04-07)

**Note:** Version bump only for package midway

## v2.0.12 (2020-04-07)

### Bug Fixes

- 2.x fix conflicts ([#458](https://github.com/midwayjs/midway/issues/458)) ([2b0f44c](https://github.com/midwayjs/midway/commit/2b0f44c6d4c91154fb8a7779b6789acbb2635b1b))
- 2.x fix conflicts ([#459](https://github.com/midwayjs/midway/issues/459)) ([e9f689c](https://github.com/midwayjs/midway/commit/e9f689c07efec3078c77557f29ea9ecdb5659094))

## v2.0.11 (2020-04-07)

### Bug Fixes

- fix dfs circular ([#457](https://github.com/midwayjs/midway/issues/457)) ([8b91326](https://github.com/midwayjs/midway/commit/8b9132604df041dad5f1124389d49f75c288aff5))

## v2.0.10 (2020-03-31)

**Note:** Version bump only for package midway

## v2.0.9 (2020-03-30)

### Bug Fixes

- @Func return type ([#452](https://github.com/midwayjs/midway/issues/452)) ([9064743](https://github.com/midwayjs/midway/commit/9064743c04713ef77ef246416dabe8f79b97fc79))

## v2.0.8 (2020-03-30)

### Bug Fixes

- 2.x conflict 能力 ([#449](https://github.com/midwayjs/midway/issues/449)) ([6064ecf](https://github.com/midwayjs/midway/commit/6064ecf0fcf0f79ca9f9f177b06baef6d65ca7ea))

## v2.0.7 (2020-03-30)

**Note:** Version bump only for package midway

## v2.0.6 (2020-03-27)

### Bug Fixes

- configuration with ctx ([4c7ff6a](https://github.com/midwayjs/midway/commit/4c7ff6ade50a1048c465d50145f0aedcb1ec30d3))

## v2.0.5 (2020-03-22)

### Bug Fixes

- can midway build when tsconfig.json has comments ([#424](https://github.com/midwayjs/midway/issues/424)) ([f2b2713](https://github.com/midwayjs/midway/commit/f2b27137fe35d1de462adfdc289953d6a405ecd9))
- lazy get default framework ([#430](https://github.com/midwayjs/midway/issues/430)) ([c8c4b49](https://github.com/midwayjs/midway/commit/c8c4b49dd66d197b10bafd24aba55f42672d7d59))
- mock fn ([#439](https://github.com/midwayjs/midway/issues/439)) ([d0a36e4](https://github.com/midwayjs/midway/commit/d0a36e4ff15493603ebb334dc746d64fed300627))

## v2.0.4 (2020-03-19)

### Bug Fixes

- 2.x fix lifecycle bug ([#435](https://github.com/midwayjs/midway/issues/435)) ([22d3e12](https://github.com/midwayjs/midway/commit/22d3e121d98575e994282c93b7522ddcf76942be))

## v2.0.3 (2020-03-19)

**Note:** Version bump only for package midway

## v2.0.2 (2020-03-13)

### Bug Fixes

- Add export hsf ([#422](https://github.com/midwayjs/midway/issues/422)) ([55f1e43](https://github.com/midwayjs/midway/commit/55f1e43fbb9bd442939a6bb504aa721297eaf631))

## v2.0.1 (2020-03-13)

### Features

- add hsf decorator ([#421](https://github.com/midwayjs/midway/issues/421)) ([d5afed3](https://github.com/midwayjs/midway/commit/d5afed3ace4e3570b29a2c789b2683f0cd4fd697))

## v2.0.0 (2020-03-13)

**Note:** Version bump only for package midway

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
- feat(eslint-midway-contrib): add pkg for js and ts ([#397](https://github.com/midwayjs/midway/issues/397)) ([3b404a5](https://github.com/midwayjs/midway/commit/3b404a5ed92e6843766634b78db1aa6f321191d8))
- MidwayRequestContainer 增加泛型标注 ([#407](https://github.com/midwayjs/midway/issues/407)) ([b206035](https://github.com/midwayjs/midway/commit/b20603577a99f31ece9720d5f7893c2af7905887))

# [2.0.0-beta.14](https://github.com/midwayjs/midway/compare/v2.0.0-beta.13...v2.0.0-beta.14) (2020-03-04)

### Features

- 2.x pipeline ([#406](https://github.com/midwayjs/midway/issues/406)) ([9eb3e10](https://github.com/midwayjs/midway/commit/9eb3e100ebac966cf58713d4d3f021cd44971150))

# [2.0.0-beta.13](https://github.com/midwayjs/midway/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2020-02-26)

### Bug Fixes

- configuration load config bug ([#404](https://github.com/midwayjs/midway/issues/404)) ([5e18763](https://github.com/midwayjs/midway/commit/5e187633b58e76b606a95063056d670e234c1d22))

**Note:** Version bump only for package midway

# [2.0.0-beta.12](https://github.com/midwayjs/midway/compare/v2.0.0-beta.11...v2.0.0-beta.12) (2020-02-25)

### Bug Fixes

- namespace @ bugfix ([#402](https://github.com/midwayjs/midway/issues/402)) ([e546219](https://github.com/midwayjs/midway/commit/e5462191ec293f98db46cfa59efc446124e2e381))

# [2.0.0-beta.11](https://github.com/midwayjs/midway/compare/v2.0.0-beta.10...v2.0.0-beta.11) (2020-02-25)

### Bug Fixes

- configuration bugs ([#401](https://github.com/midwayjs/midway/issues/401)) ([a6a18b2](https://github.com/midwayjs/midway/commit/a6a18b200252bb0cfa415cc000bcdd5ec5d85701))

# [2.0.0-beta.10](https://github.com/midwayjs/midway/compare/v2.0.0-beta.9...v2.0.0-beta.10) (2020-02-20)

### Bug Fixes

- ts build cwd ([#396](https://github.com/midwayjs/midway/issues/396)) ([83732f9](https://github.com/midwayjs/midway/commit/83732f90c325c646bc6983eac6460a7f65ca1c51))

# [2.0.0-beta.9](https://github.com/midwayjs/midway/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2020-02-20)

### Bug Fixes

- build-tsConfig ([#393](https://github.com/midwayjs/midway/issues/393)) ([fb451b4](https://github.com/midwayjs/midway/commit/fb451b419e0780c9fc803901e186eb38607284dc))

# [2.0.0-beta.8](https://github.com/midwayjs/midway/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2020-02-19)

### Features

- add tsConfig.json to tsc cmd line support ([#392](https://github.com/midwayjs/midway/issues/392)) ([8e368fb](https://github.com/midwayjs/midway/commit/8e368fb7bb0d290817ac0e1d266bf8295a71269c))

# [2.0.0-beta.7](https://github.com/midwayjs/midway/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2020-02-18)

**Note:** Version bump only for package midway

# [2.0.0-beta.6](https://github.com/midwayjs/midway/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2020-02-17)

**Note:** Version bump only for package midway

# [2.0.0-beta.5](https://github.com/midwayjs/midway/compare/v2.0.0-beta.4...v2.0.0-beta.5) (2020-02-17)

### Bug Fixes

- **deps:** add terser to depenencies ([#390](https://github.com/midwayjs/midway/issues/390)) ([a8de587](https://github.com/midwayjs/midway/commit/a8de587))

### Features

- **build:** options to minify all products ([#389](https://github.com/midwayjs/midway/issues/389)) ([d309bdc](https://github.com/midwayjs/midway/commit/d309bdc))
- 2.x namespace ([#388](https://github.com/midwayjs/midway/issues/388)) ([9c90eb1](https://github.com/midwayjs/midway/commit/9c90eb1))

## v1.17.1 (2020-02-17)

### Bug Fixes

- **deps:** add terser to depenencies ([#390](https://github.com/midwayjs/midway/issues/390)) ([e6da77e](https://github.com/midwayjs/midway/commit/e6da77e))

## v1.17.0 (2020-02-17)

### Features

- **build:** options to minify all products ([#389](https://github.com/midwayjs/midway/issues/389)) ([86d5279](https://github.com/midwayjs/midway/commit/86d5279))

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

## v1.16.4 (2020-02-11)

### Bug Fixes

- egg bin modify setup file rule ([#380](https://github.com/midwayjs/midway/issues/380)) ([4b9461d](https://github.com/midwayjs/midway/commit/4b9461d))
- executing midway-bin build at arbitrary directory ([#384](https://github.com/midwayjs/midway/issues/384)) ([1ace418](https://github.com/midwayjs/midway/commit/1ace418))

## v1.16.3 (2019-12-25)

**Note:** Version bump only for package midway

## v1.16.2 (2019-12-25)

### Bug Fixes

- fix ts mode value is empty for non-ts items ([ef3b46a](https://github.com/midwayjs/midway/commit/ef3b46a))
- interface scheduleOpts ([2ae0766](https://github.com/midwayjs/midway/commit/2ae0766))

## v1.16.1 (2019-12-16)

**Note:** Version bump only for package midway

## v1.16.0 (2019-12-16)

**Note:** Version bump only for package midway

## v1.15.1 (2019-12-11)

### Bug Fixes

- use co wrap generator for egg-bin run method ([14cdb2d](https://github.com/midwayjs/midway/commit/14cdb2d))

### Features

- **midway-bin:** do not populate exec argv to child processes ([f22c858](https://github.com/midwayjs/midway/commit/f22c858))

## v1.15.0 (2019-12-06)

### Bug Fixes

- ignore app/extend/\* when loader start ([4db9e9b](https://github.com/midwayjs/midway/commit/4db9e9b))
- **midway-bin:** log message grammar ([30091d0](https://github.com/midwayjs/midway/commit/30091d0))

### Features

- **midway-bin:** add bundle support ([9894049](https://github.com/midwayjs/midway/commit/9894049))
- **midway-bin:** use async-await instead of generator ([eed48f1](https://github.com/midwayjs/midway/commit/eed48f1))

## v1.14.4 (2019-11-20)

### Bug Fixes

- fix lint ([77177fb](https://github.com/midwayjs/midway/commit/77177fb))

## v1.14.3 (2019-11-15)

### Bug Fixes

- midway-bin include jest config ([20e2a86](https://github.com/midwayjs/midway/commit/20e2a86))

## v1.14.2 (2019-11-10)

**Note:** Version bump only for package midway

## v1.14.1 (2019-11-03)

**Note:** Version bump only for package midway

## v1.14.0 (2019-11-01)

### Features

- add egg-init args ([d6c3582](https://github.com/midwayjs/midway/commit/d6c3582))
- support npm registry parameter ([d9adfcf](https://github.com/midwayjs/midway/commit/d9adfcf))
- use new generator for midway-init ([634b748](https://github.com/midwayjs/midway/commit/634b748))

## v1.13.0 (2019-10-16)

### Features

- export IBoot and IgnoreOrMatch from egg ([d5abb3d](https://github.com/midwayjs/midway/commit/d5abb3d))

## v1.12.1 (2019-10-12)

### Bug Fixes

- **midway-bin:** use resolveModule() instead of findFramework() ([#344](https://github.com/midwayjs/midway/issues/344)) ([8c24e2e](https://github.com/midwayjs/midway/commit/8c24e2e))

### BREAKING CHANGES

- **midway-bin:** remove findFramework()

## v1.12.0 (2019-10-11)

### Features

- **midway-bin:** add and export functions ([80ef6b8](https://github.com/midwayjs/midway/commit/80ef6b8))

## v1.11.6 (2019-09-30)

**Note:** Version bump only for package midway

## v1.11.5 (2019-09-06)

**Note:** Version bump only for package midway

## v1.11.4 (2019-09-06)

**Note:** Version bump only for package midway

## v1.11.3 (2019-09-06)

### Bug Fixes

- module path under mono repo ([8342487](https://github.com/midwayjs/midway/commit/8342487)), closes [#329](https://github.com/midwayjs/midway/issues/329)
- scripts compatibility under windows ([78850d1](https://github.com/midwayjs/midway/commit/78850d1))

## v1.11.2 (2019-08-30)

**Note:** Version bump only for package midway

## v1.11.1 (2019-08-10)

**Note:** Version bump only for package midway

## v1.11.0 (2019-08-09)

### Features

- **boilerplate:** enable source map for stack trace ([77afc3f](https://github.com/midwayjs/midway/commit/77afc3f))

### Performance Improvements

- **web:** use set to avoid duplicate lookup ([21e44f9](https://github.com/midwayjs/midway/commit/21e44f9))

## v1.10.9 (2019-08-06)

### Bug Fixes

- app/extend 没有发布到 npm ([73ba51a](https://github.com/midwayjs/midway/commit/73ba51a))

## v1.10.8 (2019-08-03)

**Note:** Version bump only for package midway

## v1.10.7 (2019-08-03)

### Bug Fixes

- **boilerplate:** missing comma in .vscode/settings.json ([62fa953](https://github.com/midwayjs/midway/commit/62fa953))

## v1.10.6 (2019-07-30)

### Bug Fixes

- @types/mocha has a wrong version: 6.0.0 ([e1a7285](https://github.com/midwayjs/midway/commit/e1a7285))

## v1.10.5 (2019-07-30)

### Bug Fixes

- compatible with midway mock ([d738b7f](https://github.com/midwayjs/midway/commit/d738b7f))

## v1.10.4 (2019-07-24)

### Bug Fixes

- **boilerplate:** update vscode path match pattern for all boilerplate ([88352e5](https://github.com/midwayjs/midway/commit/88352e5))

## v1.10.3 (2019-07-23)

### Bug Fixes

- **boilerplate:** sync configurations for all boilerplate ([e73ae35](https://github.com/midwayjs/midway/commit/e73ae35))
- **boilerplate:** update deps @types/mocha for all boilerplate ([d84cde1](https://github.com/midwayjs/midway/commit/d84cde1))
- **boilerplate:** update deps for all boilerplate ([4a015e7](https://github.com/midwayjs/midway/commit/4a015e7))
- **boilerplate:** update nodejs requirement for all boilerplate ([1602d3a](https://github.com/midwayjs/midway/commit/1602d3a)), closes [#279](https://github.com/midwayjs/midway/issues/279)

## v1.10.2 (2019-07-20)

**Note:** Version bump only for package midway

## v1.10.1 (2019-07-18)

**Note:** Version bump only for package midway

## v1.10.0 (2019-07-16)

### Features

- 导出 egg 的 Service 和 Boot 类，以供用户继承 ([6180040](https://github.com/midwayjs/midway/commit/6180040))

## v1.9.0 (2019-07-13)

### Bug Fixes

- **build:** filter unnecessary files [#277](https://github.com/midwayjs/midway/issues/277) ([9c1be93](https://github.com/midwayjs/midway/commit/9c1be93))
- **midway-init:** Internal employees can not use the external network midway ([3179434](https://github.com/midwayjs/midway/commit/3179434))
- **midway-web:** path might be numeric string within safelyGet() ([5b48eff](https://github.com/midwayjs/midway/commit/5b48eff))
- **types:** use generic as typeof context within KoaMiddleware ([6c963e5](https://github.com/midwayjs/midway/commit/6c963e5))

### Features

- [@config](https://github.com/config)(opt) decorator opt accept dot natation ([4ee1959](https://github.com/midwayjs/midway/commit/4ee1959))
- **boilerplate:** add midway-ts-strict-boilerplate ([8ee325c](https://github.com/midwayjs/midway/commit/8ee325c))
- **boilerplate:** enforce kebabCase style for filenames for midway-ts-strict ([816941b](https://github.com/midwayjs/midway/commit/816941b))
- **boilerplate:** update midway-ts-strict ([c8388f0](https://github.com/midwayjs/midway/commit/c8388f0)), closes [#269](https://github.com/midwayjs/midway/issues/269)
- **types:** assign egg['Context'] to types of parameter of context ([ea511fa](https://github.com/midwayjs/midway/commit/ea511fa))
- **types:** export and use type MiddlewareParamArray ([90b4e28](https://github.com/midwayjs/midway/commit/90b4e28))
- **types:** update types of utils.ts ([c76db38](https://github.com/midwayjs/midway/commit/c76db38)), closes [#258](https://github.com/midwayjs/midway/issues/258)
- **types:** update webLoader.ts ([fb534bb](https://github.com/midwayjs/midway/commit/fb534bb))

## v1.8.0 (2019-06-29)

### Bug Fixes

- **test:** param controller test add await ([b955427](https://github.com/midwayjs/midway/commit/b955427))
- make routeArgsInfo Optional ([4ed5443](https://github.com/midwayjs/midway/commit/4ed5443))
- package.json restore mkdir package ([c2ec7ba](https://github.com/midwayjs/midway/commit/c2ec7ba))
- **types:** add file/files opt types ([f40b03e](https://github.com/midwayjs/midway/commit/f40b03e))

### Features

- support param decorator [@body](https://github.com/body) [@query](https://github.com/query) [@param](https://github.com/param).. ([6278d99](https://github.com/midwayjs/midway/commit/6278d99))

## v1.7.0 (2019-06-25)

### Bug Fixes

- **webloader:** remove routerArgs concat ([9feb872](https://github.com/midwayjs/midway/commit/9feb872))

### Features

- controller opt support sensitive opt ([780f5d7](https://github.com/midwayjs/midway/commit/780f5d7))

## v1.6.3 (2019-06-13)

**Note:** Version bump only for package midway

## v1.6.2 (2019-06-12)

### Bug Fixes

- fix tsconfig in template ([1680d29](https://github.com/midwayjs/midway/commit/1680d29))

## v1.6.1 (2019-06-11)

**Note:** Version bump only for package midway

## v1.6.0 (2019-06-11)

### Bug Fixes

- **types:** duplicate import of the controller ([2b4600a](https://github.com/midwayjs/midway/commit/2b4600a))

### Features

- **types:** import and use Context for boilerplate ([d183196](https://github.com/midwayjs/midway/commit/d183196))
- **vscode:** add launch.json for vscode debug ([9741a53](https://github.com/midwayjs/midway/commit/9741a53))
- **vscode:** add settings.json for vscode ([f7d178b](https://github.com/midwayjs/midway/commit/f7d178b))

## v1.5.6 (2019-05-13)

### Bug Fixes

- copy files by src dir ([ad7c28d](https://github.com/midwayjs/midway/commit/ad7c28d))

## v1.5.5 (2019-05-13)

**Note:** Version bump only for package midway

## v1.5.4 (2019-05-09)

**Note:** Version bump only for package midway

## v1.5.3 (2019-05-08)

**Note:** Version bump only for package midway

## v1.5.2 (2019-04-29)

**Note:** Version bump only for package midway

## v1.5.1 (2019-04-15)

**Note:** Version bump only for package midway

## v1.5.0 (2019-04-11)

### Bug Fixes

- fix midway-init ci error ([8f32dcb](https://github.com/midwayjs/midway/commit/8f32dcb))

### Features

- add project options in midway-bin ([c635057](https://github.com/midwayjs/midway/commit/c635057))

## v1.4.10 (2019-03-12)

**Note:** Version bump only for package midway

## v1.4.9 (2019-03-11)

### Bug Fixes

- fix loadDir default path ([9defd2d](https://github.com/midwayjs/midway/commit/9defd2d))

## v1.4.8 (2019-03-11)

**Note:** Version bump only for package midway

## v1.4.7 (2019-03-08)

**Note:** Version bump only for package midway

## v1.4.6 (2019-03-07)

**Note:** Version bump only for package midway

## v1.4.5 (2019-03-06)

**Note:** Version bump only for package midway

## v1.4.4 (2019-03-06)

### Bug Fixes

- fix decorator i midway-mock ([60367fb](https://github.com/midwayjs/midway/commit/60367fb))
- js-app-xml test case ([1298195](https://github.com/midwayjs/midway/commit/1298195))

## v1.4.3 (2019-03-01)

**Note:** Version bump only for package midway

## v1.4.2 (2019-02-28)

**Note:** Version bump only for package midway

## v1.4.1 (2019-02-27)

**Note:** Version bump only for package midway

## v1.4.0 (2019-02-24)

### Features

- add egg definition ([5d28443](https://github.com/midwayjs/midway/commit/5d28443))

## v1.3.2 (2019-02-22)

**Note:** Version bump only for package midway

## v1.3.1 (2019-02-18)

**Note:** Version bump only for package midway

## v1.3.0 (2019-02-12)

### Bug Fixes

- remove inject api generator ([203478e](https://github.com/midwayjs/midway/commit/203478e))

### Features

- add new doc command ([972db71](https://github.com/midwayjs/midway/commit/972db71))
- support process.env.PORT in dev command ([0756f0e](https://github.com/midwayjs/midway/commit/0756f0e))

## v1.2.4 (2019-02-11)

### Bug Fixes

- fix default logdir for alinode plugin ([1f737f7](https://github.com/midwayjs/midway/commit/1f737f7))

## v1.2.3 (2019-02-01)

### Bug Fixes

- fix lint ([d9e1ab9](https://github.com/midwayjs/midway/commit/d9e1ab9))
- fix more lint ([12873dc](https://github.com/midwayjs/midway/commit/12873dc))

## v1.2.2 (2019-01-30)

### Bug Fixes

- import router in base controller ([1a0b890](https://github.com/midwayjs/midway/commit/1a0b890))
- import router to fix core ([71a2f61](https://github.com/midwayjs/midway/commit/71a2f61))

## v1.2.1 (2019-01-30)

**Note:** Version bump only for package midway

## v1.2.0 (2019-01-29)

### Bug Fixes

- app.runSchedule task key ([29249e9](https://github.com/midwayjs/midway/commit/29249e9))

### Features

- midway-mock 支持 applicationContext 获取 ctx 依赖注入，支持 mock IoC 容器中的对象方法 ([4f07c6d](https://github.com/midwayjs/midway/commit/4f07c6d))
- transform injection to another github repo ([5f39ea9](https://github.com/midwayjs/midway/commit/5f39ea9))

## v1.1.2 (2019-01-27)

**Note:** Version bump only for package midway

## v1.1.1 (2019-01-23)

### Bug Fixes

- remove application definition from egg ([218cf3b](https://github.com/midwayjs/midway/commit/218cf3b))

## v1.1.0 (2019-01-23)

### Bug Fixes

- check whether methodNames is iterable ([d8c08d7](https://github.com/midwayjs/midway/commit/d8c08d7))
- fix test case ([de70efa](https://github.com/midwayjs/midway/commit/de70efa))

### Features

- add tslint rules ([73ff338](https://github.com/midwayjs/midway/commit/73ff338))
- 用户执行 init 时判断环境 ([142e0e2](https://github.com/midwayjs/midway/commit/142e0e2))

## v1.0.5 (2019-01-07)

### Bug Fixes

- add appDir in appInfo ([4399aba](https://github.com/midwayjs/midway/commit/4399aba))
- override alinode default path ([f140a18](https://github.com/midwayjs/midway/commit/f140a18))

## v1.0.4 (2018-12-29)

**Note:** Version bump only for package midway

## v1.0.3 (2018-12-27)

### Bug Fixes

- remove pull template from github and add doc for windows ([3ac69ef](https://github.com/midwayjs/midway/commit/3ac69ef))

## v1.0.2 (2018-12-26)

**Note:** Version bump only for package midway

## v1.0.1 (2018-12-23)

**Note:** Version bump only for package midway

## v1.0.0 (2018-12-23)

### Features

- Release v1.0.0

## v0.7.1 (2018-12-18)

### Bug Fixes

- lock egg-schedule version ([668a4b3](https://github.com/midwayjs/midway/commit/668a4b3))

## v0.7.0 (2018-12-09)

### Bug Fixes

- Boolean type resolution error in xml ([b3a35e4](https://github.com/midwayjs/midway/commit/b3a35e4))

### Features

- Add build specified suffix file ([1752cf9](https://github.com/midwayjs/midway/commit/1752cf9))
- support non-default class for midway-schedule ([74e51e9](https://github.com/midwayjs/midway/commit/74e51e9))

## v0.6.5 (2018-11-27)

**Note:** Version bump only for package midway

## v0.6.4 (2018-11-21)

### Bug Fixes

- change default search directory ([ae189df](https://github.com/midwayjs/midway/commit/ae189df))

## v0.6.3 (2018-11-20)

### Bug Fixes

- fix invoke loadController repeatedly ([8342649](https://github.com/midwayjs/midway/commit/8342649))

## v0.6.2 (2018-11-20)

### Bug Fixes

- Increase cron and interval and other parameter expansion ([#62](https://github.com/midwayjs/midway/issues/62)) ([ccd0114](https://github.com/midwayjs/midway/commit/ccd0114))
- not only inject properties that declared on the property ([b1fe4e2](https://github.com/midwayjs/midway/commit/b1fe4e2))

## v0.6.1 (2018-11-19)

### Bug Fixes

- fix load order and user can cover default dir ([990ddcb](https://github.com/midwayjs/midway/commit/990ddcb))

## v0.6.0 (2018-11-15)

### Bug Fixes

- agent not work ([f43c553](https://github.com/midwayjs/midway/commit/f43c553))
- agent startup become compatible between egg&midway ([47f46c3](https://github.com/midwayjs/midway/commit/47f46c3))
- build not midway-bin ([f16b9db](https://github.com/midwayjs/midway/commit/f16b9db))
- egg-schedule plugin retrieve dir ([6a94e01](https://github.com/midwayjs/midway/commit/6a94e01))
- logger & build scripts ([c2e29aa](https://github.com/midwayjs/midway/commit/c2e29aa))
- run task with wront ctx & fill tests ([94d95c3](https://github.com/midwayjs/midway/commit/94d95c3))
- schedule build file not published ([e14be5b](https://github.com/midwayjs/midway/commit/e14be5b))

### Features

- init midway-schedule ([4442bd1](https://github.com/midwayjs/midway/commit/4442bd1))

## v0.5.1 (2018-11-15)

### Bug Fixes

- schedule build file not published ([4150ce2](https://github.com/midwayjs/midway/commit/4150ce2))

## v0.5.0 (2018-11-15)

### Bug Fixes

- agent not work ([c7cf3a9](https://github.com/midwayjs/midway/commit/c7cf3a9))
- agent startup become compatible between egg&midway ([05c98aa](https://github.com/midwayjs/midway/commit/05c98aa))
- build not midway-bin ([5b9667f](https://github.com/midwayjs/midway/commit/5b9667f))
- egg-schedule plugin retrieve dir ([8429332](https://github.com/midwayjs/midway/commit/8429332))
- logger & build scripts ([ef1a948](https://github.com/midwayjs/midway/commit/ef1a948))
- run task with wront ctx & fill tests ([30a0741](https://github.com/midwayjs/midway/commit/30a0741))

### Features

- init midway-schedule ([82cc9e1](https://github.com/midwayjs/midway/commit/82cc9e1))

## v0.4.7 (2018-11-15)

### Bug Fixes

- fix load dir bug in js mode ([8c148f3](https://github.com/midwayjs/midway/commit/8c148f3))

## v0.4.6 (2018-11-14)

### Bug Fixes

- add ts autoload directory ([a6668fb](https://github.com/midwayjs/midway/commit/a6668fb))
- fix dep map generator err in constructor inject ([9d7abe6](https://github.com/midwayjs/midway/commit/9d7abe6))
- fix set app use defineProperty ([d94d5e9](https://github.com/midwayjs/midway/commit/d94d5e9))
- lint & test failed ([0a3fb74](https://github.com/midwayjs/midway/commit/0a3fb74))

## v0.4.5 (2018-11-05)

### Bug Fixes

- fix app.root ([33d730c](https://github.com/midwayjs/midway/commit/33d730c))

<a name="0.2.10"></a>

## v0.2.10 (2018-08-20)

**Note:** Version bump only for package midway

<a name="0.2.9"></a>

## v0.2.9 (2018-08-16)

### Bug Fixes

- mock obj ([1d867ed](https://github.com/midwayjs/midway/commit/1d867ed))
- set appDir before setServerEnv ([6b418ca](https://github.com/midwayjs/midway/commit/6b418ca))

<a name="0.2.8"></a>

## v0.2.8 (2018-08-15)

### Bug Fixes

- fix framework name and support load server options from pkg ([b8b4c7d](https://github.com/midwayjs/midway/commit/b8b4c7d))
- fix template and modify ts register method ([1857c08](https://github.com/midwayjs/midway/commit/1857c08))
- support typescript in dependencies ([b532a90](https://github.com/midwayjs/midway/commit/b532a90))

<a name="0.2.7"></a>

## v0.2.7 (2018-08-10)

### Bug Fixes

- bind method definition missing ([79685db](https://github.com/midwayjs/midway/commit/79685db))
- export bootstrap file ([d2bd919](https://github.com/midwayjs/midway/commit/d2bd919))
- export bootstrap file ([1337926](https://github.com/midwayjs/midway/commit/1337926))
- module name ([c00d20c](https://github.com/midwayjs/midway/commit/c00d20c))

<a name="0.2.6"></a>

## v0.2.6 (2018-08-08)

### Bug Fixes

- publish add bootstrap file ([3593ec5](https://github.com/midwayjs/midway/commit/3593ec5))
- try to export container method ([7921cdb](https://github.com/midwayjs/midway/commit/7921cdb))

<a name="0.2.5"></a>

## v0.2.5 (2018-08-06)

### Bug Fixes

- ts-node register twice ([b405159](https://github.com/midwayjs/midway/commit/b405159))
