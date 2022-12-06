# Awesome Midway

以下列举了与 Midwayjs 相关的优质社区项目

## 微服务

| 名称                                                 | 作者        | 描述                                                                                                                            |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [@letscollab/midway-nacos][@letscollab/midway-nacos] | Nawbc       | midway nacos 组件                                                                                                               |
| [midway-elasticsearch][midway-elasticsearch]         | ddzyan      | midway elasticsearch 组件                                                                                                       |
| [midway-apollo][midway-apollo]                       | helloHT     | midway 携程异步动态配置 apollo 组件                                                                                             |
| [@mwcp/cache][@mwcp/cache]                           | waitingsong | midway Cache 组件 支持 `Cacheable`, `CacheEvict`, `CachePut` 装饰器                                                             |
| [@mwcp/kmore][@mwcp/kmore]                           | waitingsong | midway 数据库组件 基于 [Knex]，通过 `Transactional` 装饰器支持声明式事务，支持自动分页、智能连表，集成 [OpenTelemetry] 链路追踪 |
| [@mwcp/otel][@mwcp/otel]                             | waitingsong | midway [OpenTelemetry] 组件 支持 `Trace` 装饰器                                                                                 |
| [midway-throttler][midway-throttler]                 | larryzhuo   | midway throttler 限流组件                                                                                                       |

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
[@mwcp/otel]: https://github.com/waitingsong/midway-components/tree/main/packages/otel

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
