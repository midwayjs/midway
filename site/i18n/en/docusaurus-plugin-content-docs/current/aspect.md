# Interceptors(AOP)

We often have the need for global unified processing logic, such as unified processing errors, conversion formats, etc. Although Web middleware is available in Web scenarios, this capability cannot be used in other scenarios.


Midway has designed a set of general method interceptors (aspects) to write logic uniformly in different scenarios.

Interceptor is different from traditional Web middleware and decorator. It is the ability provided by Midway framework. In the execution sequence, it is in the middle position. This ability can intercept any Class method.

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01DFfT1y1FC8xYeocrX_!!6000000000450-2-tps-823-133.png)

## Using Interceptors (Aspects)


The interceptor is usually placed in the `src/aspect` directory. Let's write an example of intercepting the controller (Controller) method. Create a `src/aspect/report.ts` file.


```
➜ my_midway_app tree
.
├── src
│   │── aspect                    ## interceptor directory
│   │   └── report.ts
│   └── controller                ## Web Controller Directory
│       └── home.ts
├── test  
├── package.json  
└── tsconfig.json
```
```typescript
// src/controller/home.ts

import { Controller, Get } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return "Hello Midwayjs!";
  }
}
```


The content is as follows:
```typescript
import { Aspect, IMethodAspect, JoinPoint } from '@midwayjs/decorator';
import { HomeController } from '../controller/home';

@Aspect(HomeController)
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {
    console.log('before home router run');
  }
}

```
After the project is started, the `before home router run` is output in the console.


You will find that we don't need to hack into the controller's code, neither adding a decorator to the business file, nor adding code that is visible before and after the mainstream process.


The ability of the interceptor (section) is very powerful and terrible. We must use it carefully and correctly.


The interceptor is **fixed as a single instance**.

:::caution
In the case of inheritance, the interceptor will not take effect on the methods of the parent class.
:::


## Aspectable Lifecycle


The method interceptor can intercept the whole method, and the way of interception includes several aspects.
```typescript
export interface IMethodAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}
```

| Methods | Description |
| --- | --- |
| before | Execute before method call |
| around | Before and after the execution of the package method |
| afterReturn | Execute when content is returned correctly |
| afterThrow | Execute when an exception is thrown |
| after | Final execution (whether correct or wrong) |

A simple understanding is as follows;

```javascript
try {
    // before  
    // around or invokeMethod
    // afterReturn
} catch(err) {
    // afterThrow
} finally {
    // after
}
```
|  | Revised input parameters | Call the original method | Gets the return value | Modify return value | Get error | Intercept and throw an error |
| --- | --- | --- | --- | --- | --- | --- |
| before | √ | √ |  |  |  |  |
| around | √ | √ | √ | √ | √ | √ |
| afterReturn |  |  | √ | √ |  |  |
| afterThrow |  |  |  |  | √ | √ |
| after |  |  | √ |  | √ |  |



We often modify the input parameters and verify the parameters in the `before` process to conform to the logic of the program execution, for example:
```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home(data1, data2) {
    return data1 + data2; //Because the method is intercepted, the return value here is 3
  }
}

// src/aspect/
@Aspect(HomeController, 'home') // Only the home method is intercepted here.
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {
    console.log(point.args); // Because the Controller method is cut, the original parameter is [ctx, next]
    Point. args = [1, 2]; // Modify parameters
  }
}

```
The `JoinPoint` here is the parameter that can be modified to the method, defined as follows.
```typescript
export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed(...args: any[]): any;
}
```
| Parameters | Description |
| --- | --- |
| methodName | intercepted method name |
| target | The instance when the method is called. |
| args | The parameters of the original method call |
| proceed | The original method itself, only exists in before and around |

`around` is a versatile method that can wrap the entire method call process.
```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return 'hello';
  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home') // Only the home method is intercepted here.
export class ReportInfo implements IMethodAspect {
  async around(point: JoinPoint) {
    Const result = await point.proceed(...point.args); //Execute the original method
    return result + 'world';
  }
}

```
Finally, Controller will return to `hello world`.


