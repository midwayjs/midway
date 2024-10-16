# Awesome Midway

以下列举了与 Midwayjs 相关的优质社区项目

## 微服务

| 名称                                                 | 作者        | 描述                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [@letscollab/midway-nacos][@letscollab/midway-nacos] | Nawbc       | midway nacos 组件                                                                                                                                                                                                                                            |
| [midway-elasticsearch][midway-elasticsearch]         | ddzyan      | midway elasticsearch 组件                                                                                                                                                                                                                                    |
| [midway-apollo][midway-apollo]                       | helloHT     | midway 携程异步动态配置 apollo 组件                                                                                                                                                                                                                          |
| [@mwcp/cache][@mwcp/cache]                           | waitingsong | midway Cache 增强组件 支持 [`Cacheable`][Cacheable], [`CacheEvict`][CacheEvict], [`CachePut`][CachePut] 装饰器 并支持[传入泛型参数获得方法入参类型][cache-generics-cn]                                                                                       |
| [@mwcp/kmore][@mwcp/kmore]                           | waitingsong | midway 数据库组件 基于 [Knex]，通过 `Transactional` 装饰器支持声明式事务，支持自动分页、智能连表，集成 [OpenTelemetry] 链路追踪                                                                                                                              |
| [@mwcp/otel][@mwcp/otel]                             | waitingsong | midway [OpenTelemetry] 增强组件 支持 [`Trace`][Trace], [`TraceLog`][TraceLog], [`TraceInit`][TraceInit] 装饰器  并支持[传入泛型参数获得方法入参类型][otel-generics-cn]                                                                                       |
| [@mwcp/jwt][@mwcp/jwt]                               | waitingsong | midway JWT 增强组件 支持 [`Public`][jwt-public] 装饰器                                                                                                                                                                                                       |
| [@mwcp/pgmq][@mwcp/pgmq]                             | waitingsong | midway [pqmg-js] 组件 支持 [`Consumer`][Consumer], [`PgmqListener`][PgmqListener] 装饰器， 支持事务以及事务保护的类似 MQ `Exchange` 概念的路由。  [PGMQ] 是一个基于 [PG] 数据库扩展的轻量级消息队列，原生支持消息持久化和延迟消息，类似 `AWS SQS` 或  `RSMQ` |
| [midway-throttler][midway-throttler]                 | larryzhuo   | midway throttler 限流组件                                                                                                                                                                                                                                    |
                                                                                                 

## 插件
| 名称                                                 | 作者        | 描述                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [邮件组件][mailer-zh]                                | MrDotYan    | midway 邮箱组件，基于nodemailer和midwayjs，以服务的形式注入控制器使用[食用文档（国内）][mailer-zh-doc]    [食用文档（国外）][mailer-en-doc]                                                                                                                  |

## swagger

| 名称                                   | 作者  | 描述                  |
| -------------------------------------- | ----- | --------------------- |
| [midwayjs-knife4j2][midwayjs-knife4j2] | Junyi | midway swagger 新皮肤 |

## 模板渲染

| 名称                                                       | 作者       | 描述                                                                 |
| ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| [yuntian001/midway-vite-view][yuntian001/midway-vite-view] | yuntian001 | midway vite 服务端渲染(ssr)/客户端渲染（client）组件 支持 vue3 react |

## 社区示例

| 名称                               | 作者          | 描述                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [midwayjs-crud][midwayjs-crud]     | DeveloperYvan | 一个包含 prisma+casbin+nacos+crud 的示例                                                                                                                                                                                                                                                     |
| [midway-practice][midway-practice] | ddzyan        | 一个包含 请求日志链路，统一响应体，统一异常处理，异常过滤器 + 三大主流 ORM 模型 (sequelize，typeORM，prisma) 的示例                                                                                                                                                                          |
| [midway-boot][midway-boot]         | 码道功臣      | 一个比较完整的后端功能最佳实践，包含：增删改查及基类封装、数据库操作、缓存操作、用户安全认证及访问安全控制、JWT 访问凭证、分布式访问状态管理、密码加解密、统一返回结果封装、统一异常管理、Snowflake 主键生成、Swagger 集成及支持访问认证、环境变量的使用、Docker 镜像构建、Serverless 发布等 |
| [midway-vue3-ssr][midway-vue3-ssr] | LiQingSong    | 基于 Midway、Vue 3 组装的 SSR 框架，简单、易学易用、方便扩展、集成 Midway 框架，您一直想要的 Vue SSR 框架。                                                                                                                                                                                  |
| [midway-learn][midway-learn]       | hbsjmsjwj     | 一个学习midway的demo，包含 midway3 + egg + 官方的组件&扩展（consul, jwt, typeorm, prometheus, swagger, mysql2,grpc,rabbitmq）                                                                                                                                                                |
| [midwayjs-admin][midwayjs-admin] | MrDotYan |一套GeekerAdmin+Midwayjs构建的后台管理框架，不定时更新 |


