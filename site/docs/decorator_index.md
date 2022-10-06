# 现有装饰器索引

Midway 提供了很多装饰器能力，这些装饰器分布在不同的包，也提供了不同的功能，本章节提供一个快速反查的列表。

## @midwayjs/decorator

| 装饰器             | 修饰位置     | 描述                                      |
| ------------------ | ------------ | ----------------------------------------- |
| @Provide           | Class        | 暴露一个 class，让 IoC 容器能够获取元数据 |
| @Inject            | Property     | 注入一个 IoC 容器中的对象                 |
| @Scope             | Class        | 指定作用域                                |
| @Init              | Method       | 标注对象初始化时自动执行的方法            |
| @Destroy           | Method       | 标注对象销毁时执行的方法                  |
| @Async             | Class        | 【已废弃】表明为异步函数                  |
| @Autowire          | Class        | 【已废弃】标识类为自动注入属性            |
| @Autoload          | Class        | 让类可以自加载执行                        |
| @Configuration     | Class        | 标识一个容器入口配置类                    |
| @Aspect            | Class        | 标识拦截器                                |
| @Validate          | Method       | 标识方法，需要被验证                      |
| @Rule              | Property     | 标识 DTO 的校验规则                       |
| @App               | Property     | 注入当前应用实例                          |
| @Config            | Property     | 获取配置                                  |
| @Logger            | Property     | 获取日志实例                              |
| @Controller        | Class        | 标识为一个 Web 控制器                     |
| @Get               | Method       | 注册为一个 GET 类型的路由                 |
| @Post              | Method       | 注册为一个 POST 类型的路由                |
| @Del               | Method       | 注册为一个 DELETE 类型的路由              |
| @Put               | Method       | 注册为一个 PUT 类型的路由                 |
| @Patch             | Method       | 注册为一个 PATCH 类型的路由               |
| @Options           | Method       | 注册为一个 OPTIONS 类型的路由             |
| @Head              | Method       | 注册为一个 HEAD 类型的路由                |
| @All               | Method       | 注册为一个全类型的路由                    |
| @Session           | Parameter    | 从参数获取 ctx.session                    |
| @Body              | Parameter    | 从参数获取 ctx.request.body               |
| @Query             | Parameter    | 从参数获取 ctx.query                      |
| @Param             | Parameter    | 从参数获取 ctx.param                      |
| @Headers           | Parameter    | 从参数获取 ctx.headers                    |
| @File              | Parameter    | 从参数获取第一个上传文件                  |
| @Files             | Parameter    | 从参数获取所有的上传文件                  |
| @Fields            | Parameter    | 从参数获取表单 Field（上传时）            |
| @Redirect          | Method       | 修改响应跳转                              |
| @HttpCode          | Method       | 修改响应状态码                            |
| @SetHeader         | Method       | 修改响应头                                |
| @ContentType       | Method       | 修改响应头中的 Content-Type 字段          |
| @Schedule          | Class        | 标识为一个 egg 定时任务                   |
| @Plugin            | Property     | 获取 egg 插件                             |
| @Provider          | Class        | 暴露微服务提供者（生产者）                |
| @Consumer          | Class        | 暴露微服务调用者（消费者）                |
| @GrpcMethod        | Method       | 标识暴露的 gRPC 方法                      |
| @Func              | Class/Method | 【已废弃】标识为一个函数入口              |
| @Handler           | Method       | 【已废弃】配合标记函数                    |
| @ServerlessTrigger | Method       | 标识一个函数触发器                        |
| @Task              | Method       | 定义一个分布式任务                        |
| @TaskLocal         | Method       | 定义一个本地任务                          |
| @Queue             | Class        | 定义一个自触发的任务                      |



## @midwayjs/orm

| 装饰器                | 修饰位置 | 作用             |
| --------------------- | -------- | ---------------- |
| @EntityModel          | Class    | 定义一个实体对象 |
| @InjectEntityModel    | Property | 注入一个实体对象 |
| @EventSubscriberModel | Class    | 定义事件订阅     |



## @midwayjs/validate

| 装饰器    | 修饰位置 | 描述                   |
| --------- | -------- | ---------------------- |
| @Rule     | Property | 定义一个规则           |
| @Validate | Method   | 标识一个需要校验的方法 |



## @midwayjs/swagger

| 装饰器                  | 修饰位置          | 描述 |
| ----------------------- | ----------------- | ---- |
| `@ApiBody`              | Method            |      |
| `@ApiExcludeEndpoint`   | Method            |      |
| `@ApiExcludeController` | Class             |      |
| `@ApiHeader`            | Class/Method      |      |
| `@ApiHeaders`           | Class/Method      |      |
| `@ApiOperation`         | Method            |      |
| `@ApiProperty`          | Property          |      |
| `@ApiPropertyOptional`  | Property          |      |
| `@ApiResponseProperty`  | Property          |      |
| `@ApiQuery`             | Method            |      |
| `@ApiResponse`          | Method            |      |
| `@ApiTags`              | Controller/Method |      |
| `@ApiExtension`         | Method            |      |
| `@ApiBasicAuth`         | Controller        |      |
| `@ApiBearerAuth`        | Controller        |      |
| `@ApiCookieAuth`        | Controller        |      |
| `@ApiOAuth2`            | Controller        |      |
| `@ApiSecurity`          | Controller        |      |
| `@ApiParam`             | Method            |      |
| `@ApiParam`             | Method            |      |