`afterReturn` method will have one more return result parameter. If you only need to modify the return result, you can directly use it. The above `around` example is easier to rewrite with `afterReturn`.
```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return 'hello';
  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home') // Only the home method is intercepted here.
export class ReportInfo implements IMethodAspect {
  async afterReturn(point: JoinPoint, result) {
    return result + 'world';
  }
}

```
`afterThrow` is used to intercept errors.


```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    throw new Error('custom error');
  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  async afterThrow(point: JoinPoint, error) {
    if(/not found/.test(error.message)) {
    	throw new Error('another error');
    } else {
    	console.error('got custom error');
    }
  }
}

```
`afterThrow` can intercept errors. Accordingly, it cannot return results in the process. It is generally used to record error logs.


`after` is used to perform the final processing. You can use it to perform some tasks, such as recording the number of successes or failures.


```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    throw new Error('custom error');
  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  async after(point: JoinPoint, result, error) {
    if(error) {
    	console.error(error);
    } else {
      console.log(result);
  	}
  }
}

```


## Aspects of Asynchronous Issues


If the blocked method is asynchronous, in principle, all methods such as `before` should be asynchronous. Otherwise, all methods should be synchronous.
```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  async home() { // here is asynchronous, then the following before is asynchronous

  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {

  }
}

```
```typescript
// src/controller/home.ts
@Controller('/')
export class HomeController {

  @Get('/')
  Home () { // here is synchronized, then the following before is also synchronized

  }
}

// src/aspect/report.ts
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  before(point: JoinPoint) {

  }
}

```
## Apply to multiple classes


The parameter of the `@Aspect` decorator can be an array. We can provide multiple classes. All methods **of these classes will be blocked. For example, we can apply the above interceptor to multiple Controller, so that every method of **every Class** will be intercepted.


```typescript
@Aspect([HomeController, APIController])
export class ReportInfo implements IMethodAspect {

  async before(point: JoinPoint) {

  }
}
```


## Specific method matching


In general, we only need to intercept a certain class-specific method. We provide some capabilities for matching methods.  The second parameter decorated by `@Aspect` is a string of a wildwith method. The rule used is [picomatch](https://github.com/micromatch/picomatch).


Suppose our method is:


```typescript
// src/controller/home.ts

import { Controller, Get } from "@midwayjs/decorator";

@Controller('/')
export class HomeController {

  @Get('/1')
  async hello1() {
    return "Hello Midwayjs!";
  }
  
  @Get('/2')
  async hello2() {
    return "Hello Midwayjs, too!";
  }
}
```
Then, when you configure the following configuration, only the `hello2` method is matched.
```typescript
@Aspect([HomeController], '*2')
export class ReportInfo implements IMethodAspect {

  async before(point: JoinPoint) {
    console.log('hello method with suffix 2');
  }
}
```


## Aspect execution order


If multiple interceptors (sections) operate on one method at the same time, there may be a problem of disorder of order. If in two files, this order is random.


The third parameter of `@Aspect` is used to specify the priority of the interceptor. The default value is 0. The larger the number, the higher the priority. This means that the method is registered in the method first, and the **first registered method is called later,** that is, the onion model**.**


The following code is an example.  The priority of `MyAspect2` is higher than that of `MyAspect1`, so registration will be given priority. The schematic diagram is as follows. The whole interception process is divided into two parts, first registration and then execution.


**Registration process**


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01d31RXA1cpHyjyPHCs_!!6000000003649-2-tps-924-497.png)


**Execution process**


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01RXmEtD26Thmkg8eX8_!!6000000007663-2-tps-769-311.png)



The code is as follows.

```typescript
@Aspect([HomeController])
export class MyAspect1 implements IMethodAspect {
  before(point: JoinPoint) {
    console.log('111');
  }
}

@Aspect([HomeController], '*', 1) // Priority can be set here
export class MyAspect2 implements IMethodAspect {
  before(point: JoinPoint) {
    console.log('222');
  }
}
```

The execution output is

```
111
222
```


## Some restrictions


- 1. The interceptor will not take effect on the parent class