## 学习资料

| 名称           | 作者     | 描述                                    |
| -------------- | -------- | --------------------------------------- |
| Midway开发实践 | 码道功臣 | https://edu.51cto.com/course/32086.html |


:::tip
欢迎大家为社区贡献力量， 编辑此页添加你所喜爱的高质量 midway 项目/组件
:::


[midway-elasticsearch]: https://github.com/ddzyan/midway-elasticsearch
[midway-apollo]: https://github.com/helloHT/midway-apollo
[@letscollab/midway-nacos]: https://github.com/deskbtm-letscollab/midway-nacos
[@mwcp/kmore]: https://github.com/waitingsong/kmore

[@mwcp/cache]: https://github.com/waitingsong/midway-components/tree/main/packages/cache
[Cacheable]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.zh-CN.md#cacheable-%E8%A3%85%E9%A5%B0%E5%99%A8
[CacheEvict]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.zh-CN.md#cacheevict-%E8%A3%85%E9%A5%B0%E5%99%A8
[CachePut]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.zh-CN.md#cacheput-%E8%A3%85%E9%A5%B0%E5%99%A8

[@mwcp/otel]: https://github.com/waitingsong/midway-components/tree/main/packages/otel
[Trace]: https://github.com/waitingsong/midway-components/blob/main/packages/otel/README.zh-CN.md#trace-%E8%A3%85%E9%A5%B0%E5%99%A8
[TraceLog]: https://github.com/waitingsong/midway-components/blob/main/packages/otel/README.zh-CN.md#tracelog-%E8%A3%85%E9%A5%B0%E5%99%A8
[TraceInit]: https://github.com/waitingsong/midway-components/blob/main/packages/otel/README.zh-CN.md#traceinit-%E8%A3%85%E9%A5%B0%E5%99%A8
[otel-generics]: https://github.com/waitingsong/midway-components/tree/main/packages/otel#auto-parameter-type-of-keygenerator-from-generics
[otel-generics-cn]: https://github.com/waitingsong/midway-components/blob/main/packages/otel/README.zh-CN.md#%E4%BB%8E%E6%B3%9B%E5%9E%8B%E5%8F%82%E6%95%B0%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96%E6%96%B9%E6%B3%95%E8%B0%83%E7%94%A8%E5%8F%82%E6%95%B0%E7%B1%BB%E5%9E%8B
[cache-generics]: https://github.com/waitingsong/midway-components/tree/main/packages/cache#auto-parameter-type-of-keygenerator-from-generics
[cache-generics-cn]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.zh-CN.md#%E4%BB%8E%E6%B3%9B%E5%9E%8B%E5%8F%82%E6%95%B0%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96%E6%96%B9%E6%B3%95%E8%B0%83%E7%94%A8%E5%8F%82%E6%95%B0%E7%B1%BB%E5%9E%8B

[@mwcp/jwt]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt
[jwt-public]: https://github.com/waitingsong/midway-components/blob/main/packages/jwt/README.md#public-decorator

[@mwcp/pgmq]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js
[PGMQ]: https://tembo-io.github.io/pgmq/
[PG]: https://pigsty.cc/zh/blog/pg/pg-eat-db-world/
[pqmg-js]: https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js
[Consumer]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js#consumer-decorator
[PgmqListener]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js#consumer-decorator

[midwayjs-knife4j2]: https://github.com/fangbao-0418/midway/tree/master/packages/swagger
[yuntian001/midway-vite-view]: https://github.com/yuntian001/midway-vite-view

[midwayjs-crud]: https://github.com/developeryvan/midwayjs-crud
[midway-practice]: https://github.com/ddzyan/midway-practice
[midway-boot]: https://github.com/bestaone/midway-boot
[midway-vue3-ssr]: https://github.com/lqsong/midway-vue3-ssr
[midway-learn]: https://github.com/hbsjmsjwj/midway-learn.git
[midway-throttler]: https://github.com/larryzhuo/midway-throttler

[Knex]: https://knexjs.org/
[OpenTelemetry]: https://github.com/open-telemetry
[mailer-zh]:https://gitee.com/onlymry_admin/midwayjs_mailer
[mailer-zh-doc]:https://gitee.com/onlymry_admin/midwayjs_mailer/blob/main/readme.md
[mailer-en]:https://github.com/MrDotYan/midwayjs_mailer
[mailer-en-doc]:https://github.com/MrDotYan/midwayjs_mailer/blob/main/readme.md
[midwayjs-admin]: https://gitee.com/yncykj/midway-admin.git
