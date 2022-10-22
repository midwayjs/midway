# Existing decorator index

Midway provides a lot of decorator capabilities. These decorators are distributed in different packages and also provide different functions. This chapter provides a quick check list.

## @midwayjs/decorator

| Decorator | Modification position | Description |
| ------------------ | ------------ | ----------------------------------------- |
| @Provide | Class | Expose a class to enable IoC containers to obtain metadata |
| @Inject | Property | Inject objects into an IoC container |
| @Scope | Class | Specify scope |
| @Init | Method | The method that is automatically executed when the annotation object is initialized. |
| @Destroy | Method | The method performed when the annotation object is destroyed. |
| @Async | Class | **[Deprecated]** Indicates that it is an asynchronous function |
| @Autowire | Class | **[Deprecated]** The identification class is an automatic injection attribute |
| @Autoload | Class | Allows classes to self-load execution |
| @Configuration | Class | Identifies a container entry configuration class |
| @Aspect | Class | Identification interceptor |
| @Validate | Method | Identification method, need to be verified |
| @Rule | Property | Check rules that identify DTO |
| @App | Property | Inject the current application instance |
| null | Property | Get configuration |
| @Logger | Property | Get a log instance |
| @Controller | Class | Identified as a Web controller |
| @Get | Method | Register as a route of GET type |
| @Post | Method | Register as a POST type route |
| @Del | Method | Register as a route of type DELETE |
| @Put | Method | Registered as a PUT type route |
| @Patch | Method | Register as a PATCH type route |
| @Options | Method | Register as a route of OPTIONS type |
| @Head | Method | Register as a route of type HEAD |
| @All | Method | Register as a full-type route |
| @Session | Parameter | Get ctx.session from parameter |
| @Body | Parameter | Get ctx.request.body from parameters |
| @Query | Parameter | Get ctx.query from parameter |
| @Param | Parameter | Get ctx.param from parameter |
| @Headers | Parameter | Get ctx.headers from parameter |
| @File | Parameter | Get the first upload file from the parameter |
| @Files | Parameter | Get all uploaded files from parameters |
| @Fields | Parameter | Get Form Field from Parameters (when uploading) |
| @Redirect | Method | Modify response jump |
| @HttpCode | Method | Modify the response status code |
| @SetHeader | Method | Modify response header |
| @ContentType | Method | Modify the Content-Type field in the response header |
| @Schedule | Class | Identified as an egg timed task |
| @Plugin | Property | Get egg plug-in |
| @Provider | Class | Exposed microservice providers (producers) |
| @Consumer | Class | Exposed microservice caller (consumer) |
| @GrpcMethod | Method | Identify exposed gRPC methods |
| @Func | Class/Method | **[Deprecated]**  is identified as a function entry |
| @Handler | Method | **[Deprecated]**  Cooperate with Marking Function |
| null | Method | Identifies a function trigger |
| @Task | Method | Define a distributed task |
| @TaskLocal | Method | Define a local task |
| null | Class | Define a self-triggered task |



## @midwayjs/orm

| Decorator | Modification position | Role |
| --------------------- | -------- | ---------------- |
| @EntityModel | Class | Define an entity object |
| @InjectEntityModel | Property | Inject an entity object |
| @EventSubscriberModel | Class | Define event subscriptions |



## @midwayjs/validate

| Decorator | Modification position | Description |
| --------- | -------- | ---------------------- |
| @Rule | Property | Define a rule |
| @Validate | Method | Identify a method that requires verification |



## @midwayjs/swagger

| Decorator | Modification position | Description |
| ----------------------- | ----------------- | ---- |
| `@ApiBody` | Method |      |
| `@ApiExcludeEndpoint` | Method |      |
| `@ApiExcludeController` | Class |      |
| `@ApiHeader` | Class/Method |      |
| `@ApiHeaders` | Class/Method |      |
| `@ApiOperation` | Method |      |
| `@ApiProperty` | Property |      |
| `@ApiPropertyOptional` | Property |      |
| `@ApiResponseProperty` | Property |      |
| `@ApiQuery` | Method |      |
| `@ApiResponse` | Method |      |
| `@ApiTags` | Controller/Method |      |
| `@ApiExtension` | Method |      |
| `@ApiBasicAuth` | Controller |      |
| `@ApiBearerAuth` | Controller |      |
| `@ApiCookieAuth` | Controller |      |
| `@ApiOAuth2` | Controller |      |
| `@ApiSecurity` | Controller |      |
| `@ApiParam` | Method |      |
| `@ApiParam` | Method |      |
