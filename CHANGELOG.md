# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.6.4](https://github.com/midwayjs/midway/compare/v2.6.3...v2.6.4) (2021-01-02)


### Bug Fixes

* definition fix for getLogger and getCoreLogger ([#783](https://github.com/midwayjs/midway/issues/783)) ([264b481](https://github.com/midwayjs/midway/commit/264b4819f8f96dccabd1e5cd6ad2c7b3b8277136))





## [2.6.3](https://github.com/midwayjs/midway/compare/v2.6.2...v2.6.3) (2020-12-30)


### Bug Fixes

* add more args for egg transport ([#782](https://github.com/midwayjs/midway/issues/782)) ([adbbfc9](https://github.com/midwayjs/midway/commit/adbbfc9f98c0e9d5617e37232113e7f1e2f92a15))





## [2.6.2](https://github.com/midwayjs/midway/compare/v2.6.1...v2.6.2) (2020-12-30)


### Bug Fixes

* output logs dir when development env ([#780](https://github.com/midwayjs/midway/issues/780)) ([557d874](https://github.com/midwayjs/midway/commit/557d8743cf5183740b25a987b1a1135ea09c9d28))





## [2.6.1](https://github.com/midwayjs/midway/compare/v2.6.0...v2.6.1) (2020-12-29)


### Bug Fixes

* logger build ([#779](https://github.com/midwayjs/midway/issues/779)) ([ee3589e](https://github.com/midwayjs/midway/commit/ee3589e0bed5d79fade9c2067de1452eeb718da4))





# [2.6.0](https://github.com/midwayjs/midway/compare/v2.5.5...v2.6.0) (2020-12-28)


### Bug Fixes

* egg layer x forwarded for ([#768](https://github.com/midwayjs/midway/issues/768)) ([568379f](https://github.com/midwayjs/midway/commit/568379fca58744410b273cc6fdb40cec83700d08))
* ouput console in serverless environment ([#759](https://github.com/midwayjs/midway/issues/759)) ([bad20d7](https://github.com/midwayjs/midway/commit/bad20d7950d1ed96a0448aedfac5ae8f909a7960))
* parse http is type ([#763](https://github.com/midwayjs/midway/issues/763)) ([ee77af5](https://github.com/midwayjs/midway/commit/ee77af5e32b36807ddc5d05555826b8562ec6769))


### Features

* add midway logger ([#743](https://github.com/midwayjs/midway/issues/743)) ([13e8cc7](https://github.com/midwayjs/midway/commit/13e8cc753d994e6f9f073688e22527f75d39984a))
* support https config for web/koa/express ([#742](https://github.com/midwayjs/midway/issues/742)) ([a0c07b9](https://github.com/midwayjs/midway/commit/a0c07b9e3cc2eec7e88e49085f1e66242fa1ec50))





## [2.5.5](https://github.com/midwayjs/midway/compare/v2.5.4...v2.5.5) (2020-12-15)


### Bug Fixes

* aspect wrapper requestContext instance ([#755](https://github.com/midwayjs/midway/issues/755)) ([84193a0](https://github.com/midwayjs/midway/commit/84193a0a50483a0ec8e25b25a17654d4fc77ed1d))





## [2.5.4](https://github.com/midwayjs/midway/compare/v2.5.3...v2.5.4) (2020-12-12)


### Bug Fixes

* monorepo use different cwd ([#752](https://github.com/midwayjs/midway/issues/752)) ([cb3ba35](https://github.com/midwayjs/midway/commit/cb3ba35343101c1cb34cc10bdd31237c226266bb))





## [2.5.3](https://github.com/midwayjs/midway/compare/v2.5.2...v2.5.3) (2020-12-11)


### Bug Fixes

* runtime mock support initHandler ([#749](https://github.com/midwayjs/midway/issues/749)) ([0b993be](https://github.com/midwayjs/midway/commit/0b993beff72ef648dc438dda4d0214f4e3b13954))
* support eggjs in monorepo ([#751](https://github.com/midwayjs/midway/issues/751)) ([18c32b9](https://github.com/midwayjs/midway/commit/18c32b980167dd9a3547b0a930a043f9c37f86ad))





## [2.5.2](https://github.com/midwayjs/midway/compare/v2.5.1...v2.5.2) (2020-12-04)


### Bug Fixes

* definition for getAsync and get ([#740](https://github.com/midwayjs/midway/issues/740)) ([d40de78](https://github.com/midwayjs/midway/commit/d40de7899f3b816c61229dce463d9b2de6842259))
* ignore set body after user set status ([#741](https://github.com/midwayjs/midway/issues/741)) ([4fdb2a6](https://github.com/midwayjs/midway/commit/4fdb2a62c0ff694aa0b6bffaec3386a36d4334c9))





## [2.5.1](https://github.com/midwayjs/midway/compare/v2.5.0...v2.5.1) (2020-11-29)


### Bug Fixes

* return ctx.body and set header after send ([#738](https://github.com/midwayjs/midway/issues/738)) ([4c8e740](https://github.com/midwayjs/midway/commit/4c8e740865ece6a62176144a877863c1d5317d65))





# [2.5.0](https://github.com/midwayjs/midway/compare/v2.4.8...v2.5.0) (2020-11-28)


### Bug Fixes

* got egg env from serverEnv ([#735](https://github.com/midwayjs/midway/issues/735)) ([ac19c94](https://github.com/midwayjs/midway/commit/ac19c94a708cb6c5798ae43b04c7e5e5a8382b6c))
* koa response 204 ([#733](https://github.com/midwayjs/midway/issues/733)) ([2463d77](https://github.com/midwayjs/midway/commit/2463d77cf2d9b03216acff901839816be45c5e73))


### Features

* add getFunctionName() and functionSerivceName() method to runtime and faas framework ([#734](https://github.com/midwayjs/midway/issues/734)) ([f0bc5aa](https://github.com/midwayjs/midway/commit/f0bc5aadd224e6ec85691b9c82cc7993cbc32cdb))





## [2.4.8](https://github.com/midwayjs/midway/compare/v2.4.7...v2.4.8) (2020-11-24)


### Bug Fixes

* use egg-layer load framework circular reference ([#730](https://github.com/midwayjs/midway/issues/730)) ([f012d78](https://github.com/midwayjs/midway/commit/f012d78599fa0f877937cdb0caaec04da518b917))





## [2.4.7](https://github.com/midwayjs/midway/compare/v2.4.6...v2.4.7) (2020-11-23)

**Note:** Version bump only for package midway





## [2.4.6](https://github.com/midwayjs/midway/compare/v2.4.5...v2.4.6) (2020-11-19)

**Note:** Version bump only for package midway





## [2.4.5](https://github.com/midwayjs/midway/compare/v2.4.4...v2.4.5) (2020-11-19)


### Bug Fixes

* core middleware load ([#724](https://github.com/midwayjs/midway/issues/724)) ([9697834](https://github.com/midwayjs/midway/commit/96978348412284b421adff4be1bdacc1a539fc64))
* get function args error ([#725](https://github.com/midwayjs/midway/issues/725)) ([7ec5317](https://github.com/midwayjs/midway/commit/7ec531776efc65a84d60a7c55dc29ad4e08d999a))





## [2.4.4](https://github.com/midwayjs/midway/compare/v2.4.3...v2.4.4) (2020-11-17)


### Bug Fixes

* remove error process env branch ([#723](https://github.com/midwayjs/midway/issues/723)) ([53ddc4c](https://github.com/midwayjs/midway/commit/53ddc4caec322162889e50f21b50aef96907a607))





## [2.4.3](https://github.com/midwayjs/midway/compare/v2.4.2...v2.4.3) (2020-11-16)


### Bug Fixes

* aspect mapping npe ([#722](https://github.com/midwayjs/midway/issues/722)) ([1954eed](https://github.com/midwayjs/midway/commit/1954eed145cbb8fc929394f6cb0c1bc8cb80c823))
* fc egg app body parse ([#719](https://github.com/midwayjs/midway/issues/719)) ([18c0aad](https://github.com/midwayjs/midway/commit/18c0aad1d9a187d59da6d9f11940ef82b2770ff0))





## [2.4.2](https://github.com/midwayjs/midway/compare/v2.4.1...v2.4.2) (2020-11-13)


### Bug Fixes

* error pattern for ignore node_modules ([#717](https://github.com/midwayjs/midway/issues/717)) ([16f1292](https://github.com/midwayjs/midway/commit/16f1292359b8c65548eea3926de8eaaa13133538))





## [2.4.1](https://github.com/midwayjs/midway/compare/v2.4.0...v2.4.1) (2020-11-12)


### Bug Fixes

* first schedule ignore stop other schedule ([#715](https://github.com/midwayjs/midway/issues/715)) ([d296636](https://github.com/midwayjs/midway/commit/d2966361cbaf33bc8f53c30c097bbbd3e64a139f))
* load ignore node_modules ([#714](https://github.com/midwayjs/midway/issues/714)) ([ad13f13](https://github.com/midwayjs/midway/commit/ad13f1357263fad143ad18527a3c04bd4a629798))





# [2.4.0](https://github.com/midwayjs/midway/compare/v2.3.23...v2.4.0) (2020-11-11)


### Bug Fixes

* mock method missing ([#710](https://github.com/midwayjs/midway/issues/710)) ([0088cb2](https://github.com/midwayjs/midway/commit/0088cb2253f4f99dc945a5fc99b580bfa4d4a594))


### Features

* support define custom egg framework ([#709](https://github.com/midwayjs/midway/issues/709)) ([f5baba1](https://github.com/midwayjs/midway/commit/f5baba18d10e3dc91ba9651effadd00b8f66cf8b))
* **hooks:** use app hooks ([#708](https://github.com/midwayjs/midway/issues/708)) ([faf05c5](https://github.com/midwayjs/midway/commit/faf05c5cdba3e743568db74720f4927374c15f19))





## [2.3.23](https://github.com/midwayjs/midway/compare/v2.3.22...v2.3.23) (2020-11-03)


### Bug Fixes

* delay loader.load after midway bootstrap init ([#699](https://github.com/midwayjs/midway/issues/699)) ([2d12a55](https://github.com/midwayjs/midway/commit/2d12a551707099e0fc7ea188466190e63d02a29a))
* trigger lifecycle after egg load ([#701](https://github.com/midwayjs/midway/issues/701)) ([4d63e3a](https://github.com/midwayjs/midway/commit/4d63e3ae38f9d8492894353b1794f1b571790e9d))





## [2.3.22](https://github.com/midwayjs/midway/compare/v2.3.21...v2.3.22) (2020-10-31)


### Bug Fixes

* aspect bind missing ctx ([#694](https://github.com/midwayjs/midway/issues/694)) ([871ea80](https://github.com/midwayjs/midway/commit/871ea80b8090e28f02dc74405de5da3969ccf5c4))





## [2.3.21](https://github.com/midwayjs/midway/compare/v2.3.20...v2.3.21) (2020-10-29)


### Bug Fixes

* setHeader loop with array ([#691](https://github.com/midwayjs/midway/issues/691)) ([9ed5acc](https://github.com/midwayjs/midway/commit/9ed5acc0f136a2dc6d013b1fd0ee0ab9b7546eab))





## [2.3.20](https://github.com/midwayjs/midway/compare/v2.3.19...v2.3.20) (2020-10-29)


### Bug Fixes

* missing router options ([#689](https://github.com/midwayjs/midway/issues/689)) ([b1693b8](https://github.com/midwayjs/midway/commit/b1693b885a0804f4924616bf0bdafd98b4698d4e))





## [2.3.19](https://github.com/midwayjs/midway/compare/v2.3.18...v2.3.19) (2020-10-28)

### Features

* add swagger description meta for swagger





## [2.3.18](https://github.com/midwayjs/midway/compare/v2.3.17...v2.3.18) (2020-10-27)


### Bug Fixes

* configuration inject plugin and more in production environment ([#680](https://github.com/midwayjs/midway/issues/680)) ([41bce5d](https://github.com/midwayjs/midway/commit/41bce5d8a60a6fde61ff62794612eecff2e260ed))





## [2.3.17](https://github.com/midwayjs/midway/compare/v2.3.16...v2.3.17) (2020-10-22)

**Note:** Version bump only for package midway





## [2.3.16](https://github.com/midwayjs/midway/compare/v2.3.15...v2.3.16) (2020-10-16)


### Bug Fixes

* use new ctx bind req and res in express ([#674](https://github.com/midwayjs/midway/issues/674)) ([1d26396](https://github.com/midwayjs/midway/commit/1d2639698e8e292fe12506a6e530a6d032f46d7e))





## [2.3.15](https://github.com/midwayjs/midway/compare/v2.3.14...v2.3.15) (2020-10-15)

**Note:** Version bump only for package midway





## [2.3.14](https://github.com/midwayjs/midway/compare/v2.3.13...v2.3.14) (2020-10-15)

**Note:** Version bump only for package midway





## [2.3.13](https://github.com/midwayjs/midway/compare/v2.3.12...v2.3.13) (2020-10-13)


### Bug Fixes

* [@plugin](https://github.com/plugin) inject undefined in web middleware ([#667](https://github.com/midwayjs/midway/issues/667)) ([cacb2fa](https://github.com/midwayjs/midway/commit/cacb2faa61258172ef445db0a86e45c3f19014a6))
* when middleware config options is undefined, options.match ([#670](https://github.com/midwayjs/midway/issues/670)) ([1893049](https://github.com/midwayjs/midway/commit/18930498434d8bc0254fa1db013346443a96e9f5))
* when middleware config options is undefined. options.enable expr… ([#668](https://github.com/midwayjs/midway/issues/668)) ([3378ea4](https://github.com/midwayjs/midway/commit/3378ea41d0715e4451fb1cda3e72612d458582b0))





## [2.3.12](https://github.com/midwayjs/midway/compare/v2.3.11...v2.3.12) (2020-10-10)


### Bug Fixes

* egg framework support ignore and match ([#666](https://github.com/midwayjs/midway/issues/666)) ([b541dc0](https://github.com/midwayjs/midway/commit/b541dc0a5437c172d835d215022096bbb2a4889e))





## [2.3.11](https://github.com/midwayjs/midway/compare/v2.3.10...v2.3.11) (2020-10-08)

**Note:** Version bump only for package midway





## [2.3.10](https://github.com/midwayjs/midway/compare/v2.3.9...v2.3.10) (2020-10-08)


### Bug Fixes

* component inject global object and add case ([#663](https://github.com/midwayjs/midway/issues/663)) ([e768ee8](https://github.com/midwayjs/midway/commit/e768ee872ed9855252346920318a32133328c0fe))


### Features

* replace configuration.imports to object directly and deprecated string ([#657](https://github.com/midwayjs/midway/issues/657)) ([f1b42a1](https://github.com/midwayjs/midway/commit/f1b42a1b338a69cdfaf63e2d951a65333e4f3007))





## [2.3.9](https://github.com/midwayjs/midway/compare/v2.3.8...v2.3.9) (2020-10-05)


### Bug Fixes

* include files ([#661](https://github.com/midwayjs/midway/issues/661)) ([d48e145](https://github.com/midwayjs/midway/commit/d48e145198939cb5bb2a396edbd438cbd531ca3c))





## [2.3.8](https://github.com/midwayjs/midway/compare/v2.3.7...v2.3.8) (2020-10-05)


### Bug Fixes

* schedule case ([#660](https://github.com/midwayjs/midway/issues/660)) ([c9fb3fb](https://github.com/midwayjs/midway/commit/c9fb3fbe5e4edff5e89e11bfbe19c5fcc3515883))





## [2.3.7](https://github.com/midwayjs/midway/compare/v2.3.6...v2.3.7) (2020-10-04)


### Bug Fixes

* transform type after validate ([#659](https://github.com/midwayjs/midway/issues/659)) ([2b30ba7](https://github.com/midwayjs/midway/commit/2b30ba77d0c897d84d8a6f3222b60c083ec3e869))





## [2.3.6](https://github.com/midwayjs/midway/compare/v2.3.4...v2.3.6) (2020-10-02)


### Bug Fixes

* fix core pkg name ([#656](https://github.com/midwayjs/midway/issues/656)) ([2d26b0d](https://github.com/midwayjs/midway/commit/2d26b0d3cd6bb541295deb2b5b5c13d955f8587d))
* implement optional dep for amqplib in mock package ([#654](https://github.com/midwayjs/midway/issues/654)) ([3319872](https://github.com/midwayjs/midway/commit/33198727855ff042db7d96723992b49c632aa25d))


### Features

* add request path and ip decorator ([#655](https://github.com/midwayjs/midway/issues/655)) ([3354c26](https://github.com/midwayjs/midway/commit/3354c263c92957fd68b90c383c33afc6ad9ae967))





## [2.3.4](https://github.com/midwayjs/midway/compare/v2.3.3...v2.3.4) (2020-09-28)

**Note:** Version bump only for package midway





## [2.3.3](https://github.com/midwayjs/midway/compare/v2.3.2...v2.3.3) (2020-09-28)


### Bug Fixes

* egg definition ([#650](https://github.com/midwayjs/midway/issues/650)) ([3e2f1e9](https://github.com/midwayjs/midway/commit/3e2f1e9d65d37acf1f80ece022a7471d09975b30))





## [2.3.2](https://github.com/midwayjs/midway/compare/v2.3.1...v2.3.2) (2020-09-28)


### Bug Fixes

* component get config and merge egg config ([#649](https://github.com/midwayjs/midway/issues/649)) ([aa95a3e](https://github.com/midwayjs/midway/commit/aa95a3eb9ff70d691c2420e58b357e2889d03ebb))





## [2.3.1](https://github.com/midwayjs/midway/compare/v2.3.0...v2.3.1) (2020-09-27)


### Bug Fixes

* fix debugger logger create in every request ([#648](https://github.com/midwayjs/midway/issues/648)) ([8e70fb0](https://github.com/midwayjs/midway/commit/8e70fb0b57241bb6e0b2fcca5c4fa2b26fc2eb5e))





# [2.3.0](https://github.com/midwayjs/midway/compare/v2.2.10...v2.3.0) (2020-09-27)


### Features

* add rabbitmq ([#647](https://github.com/midwayjs/midway/issues/647)) ([2c03eb4](https://github.com/midwayjs/midway/commit/2c03eb4f5e979d309048a11f17f7579a1d299ba1))





## [2.2.10](https://github.com/midwayjs/midway/compare/v2.2.9...v2.2.10) (2020-09-24)


### Bug Fixes

* query decorator with empty args ([#646](https://github.com/midwayjs/midway/issues/646)) ([815e230](https://github.com/midwayjs/midway/commit/815e2308e8f40601ee3b94a3ccb2b1567dc03b9f))





## [2.2.9](https://github.com/midwayjs/midway/compare/v2.2.8...v2.2.9) (2020-09-24)


### Bug Fixes

* remove sourcemap and src in dist ([#645](https://github.com/midwayjs/midway/issues/645)) ([e561a88](https://github.com/midwayjs/midway/commit/e561a88f4a70af15d4be3d5fe0bd39487677d4ce))





## [2.2.8](https://github.com/midwayjs/midway/compare/v2.2.7...v2.2.8) (2020-09-23)


### Bug Fixes

* fix validate error ([e6e58d3](https://github.com/midwayjs/midway/commit/e6e58d371cbc52ddf51a7d03de48ef44b020aaa9))





## [2.2.7](https://github.com/midwayjs/midway/compare/v2.2.6...v2.2.7) (2020-09-20)


### Bug Fixes

* WebMiddleare to IWebMiddleware ([e69cf28](https://github.com/midwayjs/midway/commit/e69cf286fa76ab3144404806c5cbbe8642cdcd61))





## [2.2.6](https://github.com/midwayjs/midway/compare/v2.2.5...v2.2.6) (2020-09-18)


### Features

* add aop ([#640](https://github.com/midwayjs/midway/issues/640)) ([c3e15b3](https://github.com/midwayjs/midway/commit/c3e15b328c184318e364bf40d32fa4df6be2a30a))





## [2.2.5](https://github.com/midwayjs/midway/compare/v2.2.4...v2.2.5) (2020-09-17)


### Bug Fixes

* move @types/joi to dependencies ([#638](https://github.com/midwayjs/midway/issues/638)) ([7c31164](https://github.com/midwayjs/midway/commit/7c31164ae8959b00213527c7fb384a07929790b9))


### Features

* add generateMiddleware for express and faas ([bfcfc9a](https://github.com/midwayjs/midway/commit/bfcfc9a377f01026a459aaed35a3f0fdf0530f26))
* add property for web params ([5c19644](https://github.com/midwayjs/midway/commit/5c1964482b4c8efe0ac23c3c1feb1f48ce5b7889))
* use midway cli replace egg-bin ([#639](https://github.com/midwayjs/midway/issues/639)) ([62bbf38](https://github.com/midwayjs/midway/commit/62bbf3852899476600a0b594cb7dc274b05e29ec))





## [2.2.4](https://github.com/midwayjs/midway/compare/v2.2.3...v2.2.4) (2020-09-15)


### Bug Fixes

* support midway global middleware use id ([8dc9ae3](https://github.com/midwayjs/midway/commit/8dc9ae33acd559d74f144a75f08fc039037fa45b))


### Features

* type extension bootstrap ([71f9358](https://github.com/midwayjs/midway/commit/71f9358b736b9e5f7f8c604be38ca53582863e1e))





## [2.2.3](https://github.com/midwayjs/midway/compare/v2.2.2...v2.2.3) (2020-09-14)


### Bug Fixes

* remove midway-bin dep ([632bd96](https://github.com/midwayjs/midway/commit/632bd96d105b554b8523fd7d24af60f00e67f01d))





## [2.2.2](https://github.com/midwayjs/midway/compare/v2.2.1...v2.2.2) (2020-09-14)


### Bug Fixes

* add missing typing dep ([083395f](https://github.com/midwayjs/midway/commit/083395f76709e4b5e8c32e7a9f89d839d8e16b5f))





## [2.2.1](https://github.com/midwayjs/midway/compare/v2.2.0...v2.2.1) (2020-09-14)


### Bug Fixes

* add missing typing dep ([09a9473](https://github.com/midwayjs/midway/commit/09a9473d0ddc73b7e9e624e1bed1fe58691e36ec))
* fix default logger dir ([ce0e06a](https://github.com/midwayjs/midway/commit/ce0e06ab1cc121074d0b64e35c127982f7b27296))
* fix some problem in 2.x boilerplate ([80608a1](https://github.com/midwayjs/midway/commit/80608a18f5f04798028e1a5c33a264753ee61121))





# [2.2.0](https://github.com/midwayjs/midway/compare/v2.1.4...v2.2.0) (2020-09-13)


### Features

* complete 2.x beta ([#630](https://github.com/midwayjs/midway/issues/630)) ([b23cd00](https://github.com/midwayjs/midway/commit/b23cd00fe9cefc9057a2284d38d5419773539206))
* parameters validation ([#451](https://github.com/midwayjs/midway/issues/451)) ([92735b0](https://github.com/midwayjs/midway/commit/92735b009b59ed150b946a387c5ae56893bee53a))





## [2.1.4](https://github.com/midwayjs/midway/compare/v2.1.3...v2.1.4) (2020-06-17)


### Bug Fixes

* 2.x extends bug ([#498](https://github.com/midwayjs/midway/issues/498)) ([19ec029](https://github.com/midwayjs/midway/commit/19ec0292eedd94cb2e40e69af8897703fc8f55c7))





## [2.1.3](https://github.com/midwayjs/midway/compare/v2.1.2...v2.1.3) (2020-05-07)


### Bug Fixes

* configuration use package name ([#485](https://github.com/midwayjs/midway/issues/485)) ([a00cb18](https://github.com/midwayjs/midway/commit/a00cb189b10a7353f6e0545c17837e8c9b10ca2c))





## [2.1.2](https://github.com/midwayjs/midway/compare/v2.1.1...v2.1.2) (2020-05-02)


### Bug Fixes

* fix util import ([7d76cbf](https://github.com/midwayjs/midway/commit/7d76cbf4cedc31b141adc76194c89a284e4fe8ee))
* fix wrap app ([c16ea0b](https://github.com/midwayjs/midway/commit/c16ea0b0a0d02539f80586c5a08a027a28ce2d00))





## [2.1.1](https://github.com/midwayjs/midway/compare/v2.1.0...v2.1.1) (2020-04-30)


### Bug Fixes

* add metadata when configuration load controller ([#483](https://github.com/midwayjs/midway/issues/483)) ([e4e3c57](https://github.com/midwayjs/midway/commit/e4e3c5784df844a290a57a3d309a5f4e866e4831))





# [2.1.0](https://github.com/midwayjs/midway/compare/v2.0.17...v2.1.0) (2020-04-29)


### Features

* refactor hook & add @App ([#482](https://github.com/midwayjs/midway/issues/482)) ([3bfd300](https://github.com/midwayjs/midway/commit/3bfd300daf21fce96f2ff92be22ecb0f12bdd033))





## [2.0.17](https://github.com/midwayjs/midway/compare/v2.0.16...v2.0.17) (2020-04-21)


### Bug Fixes

* fix export service method ([#477](https://github.com/midwayjs/midway/issues/477)) ([586b0be](https://github.com/midwayjs/midway/commit/586b0be05ee9ef38cef9d312f19de4318c2b1701))
* fun typing ([#467](https://github.com/midwayjs/midway/issues/467)) ([fdf2814](https://github.com/midwayjs/midway/commit/fdf28148da961d20961c95ecea128e92e3bc9819))





## [2.0.16](https://github.com/midwayjs/midway/compare/v2.0.15...v2.0.16) (2020-04-12)


### Bug Fixes

* Fix cov ([#469](https://github.com/midwayjs/midway/issues/469)) ([1d65da9](https://github.com/midwayjs/midway/commit/1d65da96c34b46fc0e81373c137545613fb1d7b7))





## [2.0.15](https://github.com/midwayjs/midway/compare/v2.0.14...v2.0.15) (2020-04-11)


### Bug Fixes

* Fix default env ([#468](https://github.com/midwayjs/midway/issues/468)) ([db9ffcf](https://github.com/midwayjs/midway/commit/db9ffcfcc412bfb7613d46eb3b3b30f44e3b553f)), closes [#450](https://github.com/midwayjs/midway/issues/450) [#454](https://github.com/midwayjs/midway/issues/454) [#379](https://github.com/midwayjs/midway/issues/379) [#455](https://github.com/midwayjs/midway/issues/455) [#463](https://github.com/midwayjs/midway/issues/463) [#464](https://github.com/midwayjs/midway/issues/464) [#466](https://github.com/midwayjs/midway/issues/466)





## [2.0.14](https://github.com/midwayjs/midway/compare/v2.0.13...v2.0.14) (2020-04-08)

**Note:** Version bump only for package midway





## [2.0.13](https://github.com/midwayjs/midway/compare/v2.0.12...v2.0.13) (2020-04-07)

**Note:** Version bump only for package midway





## [2.0.12](https://github.com/midwayjs/midway/compare/v2.0.11...v2.0.12) (2020-04-07)


### Bug Fixes

* 2.x fix conflicts ([#458](https://github.com/midwayjs/midway/issues/458)) ([2b0f44c](https://github.com/midwayjs/midway/commit/2b0f44c6d4c91154fb8a7779b6789acbb2635b1b))
* 2.x fix conflicts ([#459](https://github.com/midwayjs/midway/issues/459)) ([e9f689c](https://github.com/midwayjs/midway/commit/e9f689c07efec3078c77557f29ea9ecdb5659094))





## [2.0.11](https://github.com/midwayjs/midway/compare/v2.0.10...v2.0.11) (2020-04-07)


### Bug Fixes

* fix dfs circular ([#457](https://github.com/midwayjs/midway/issues/457)) ([8b91326](https://github.com/midwayjs/midway/commit/8b9132604df041dad5f1124389d49f75c288aff5))





## [2.0.10](https://github.com/midwayjs/midway/compare/v2.0.9...v2.0.10) (2020-03-31)

**Note:** Version bump only for package midway





## [2.0.9](https://github.com/midwayjs/midway/compare/v2.0.8...v2.0.9) (2020-03-30)


### Bug Fixes

* @Func return type ([#452](https://github.com/midwayjs/midway/issues/452)) ([9064743](https://github.com/midwayjs/midway/commit/9064743c04713ef77ef246416dabe8f79b97fc79))





## [2.0.8](https://github.com/midwayjs/midway/compare/v2.0.7...v2.0.8) (2020-03-30)


### Bug Fixes

* 2.x conflict 能力 ([#449](https://github.com/midwayjs/midway/issues/449)) ([6064ecf](https://github.com/midwayjs/midway/commit/6064ecf0fcf0f79ca9f9f177b06baef6d65ca7ea))





## [2.0.7](https://github.com/midwayjs/midway/compare/v2.0.6...v2.0.7) (2020-03-30)

**Note:** Version bump only for package midway





## [2.0.6](https://github.com/midwayjs/midway/compare/v2.0.5...v2.0.6) (2020-03-27)


### Bug Fixes

* configuration with ctx ([4c7ff6a](https://github.com/midwayjs/midway/commit/4c7ff6ade50a1048c465d50145f0aedcb1ec30d3))





## [2.0.5](https://github.com/midwayjs/midway/compare/v2.0.4...v2.0.5) (2020-03-22)


### Bug Fixes

* can midway build when tsconfig.json has comments ([#424](https://github.com/midwayjs/midway/issues/424)) ([f2b2713](https://github.com/midwayjs/midway/commit/f2b27137fe35d1de462adfdc289953d6a405ecd9))
* lazy get default framework ([#430](https://github.com/midwayjs/midway/issues/430)) ([c8c4b49](https://github.com/midwayjs/midway/commit/c8c4b49dd66d197b10bafd24aba55f42672d7d59))
* mock fn ([#439](https://github.com/midwayjs/midway/issues/439)) ([d0a36e4](https://github.com/midwayjs/midway/commit/d0a36e4ff15493603ebb334dc746d64fed300627))





## [2.0.4](https://github.com/midwayjs/midway/compare/v2.0.3...v2.0.4) (2020-03-19)


### Bug Fixes

* 2.x fix lifecycle bug ([#435](https://github.com/midwayjs/midway/issues/435)) ([22d3e12](https://github.com/midwayjs/midway/commit/22d3e121d98575e994282c93b7522ddcf76942be))





## [2.0.3](https://github.com/midwayjs/midway/compare/v2.0.2...v2.0.3) (2020-03-19)

**Note:** Version bump only for package midway





## [2.0.2](https://github.com/midwayjs/midway/compare/v2.0.1...v2.0.2) (2020-03-13)


### Bug Fixes

* Add export hsf ([#422](https://github.com/midwayjs/midway/issues/422)) ([55f1e43](https://github.com/midwayjs/midway/commit/55f1e43fbb9bd442939a6bb504aa721297eaf631))





## [2.0.1](https://github.com/midwayjs/midway/compare/v2.0.0...v2.0.1) (2020-03-13)


### Features

* add hsf decorator ([#421](https://github.com/midwayjs/midway/issues/421)) ([d5afed3](https://github.com/midwayjs/midway/commit/d5afed3ace4e3570b29a2c789b2683f0cd4fd697))





# [2.0.0](https://github.com/midwayjs/midway/compare/v2.0.0-beta.16...v2.0.0) (2020-03-13)

**Note:** Version bump only for package midway





# [2.0.0-beta.16](https://github.com/midwayjs/midway/compare/v2.0.0-beta.15...v2.0.0-beta.16) (2020-03-12)


### Bug Fixes

* 修复循环引用bug ([#419](https://github.com/midwayjs/midway/issues/419)) ([8852c6c](https://github.com/midwayjs/midway/commit/8852c6c55de8975aea3df2978bf50425378379e6))





# [2.0.0-beta.15](https://github.com/midwayjs/midway/compare/v2.0.0-beta.14...v2.0.0-beta.15) (2020-03-06)


### Bug Fixes

* disable follow symbolic link ([#413](https://github.com/midwayjs/midway/issues/413)) ([99c30d7](https://github.com/midwayjs/midway/commit/99c30d72ae25001c17372ddd9981b6710af3a3a7))
* merge bug ([7f41fc9](https://github.com/midwayjs/midway/commit/7f41fc94adf1fc9e4465c5aefdf94346184e1efc))
* modified configuration load logic ([#415](https://github.com/midwayjs/midway/issues/415)) ([6e77d36](https://github.com/midwayjs/midway/commit/6e77d3624ed407893b8df1937482bef044b1f36b))


### Features

* 2.x lifecycle ([#414](https://github.com/midwayjs/midway/issues/414)) ([7313ab8](https://github.com/midwayjs/midway/commit/7313ab804091fd410b1b3118ea41f18cf05fb01f))
* feat(eslint-midway-contrib): add pkg for js and ts ([#397](https://github.com/midwayjs/midway/issues/397)) ([3b404a5](https://github.com/midwayjs/midway/commit/3b404a5ed92e6843766634b78db1aa6f321191d8))
* MidwayRequestContainer 增加泛型标注 ([#407](https://github.com/midwayjs/midway/issues/407)) ([b206035](https://github.com/midwayjs/midway/commit/b20603577a99f31ece9720d5f7893c2af7905887))





# [2.0.0-beta.14](https://github.com/midwayjs/midway/compare/v2.0.0-beta.13...v2.0.0-beta.14) (2020-03-04)


### Features

* 2.x pipeline ([#406](https://github.com/midwayjs/midway/issues/406)) ([9eb3e10](https://github.com/midwayjs/midway/commit/9eb3e100ebac966cf58713d4d3f021cd44971150))





# [2.0.0-beta.13](https://github.com/midwayjs/midway/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2020-02-26)


### Bug Fixes

* configuration load config bug ([#404](https://github.com/midwayjs/midway/issues/404)) ([5e18763](https://github.com/midwayjs/midway/commit/5e187633b58e76b606a95063056d670e234c1d22))







**Note:** Version bump only for package midway





# [2.0.0-beta.12](https://github.com/midwayjs/midway/compare/v2.0.0-beta.11...v2.0.0-beta.12) (2020-02-25)


### Bug Fixes

* namespace @ bugfix ([#402](https://github.com/midwayjs/midway/issues/402)) ([e546219](https://github.com/midwayjs/midway/commit/e5462191ec293f98db46cfa59efc446124e2e381))





# [2.0.0-beta.11](https://github.com/midwayjs/midway/compare/v2.0.0-beta.10...v2.0.0-beta.11) (2020-02-25)


### Bug Fixes

* configuration bugs ([#401](https://github.com/midwayjs/midway/issues/401)) ([a6a18b2](https://github.com/midwayjs/midway/commit/a6a18b200252bb0cfa415cc000bcdd5ec5d85701))





# [2.0.0-beta.10](https://github.com/midwayjs/midway/compare/v2.0.0-beta.9...v2.0.0-beta.10) (2020-02-20)


### Bug Fixes

* ts build cwd ([#396](https://github.com/midwayjs/midway/issues/396)) ([83732f9](https://github.com/midwayjs/midway/commit/83732f90c325c646bc6983eac6460a7f65ca1c51))





# [2.0.0-beta.9](https://github.com/midwayjs/midway/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2020-02-20)


### Bug Fixes

* build-tsConfig ([#393](https://github.com/midwayjs/midway/issues/393)) ([fb451b4](https://github.com/midwayjs/midway/commit/fb451b419e0780c9fc803901e186eb38607284dc))





# [2.0.0-beta.8](https://github.com/midwayjs/midway/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2020-02-19)


### Features

* add tsConfig.json to tsc cmd line support ([#392](https://github.com/midwayjs/midway/issues/392)) ([8e368fb](https://github.com/midwayjs/midway/commit/8e368fb7bb0d290817ac0e1d266bf8295a71269c))





# [2.0.0-beta.7](https://github.com/midwayjs/midway/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2020-02-18)

**Note:** Version bump only for package midway





# [2.0.0-beta.6](https://github.com/midwayjs/midway/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2020-02-17)

**Note:** Version bump only for package midway





# [2.0.0-beta.5](https://github.com/midwayjs/midway/compare/v2.0.0-beta.4...v2.0.0-beta.5) (2020-02-17)


### Bug Fixes

* **deps:** add terser to depenencies ([#390](https://github.com/midwayjs/midway/issues/390)) ([a8de587](https://github.com/midwayjs/midway/commit/a8de587))


### Features

* **build:** options to minify all products ([#389](https://github.com/midwayjs/midway/issues/389)) ([d309bdc](https://github.com/midwayjs/midway/commit/d309bdc))
* 2.x namespace ([#388](https://github.com/midwayjs/midway/issues/388)) ([9c90eb1](https://github.com/midwayjs/midway/commit/9c90eb1))





## [1.17.1](https://github.com/midwayjs/midway/compare/v1.17.0...v1.17.1) (2020-02-17)


### Bug Fixes

* **deps:** add terser to depenencies ([#390](https://github.com/midwayjs/midway/issues/390)) ([e6da77e](https://github.com/midwayjs/midway/commit/e6da77e))





# [1.17.0](https://github.com/midwayjs/midway/compare/v1.16.4...v1.17.0) (2020-02-17)


### Features

* **build:** options to minify all products ([#389](https://github.com/midwayjs/midway/issues/389)) ([86d5279](https://github.com/midwayjs/midway/commit/86d5279))





# [2.0.0-beta.4](https://github.com/midwayjs/midway/compare/v1.16.4...v2.0.0-beta.4) (2020-02-16)


### Features

* add namespace feature ([#386](https://github.com/midwayjs/midway/issues/386)) ([bb2a8c8](https://github.com/midwayjs/midway/commit/bb2a8c8))



# [2.0.0-beta.3](https://github.com/midwayjs/midway/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2020-02-08)


### Bug Fixes

* fix build ([1d5a7c1](https://github.com/midwayjs/midway/commit/1d5a7c1))



# [2.0.0-beta.2](https://github.com/midwayjs/midway/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2020-02-04)


### Bug Fixes

* add missing dep module ([04ecc82](https://github.com/midwayjs/midway/commit/04ecc82))



# [2.0.0-beta.1](https://github.com/midwayjs/midway/compare/v1.16.3...v2.0.0-beta.1) (2020-02-04)


### Bug Fixes

* fix requestContext load configService ([f2c874f](https://github.com/midwayjs/midway/commit/f2c874f))


### Features

* support [@configuration](https://github.com/configuration) decorator ([0584494](https://github.com/midwayjs/midway/commit/0584494))
* support importConfigs and add test case ([753cfb4](https://github.com/midwayjs/midway/commit/753cfb4))
* transfor to new package ([9144b48](https://github.com/midwayjs/midway/commit/9144b48))





# [2.0.0-beta.3](https://github.com/midwayjs/midway/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2020-02-08)


### Bug Fixes

* fix build ([1d5a7c1](https://github.com/midwayjs/midway/commit/1d5a7c1))





# [2.0.0-beta.2](https://github.com/midwayjs/midway/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2020-02-04)


### Bug Fixes

* add missing dep module ([04ecc82](https://github.com/midwayjs/midway/commit/04ecc82))





# [2.0.0-beta.1](https://github.com/midwayjs/midway/compare/v1.16.3...v2.0.0-beta.1) (2020-02-04)


### Bug Fixes

* egg bin modify setup file rule ([#380](https://github.com/midwayjs/midway/issues/380)) ([4b9461d](https://github.com/midwayjs/midway/commit/4b9461d))
* fix requestContext load configService ([f2c874f](https://github.com/midwayjs/midway/commit/f2c874f))


### Features

* support [@configuration](https://github.com/configuration) decorator ([0584494](https://github.com/midwayjs/midway/commit/0584494))
* support importConfigs and add test case ([753cfb4](https://github.com/midwayjs/midway/commit/753cfb4))
* transfor to new package ([9144b48](https://github.com/midwayjs/midway/commit/9144b48))


## [1.16.4](https://github.com/midwayjs/midway/compare/v1.16.3...v1.16.4) (2020-02-11)


### Bug Fixes

* egg bin modify setup file rule ([#380](https://github.com/midwayjs/midway/issues/380)) ([4b9461d](https://github.com/midwayjs/midway/commit/4b9461d))
* executing midway-bin build at arbitrary directory ([#384](https://github.com/midwayjs/midway/issues/384)) ([1ace418](https://github.com/midwayjs/midway/commit/1ace418))





## [1.16.3](https://github.com/midwayjs/midway/compare/v1.16.2...v1.16.3) (2019-12-25)

**Note:** Version bump only for package midway





## [1.16.2](https://github.com/midwayjs/midway/compare/v1.16.1...v1.16.2) (2019-12-25)


### Bug Fixes

* fix ts mode value is empty for non-ts items ([ef3b46a](https://github.com/midwayjs/midway/commit/ef3b46a))
* interface scheduleOpts ([2ae0766](https://github.com/midwayjs/midway/commit/2ae0766))





## [1.16.1](https://github.com/midwayjs/midway/compare/v1.16.0...v1.16.1) (2019-12-16)

**Note:** Version bump only for package midway





# [1.16.0](https://github.com/midwayjs/midway/compare/v1.15.1...v1.16.0) (2019-12-16)

**Note:** Version bump only for package midway





## [1.15.1](https://github.com/midwayjs/midway/compare/v1.15.0...v1.15.1) (2019-12-11)


### Bug Fixes

* use co wrap generator for egg-bin run method ([14cdb2d](https://github.com/midwayjs/midway/commit/14cdb2d))


### Features

* **midway-bin:** do not populate exec argv to child processes ([f22c858](https://github.com/midwayjs/midway/commit/f22c858))





# [1.15.0](https://github.com/midwayjs/midway/compare/v1.14.4...v1.15.0) (2019-12-06)


### Bug Fixes

* ignore app/extend/* when loader start ([4db9e9b](https://github.com/midwayjs/midway/commit/4db9e9b))
* **midway-bin:** log message grammar ([30091d0](https://github.com/midwayjs/midway/commit/30091d0))


### Features

* **midway-bin:** add bundle support ([9894049](https://github.com/midwayjs/midway/commit/9894049))
* **midway-bin:** use async-await instead of generator ([eed48f1](https://github.com/midwayjs/midway/commit/eed48f1))





## [1.14.4](https://github.com/midwayjs/midway/compare/v1.14.3...v1.14.4) (2019-11-20)


### Bug Fixes

* fix lint ([77177fb](https://github.com/midwayjs/midway/commit/77177fb))





## [1.14.3](https://github.com/midwayjs/midway/compare/v1.14.2...v1.14.3) (2019-11-15)


### Bug Fixes

* midway-bin include jest config ([20e2a86](https://github.com/midwayjs/midway/commit/20e2a86))





## [1.14.2](https://github.com/midwayjs/midway/compare/v1.14.1...v1.14.2) (2019-11-10)

**Note:** Version bump only for package midway





## [1.14.1](https://github.com/midwayjs/midway/compare/v1.14.0...v1.14.1) (2019-11-03)

**Note:** Version bump only for package midway





# [1.14.0](https://github.com/midwayjs/midway/compare/v1.13.0...v1.14.0) (2019-11-01)


### Features

* add egg-init args ([d6c3582](https://github.com/midwayjs/midway/commit/d6c3582))
* support npm registry parameter ([d9adfcf](https://github.com/midwayjs/midway/commit/d9adfcf))
* use new generator for midway-init ([634b748](https://github.com/midwayjs/midway/commit/634b748))





# [1.13.0](https://github.com/midwayjs/midway/compare/v1.12.1...v1.13.0) (2019-10-16)


### Features

* export IBoot and IgnoreOrMatch from egg ([d5abb3d](https://github.com/midwayjs/midway/commit/d5abb3d))





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
