---
title: 现有装饰器索引
---

|                              | 场景         | 作用                                      |
| ---------------------------- | ------------ | ----------------------------------------- |
| **@midwayjs/decorator 提供** |              |                                           |
| @Provide                     | 基础依赖注入 | 暴露一个 class，让 IoC 容器能够获取元数据 |
| @Inject                      |              | 注入一个 IoC 容器中的对象                 |
| @Scope                       | 实例管理     | 指定作用域                                |
| @Init                        |              | 标注对象初始化时自动执行的方法            |
| @Destroy                     |              | 标注对象销毁时执行的方法                  |
| @Async                       |              | 【已废弃】表明为异步函数                  |
| @Autowire                    |              | 【已废弃】标识类为自动注入属性            |
| @Autoload                    |              | 让类可以自加载执行                        |
| @Configuration               | 通用功能扩展 | 标识一个容器入口配置类                    |
| @Aspect                      |              | 标识拦截器                                |
| @Validate                    |              | 标识方法，需要被验证                      |
| @Rule                        |              | 标识 DTO 的校验规则                       |
| @App                         |              | 注入当前应用实例                          |
| @Config                      |              | 获取配置                                  |
| @Logger                      |              | 获取日志实例                              |
| @Controller                  | Web 场景     | 标识为一个 Web 控制器                     |
| @Get                         |              | 注册为一个 GET 类型的路由                 |
| @Post                        |              | 注册为一个 POST 类型的路由                |
| @Del                         |              | 注册为一个 DELETE 类型的路由              |
| @Put                         |              | 注册为一个 PUT 类型的路由                 |
| @Patch                       |              | 注册为一个 PATCH 类型的路由               |
| @Options                     |              | 注册为一个 OPTIONS 类型的路由             |
| @Head                        |              | 注册为一个 HEAD 类型的路由                |
| @All                         |              | 注册为一个全类型的路由                    |
| @Session                     |              | 从参数获取 ctx.session                    |
| @Body                        |              | 从参数获取 ctx.body                       |
| @Query                       |              | 从参数获取 ctx.query                      |
| @Param                       |              | 从参数获取 ctx.param                      |
| @Headers                     |              | 从参数获取 ctx.headers                    |
| @Priority                    |              | 【废弃】路由加载优先级                    |
| @Redirect                    |              | 修改响应跳转                              |
| @HttpCode                    |              | 修改响应状态码                            |
| @SetHeader                   |              | 修改响应头                                |
| @ContentType                 |              | 修改响应头中的 Content-Type 字段          |
| @Schedule                    | Egg          | 标识为一个定时任务                        |
| @Plugin                      |              | 获取 egg 插件                             |
| @Provider                    | 微服务场景   | 暴露微服务提供者（生产者）                |
| @Consumer                    |              | 暴露微服务调用者（消费者）                |
| @GrpcMethod                  |              | 标识暴露的 gRPC 方法                      |
| @Func                        | 函数场景     | 【逐步废弃】标识为一个函数入口            |
| @Handler                     |              | 【逐步废弃】配合标记函数                  |
| @Match                       |              | 【已废弃】                                |
| @ServerlessTrigger           |              | 标识一个函数触发器                        |
| @Task                        | 任务模块     | 定义一个分布式任务                        |
| @TaskLocal                   |              | 定义一个本地任务                          |
| @Queue                       |              | 定义一个自触发的任务                      |
|                              |              |                                           |
| **@midwayjs/orm 提供**       |              |                                           |
| @EntityModel                 |              | 定义一个实体对象                          |
| @InjectEntityModel           |              | 注入一个实体对象                          |
| @EventSubscriberModel        |              | 定义事件订阅                              |
|                              |              |                                           |
| **@midwayjs/swagger 提供**   |              |                                           |
| @CreateApiDoc                |              | 创建一个 API                              |
| @CreateApiPropertyDoc        |              | 创建一个 API 属性                         |
|                              |              |                                           |
