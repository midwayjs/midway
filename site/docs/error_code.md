# 框架错误码

以下是框架内置的错误，随着时间推移，我们会不断增加。

| 错误码       | 错误名                                | 错误描述                     |
| ------------ | ------------------------------------- | ---------------------------- |
| MIDWAY_10000 | 占位使用                              | 未知错误                     |
| MIDWAY_10001 | MidwayCommonError                     | 未分类的错误                 |
| MIDWAY_10002 | MidwayParameterError                  | 参数类型错误                 |
| MIDWAY_10003 | MidwayDefinitionNotFoundError         | 依赖注入定义未找到           |
| MIDWAY_10004 | MidwayFeatureNoLongerSupportedError   | 功能不再支持                 |
| MIDWAY_10005 | MidwayFeatureNotImplementedError      | 功能未实现                   |
| MIDWAY_10006 | MidwayConfigMissingError              | 配置项丢失                   |
| MIDWAY_10007 | MidwayResolverMissingError            | 依赖注入属性 resovler 未找到 |
| MIDWAY_10008 | MidwayDuplicateRouteError             | 路由重复                     |
| MIDWAY_10009 | MidwayUseWrongMethodError             | 使用了错误的方法             |
| MIDWAY_10010 | MidwaySingletonInjectRequestError     | 作用域混乱                   |
| MIDWAY_10011 | MidwayMissingImportComponentError     | 组件未导入                   |
| MIDWAY_10012 | MidwayUtilHttpClientTimeoutError      | http client 调用超时         |
| MIDWAY_10013 | MidwayInconsistentVersionError        | 使用了不正确的依赖版本       |
| MIDWAY_10014 | MidwayInvalidConfigError              | 无效的配置                   |
| MIDWAY_10015 | MidwayDuplicateClassNameError         | 重复的类名                   |
| MIDWAY_10016 | MidwayDuplicateControllerOptionsError | 重复的控制器参数             |



## MIDWAY_10001

**问题描述**

最通用的框架错误，在不分类的情况下会抛出，一般会将错误的详细内容写入错误信息

**解决方案**

排错以错误信息为准。



## MIDWAY_10002

**问题描述**

方法的参数传入错误，可能类型不对或者参数格式有误。

**解决方案**

参考方法定义或者文档传入参数。



## MIDWAY_10003

**问题描述**

一般出现在启动或者动态从容器中获取某个类的时候，如果该类未在容器中注册，就会报出 `xxx is not valid in current context`错误。

**解决方案**

可能的情况，比如在业务代码或者组件使用中：

```typescript
// ...

export class UserService {}

// ...
@Controller()
export class HomeController {
  @Inject()
  userService: UserService;
}
```

如果 `UserService` 没有写 `@Provide` 或者隐式含有 `@Provide` 的装饰器，就会出现上述错误。

一般的报错是类似下面这个样子。

```
userService in class HomeController is not valid in current context
```

那么，意味着 `HomeController` 中的 `userService` 属性未在容器中找到，你可以顺着这个线索往下排查。



## MIDWAY_10004

**问题描述**

使用的废弃的功能。

**解决方案**

不使用该功能。



## MIDWAY_10005

**问题描述**

使用的方法或者功能暂时未实现。

**解决方案**

不使用该功能。



## MIDWAY_10006

**问题描述**

未提供需要的配置项。

**解决方案**

排查配置对应的环境，是否包含该配置，如果没有，在配置文件中增加该配置即可。



## MIDWAY_10007

**问题描述**

未找到容器注入的解析类型，当前版本不会出现该错误。

**解决方案**

无。



## MIDWAY_10008

**问题描述**

检查到重复的路由。

**解决方案**

移除重复的路由部分。



## MIDWAY_10009

**问题描述**

使用了错误的方法。

**解决方案**

当你在同步的 get 方法中包含了一个异步调用，则会提示使用 `getAsync` 方法，修改即可。



## MIDWAY_10010

**问题描述**

当在单例中注入了一个未显式声明的请求作用域实例则会出现此错误，错误原因为 [作用域降级](./container#作用域降级)。

比如下面的代码，就会抛出此错误：

```typescript
// ...
@Provide()
export class UserService {}

// ...
@Provide()
@Scope(ScopeEnum.Singleton)
export class LoginService {
  @Inject()
  userService: UserService;
}
```

经常在 `configuration` 或者中间件文件中出现该问题。

该错误是为了规避作用域自动降级，缓存了实例数据带来的风险。

**解决方案**

- 1、如果你是错误的在单例中注入了请求作用域实例，请修改请求作用域代码为单例
- 2、如果你希望在单例中注入请求作用域来使用，并且能够清楚的知道作用域降级带来的后果（被缓存），请显式在类上声明作用域选项（表示允许降级）。

```typescript
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class UserService {}
```



## MIDWAY_10011

**问题描述**

当组件未在 `configuration` 文件中 `imports`，就使用了组件中的类，就会出现此错误。

**解决方案**

显式在 `src/configuration` 中的 `imports` 部分中显式引入组件。



## MIDWAY_10012

**问题描述**

内置的 Http Client 超时会抛出此错误。

**解决方案**

正常的超时错误，检查为何超时，做好错误处理即可。



## MIDWAY_10013

**问题描述**

当安装的组件和框架版本不匹配会抛出此错误。

一般会出现在框架发布了新版本之后，当项目开启了 lock 文件，使用了老版本的框架版本，并且安装了一个新组件之后。

**解决方案**

删除 lock 文件，重新安装依赖。



## MIDWAY_10014

**问题描述**

当配置文件中存在 `export default` 和 `export const` 两种导出方式后会抛出该错误。

**解决方案**

请勿两种导出方式混用。



## MIDWAY_10015

**问题描述**

当启动开启了重复类名检查（conflictCheck），如果代码扫描时在依赖注入容器中发现相同的类名，则会抛出该错误。

```typescript
// src/configuration.ts
@Configuration({
  // ...
  conflictCheck: true,
})
export class MainConfiguration {
  // ...
}
```

**解决方案**

修改类名，或者关闭重复类名检查。



## MIDWAY_10016

**问题描述**

当添加了不同的控制器，使用了相同的 `prefix`，并且添加了不同的 `options`，比如中间件，会抛出该错误。

**解决方案**

将相同 `prefix` 的控制器代码进行合并，或者移除所有的 `options`。











