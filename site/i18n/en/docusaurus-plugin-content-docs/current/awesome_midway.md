# Awesome Midway

The following lists high-quality community projects related to Midwayjs

## Microservices

| Name                                         | Author      | Description                                                                                                                                                                                         |
| -------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@letscollab/midway-nacos][@lnulls]          | Nawbc       | midway nacos component                                                                                                                                                                              |
| [midway-elasticsearch][midway-elasticsearch] | ddzyan      | Mi1dway elasticsearch component                                                                                                                                                                     |
| [midway-apollo][midway-apollo]               | helloHT     | Midway Ctrip Asynchronous Dynamic Configuration apollo Components                                                                                                                                   |
| [@mwcp/cache][@mwcp/cache]                   | waitingsong | midway Cache Component supports [`Cacheable`][Cacheable], [`CacheEvict`][CacheEvict], [`CachePut`][CachePut] decorators and supports generics for [obtaining method parameter type][cache-generics] |
| [@mwcp/kmore][@mwcp/kmore]                   | waitingsong | midway Database QueryBuilder base on [Knex], declarative transaction via `Transactional` decorator, intergrated [OpenTelemetry] trace                                                               |
| [@mwcp/otel][@mwcp/otel]                     | waitingsong | midway [OpenTelemetry] component supports [`Trace`][Trace], [`TraceLog`][TraceLog], [`TraceInit`][TraceInit] decorators and supports generics for [obtaining method parameter type][otel-generics]  |
| [@mwcp/jwt][@mwcp/jwt]                       | waitingsong | midway JWT component supports [`Public`][jwt-public] decorator                                                                                                                                      |


|  [@mwcp/paradedb][@mwcp/paradedb]                    | waitingsong | midway [ParadeDb] component. Postgres for Search & Analytics —— Modern Elasticsearch Alternative built on Postgres  |
| [@mwcp/pgmq][@mwcp/pgmq]                     | waitingsong | midway [pqmg-js] component supports [`Consumer`][Consumer], [`PgmqListener`][PgmqListener] decorators. [PGMQ] is a lightweight message queue based on [PG] database, with native support for message persistence and delayed messages, similar to AWS SQS or RSMQ |

| [midway-throttler][midway-throttler]         | larryzhuo   | midway throttler current limiting component                                                                                                                                                         |
| [邮件组件][mailer-zh]                        | MrDotYan    | midway 邮箱组件，基于nodemailer和midwayjs，以服务的形式注入控制器使用[食用文档（国内）][mailer-zh-doc]                                                                                              |
## swagger

| Name                                   | Author | Description             |
| -------------------------------------- | ------ | ----------------------- |
| [midwayjs-knife4j2][midwayjs-knife4j2] | Junyi  | Midway swagger new skin |

## Template rendering

| Name                                                       | Author     | Description                                                                                         |
| ---------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| [yuntian001/midway-vite-view][yuntian001/midway-vite-view] | yuntian001 | The midway vite server-side rendering (ssr)/client rendering (client) component supports vue3 react |

## Community example

| Name                               | Author            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [midwayjs-crud][midwayjs-crud]     | DeveloperYvan     | An example containing prisma + casbin + nacos + crud                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [midway-practice][midway-practice] | ddzyan            | An example of three mainstream ORM models (sequelize,typeORM,prisma) including request log link, unified response body, unified exception handling, and exception filter.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [midway-boot][midway-boot]         | Code channel hero | A relatively complete best practice for back-end functions, including: addition, deletion, modification, check and base class encapsulation, database operation, cache operation, user security authentication and access security control, JWT access credentials, distributed access status management, password encryption and decryption, unified return result encapsulation, unified exception management, Snowflake primary key generation, Swagger integration and support for access authentication, use of environment variables, Docker image construction, Serverless release, etc. |
| [midway-vue3-ssr][midway-vue3-ssr] | LiQingSong        | Based on the SSR framework assembled by Midway and Vue 3, it is simple, easy to learn and use, easy to expand and integrate Midway framework, which is the Vue SSR framework you have always wanted.                                                                                                                                                                                                                                                                                                                                                                                            |
| [midway-learn][midway-learn]       | hbsjmsjwj         | A demo for learning midway, including midway3 + egg + official Components & extensions (consul, JWT, typeorm, Prometheus, swagger, mysql2, gRPC, RabbitMQ)                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## Learning materials

| Name                        | Author            | Description                             |
| --------------------------- | ----------------- | --------------------------------------- |
| Midway development practice | Code channel hero | https://edu.51cto.com/course/32086.html |


:::tip
Welcome everyone to contribute to the community, edit this page and add your favorite high-quality midway projects/components.
:::


[midway-elasticsearch]: https://github.com/ddzyan/midway-elasticsearch
[midway-apollo]: https://github.com/helloHT/midway-apollo
[@letscollab/midway-nacos]: https://github.com/deskbtm-letscollab/midway-nacos
[@mwcp/kmore]: https://github.com/waitingsong/kmore

[@mwcp/cache]: https://github.com/waitingsong/midway-components/tree/main/packages/cache
[Cacheable]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.md#cacheable-decorator
[CacheEvict]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.md#cacheevict-decorator
[CachePut]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.md#cacheput-decorator

[@mwcp/otel]: https://github.com/waitingsong/midway-components/tree/main/packages/otel
[Trace]: https://github.com/waitingsong/midway-components/tree/main/packages/otel#trace-decorator
[TraceLog]: https://github.com/waitingsong/midway-components/tree/main/packages/otel#tracelog-decorator
[TraceInit]: https://github.com/waitingsong/midway-components/tree/main/packages/otel#traceinit-decorator
[otel-generics]: https://github.com/waitingsong/midway-components/tree/main/packages/otel#auto-parameter-type-of-keygenerator-from-generics
[otel-generics-cn]: https://github.com/waitingsong/midway-components/blob/main/packages/otel/README.zh-CN.md#%E4%BB%8E%E6%B3%9B%E5%9E%8B%E5%8F%82%E6%95%B0%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96%E6%96%B9%E6%B3%95%E8%B0%83%E7%94%A8%E5%8F%82%E6%95%B0%E7%B1%BB%E5%9E%8B
[cache-generics]: https://github.com/waitingsong/midway-components/tree/main/packages/cache#auto-parameter-type-of-keygenerator-from-generics
[cache-generics-cn]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/README.zh-CN.md#%E4%BB%8E%E6%B3%9B%E5%9E%8B%E5%8F%82%E6%95%B0%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96%E6%96%B9%E6%B3%95%E8%B0%83%E7%94%A8%E5%8F%82%E6%95%B0%E7%B1%BB%E5%9E%8B

[@mwcp/jwt]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt
[jwt-public]: https://github.com/waitingsong/midway-components/blob/main/packages/jwt/README.md#public-decorator

[@mwcp/paradedb]: https://github.com/waitingsong/paradedb/tree/main/packages/mwcp-paradedb
[ParadeDB]: https://www.paradedb.com/

[@mwcp/pgmq]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js
[PGMQ]: https://tembo-io.github.io/pgmq/
[PG]: https://pigsty.cc/blog/pg/pg-eat-db-world/
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
