# Framework Error Code

The following are the errors built into the framework, which will increase over time.

| Error code | Error name | Error description |
| ------------ | ------------------------------------- | ---------------------------- |
| MIDWAY_10000 | Occupying use | Unknown error |
| MIDWAY_10001 | MidwayCommonError | Unclassified errors |
| MIDWAY_10002 | MidwayParameterError | Parameter type error |
| MIDWAY_10003 | MidwayDefinitionNotFoundError | Dependency injection definition not found |
| MIDWAY_10004 | MidwayFeatureNoLongerSupportedError | Features are no longer supported |
| MIDWAY_10005 | MidwayFeatureNotImplementedError | Function not implemented |
| MIDWAY_10006 | MidwayConfigMissingError | Configuration item missing |
| MIDWAY_10007 | MidwayResolverMissingError | Dependency injection attribute resovler not found |
| MIDWAY_10008 | MidwayDuplicateRouteError | Duplicate route |
| MIDWAY_10009 | MidwayUseWrongMethodError | The wrong method was used |
| MIDWAY_10010 | MidwaySingletonInjectRequestError | Scope confusion |
| MIDWAY_10011 | MidwayMissingImportComponentError | Component not imported |
| MIDWAY_10012 | MidwayUtilHttpClientTimeoutError | http client call timed out |
| MIDWAY_10013 | MidwayInconsistentVersionError | Incorrect dependency version used |
| MIDWAY_10014 | MidwayInvalidConfigError | Invalid configuration |
| MIDWAY_10015 | MidwayDuplicateClassNameError | Duplicate class name |
| MIDWAY_10016 | MidwayDuplicateControllerOptionsError | Repeated controller parameters |



## MIDWAY_10001

**Problem Description**

The most common framework error is thrown without classification, and the details of the error are generally written into the error message.

**Solution**

The error message shall prevail.



## MIDWAY_10002

**Problem Description**

The parameter of the method is passed in error, the type may be wrong or the parameter format is wrong.

**Solution**

Reference method definitions or document incoming parameters.



## MIDWAY_10003

**Problem Description**

Generally, when a class is started or dynamically retrieved from the container, if the class is not registered in the container, an error `xxx is not valid in current context` will be reported.

**Solution**

Possible situations, such as in business code or component use:

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

The above error occurs if the `UserService` does not write the `@Provide` or implicitly contains the `@Provide` decorator.

The general error report is similar to the following.

```
userService in class HomeController is not valid in current context
```

So, it means that the `userService` property in `HomeController` is not found in the container, you can follow this clue to troubleshoot.



## MIDWAY_10004

**Problem Description**

Abandoned functions used.

**Solution**

This function is not used.



## MIDWAY_10005

**Problem Description**

The method or function used has not been implemented for the time being.

**Solution**

This function is not used.



## MIDWAY_10006

**Problem Description**

The required configuration items were not provided.

**Solution**

Check whether the environment corresponding to the configuration contains the configuration. If not, add the configuration to the configuration file.



## MIDWAY_10007

**Problem Description**

The resolution type for container injection was not found. This error does not occur in the current version.

**Solution**

None.



## MIDWAY_10008

**Problem Description**

Check for duplicate routes.

**Solution**

Remove duplicate routing parts.



## MIDWAY_10009

**Problem Description**

The wrong method was used.

**Solution**

When you include an asynchronous call in the synchronous get method, you will be prompted to use the `getAsync` method and modify it.



## MIDWAY_10010

**Problem Description**

This error occurs when an unexplicitly declared request scope instance is injected into a single instance. The reason for the error is [Scope Degradation](./container# scope downgrade).

For example, the following code will throw this error:

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

This problem often occurs in `configuration` or middleware files.

This error is to avoid the risk of automatic domain degradation and caching instance data.

**Solution**

- 1. If you injected the request scope instance into the singleton by mistake, please modify the request scope code to a singleton.
- 2. If you want to inject the request scope to use in a singleton and can clearly know the consequences of scope degradation (cached), please explicitly declare the scope option on the class (indicating that degradation is allowed).

```typescript
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class UserService {}
```



## MIDWAY_10011

**Problem Description**

This error occurs when the component is not `imports` in the `configuration` file and the class in the component is used.

**Solution**

Explicitly introduces components in `imports` parts of `src/configuration`.



## MIDWAY_10012

**Problem Description**

The built-in Http Client timeout throws this error.

**Solution**

Normal timeout error, check why timeout, do a good job of error handling.



## MIDWAY_10013

**Problem Description**

This error is thrown when the installed component and the frame version do not match.

It usually appears after the new version of the framework is released, when the project opens the lock file, uses the old version of the framework, and installs a new component.

**Solution**

Delete the lock file and reinstall the dependency.



## MIDWAY_10014

**Problem Description**

This error is thrown when the `export default` and `export const` export methods exist in the configuration file.

**Solution**

Do not mix the two export methods.



## MIDWAY_10015

**Problem Description**

When duplicate class name checking is started (conflictCheck), the error will be thrown if the same class name is found in the dependency injection container during code scanning.

```typescript
// src/configuration.ts
@Configuration({
  // ...
  conflictCheck: true
})
export class MainConfiguration {
  // ...
}
```

**Solution**

Modify the class name or turn off duplicate class name checking.



## MIDWAY_10016

**Problem Description**

When different controllers are added, the same `prefix` is used, and different `options`, such as middleware, are added, the error will be thrown.

**Solution**

Merge the controller codes of the same `prefix` or remove all `options`.











