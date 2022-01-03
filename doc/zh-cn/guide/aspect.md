# 方法拦截器（AOP）

我们经常有全局统一处理逻辑的需求，比如统一处理错误，转换格式等等，虽然在 Web 场景有 Web 中间件来处理，但是在其他场景下，无法使用这个能力。


Midway 设计了一套通用的方法拦截器（切面），用于在不同场景中，统一编写逻辑。


拦截器和传统的 Web 中间件和装饰器都不同，是由 Midway 框架提供的能力，在执行顺序上，处于中间的位置，这个能力能对任意的 Class 方法做拦截。
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01DFfT1y1FC8xYeocrX_!!6000000000450-2-tps-823-133.png)
## 使用拦截器（切面）


拦截器一般会放在 `src/aspect` 目录。下面我们写一个对控制器（Controller）方法拦截的示例。创建一个 `src/aspect/report.ts` 文件。


```
➜  my_midway_app tree
.
├── src
│   │── aspect                 		 ## 拦截器目录
│   │   └── report.ts
│   └── controller                 ## Web Controller 目录
│       └── home.ts
├── test  
├── package.json  
└── tsconfig.json
```
```typescript
// src/controller/home.ts

import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return "Hello Midwayjs!";
  }
}
```


内容如下：
```typescript
import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { HomeController } from '../controller/home';

@Provide()
@Aspect(HomeController)
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {
    console.log('before home router run');
  }
}

```
启动项目，运行后，在控制台会输出 `before home router run` 的字样。


你会发现，我们不需要去侵入控制器的代码，既没有在业务文件中加装饰器，也没有在主流程前后可见的加代码。


拦截器（切面）的能力非常强大，也非常可怕，我们一定要小心而正确的使用。


拦截器 **固定为单例**。


:::warning
在继承的情况下，拦截器不会对父类的方法生效。
:::


## 可切面的生命周期


方法拦截器可以对整个方法进行拦截，拦截的方式包括几个方面。
```typescript
export interface IMethodAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}
```
| before | 方法调用前执行 |  |
| --- | --- | --- |
| around | 包裹方法的前后执行 |  |
| afterReturn | 正确返回内容时执行 |  |
| afterThrow | 抛出异常时执行 |  |
| after | 最后执行（不管正确还是错误） |  |

简单理解如下；
```javascript
try {
    // before  
    // around or invokeMethod
    // afterReturn
} catch(err){
    // afterThrow
} finally {
    // after
}
```
|  | 修改入参 | 调用原方法 | 获取返回值 | 修改返回值 | 获取错误 | 拦截并抛出错误 |
| --- | --- | --- | --- | --- | --- | --- |
| before | √ | √ |  |  |  |  |
| around | √ | √ | √ | √ | √ | √ |
| afterReturn |  |  | √ | √ |  |  |
| afterThrow |  |  |  |  | √ | √ |
| after |  |  | √ |  | √ |  |





我们常会在 `before` 的过程中修改入参、校验，以符合程序执行的逻辑，比如：
```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home(data1, data2) {
    return data1 + data2;			// 因为拦截了方法，这里的返回值是 3
  }
}

// src/aspect/
@Provide()
@Aspect(HomeController, 'home')	 // 这里只对 home 方法做拦截
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {
    console.log(point.args);     // 这里因为对 Controller 方法做切面，原本的参数为 [ctx, next]
    point.args = [1, 2];				 // 修改入参
  }
}

```
这里的 `JoinPoint` 就是可以对方法做修改的参数，定义如下。
```typescript
export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed(...args: any[]): any;
}
```
| methodName | 拦截到的方法名 |  |
| --- | --- | --- |
| target | 方法调用时的实例 |  |
| args | 原方法调用的参数 |  |
| proceed | 原方法本身 | 只会在 before 和 around 中存在 |
|  |  |  |

`around` 是比较全能的方法，它可以包裹整个方法调用流程。
```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home() {
    return 'hello';
  }
}

// src/aspect/report.ts
@Provide()
@Aspect(HomeController, 'home')	 // 这里只对 home 方法做拦截
export class ReportInfo implements IMethodAspect {
  async around(point: JoinPoint) {
    const result = await point.proceed(...point.args);	// 执行原方法
    return result + ' world';
  }
}

```
最终 Controller 会返回 `hello world` 。


`afterReturn` 方法会多一个返回结果参数，如果只需要修改返回结果，可以直接使用它，上面的 `around` 例子用 `afterReturn` 改写会更简单。
```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home() {
    return 'hello';
  }
}

// src/aspect/report.ts
@Provide()
@Aspect(HomeController, 'home')	 // 这里只对 home 方法做拦截
export class ReportInfo implements IMethodAspect {
  async afterReturn(point: JoinPoint, result) {
    return result + ' world';
  }
}

```
`afterThrow` 用于拦截错误。


```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home() {
    throw new Error('custom error');
  }
}

// src/aspect/report.ts
@Provide()
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
`afterThrow` 能拦截错误，相应的，它不能在流程中返回结果，一般用来记录错误日志。


`after` 用来做最后的处理，不管是成功或者失败，都可以用它执行一些事情，比如记录所有成功或者失败的次数。


```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home() {
    throw new Error('custom error');
  }
}

// src/aspect/report.ts
@Provide()
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


## 切面的异步问题


如果被拦截的方法是异步的，则原则上我们的 `before` 等方法应该都是异步的，反之，则都是同步的。
```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  async home() {									// 这里是异步的，则下面的 before 是异步的
    
  }
}

// src/aspect/report.ts
@Provide()
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  async before(point: JoinPoint) {
   
  }
}

```
```typescript
// src/controller/home.ts
export class HomeController {

  @Get('/')
  home() {									// 这里是同步的，则下面的 before 也是同步的
    
  }
}

// src/aspect/report.ts
@Provide()
@Aspect(HomeController, 'home')
export class ReportInfo implements IMethodAspect {
  before(point: JoinPoint) {
   
  }
}

```
## 应用到多个 Class


`@Aspect` 装饰器的参数可以是一个数组，我们可以提供多个 Class，这些 Class 的  **所有方法 **都将被拦截。比如，我们可以将上面的拦截器应用到多个 Controller，这样 **每一个 Class 的每一个方法 **都会被拦截。


```typescript
@Provide()
@Aspect([HomeController, APIController])
export class ReportInfo implements IMethodAspect {
  
  async before(point: JoinPoint) {
    
  }
}
```


## 特定方法匹配


一般情况下，我们只需要对某个 Class 特定的方法做拦截。我们提供了一些匹配方法的能力。 `@Aspect` 装饰的第二个参数则是一个通配方法的字符串。使用的规则为 [picomatch](https://github.com/micromatch/picomatch)。


假如我们的方法为：


```typescript
// src/controller/home.ts

import { Controller, Get, Provide } from "@midwayjs/decorator";

@Provide()
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
那么，我们如下配置时，只会匹配到 `hello2` 这个方法。
```typescript
@Provide()
@Aspect([HomeController], '*2')
export class ReportInfo implements IMethodAspect {

  async before(point: JoinPoint) {
    console.log('hello method with suffix 2');
  }

}

```


## 切面执行顺序


如果多个拦截器（切面）同时针对一个方法做操作，可能会出现顺序错乱的问题，如果在两个文件中，这个顺序是随机的。


`@Aspect` 的第三个参数用于指定拦截器的优先级，默认为 0，数字越大，优先级越高，即先被注册到方法上，**先注册的方法会被后调用，**即洋葱模型**。**


以下面的代码作为示例。 `MyAspect2` 的优先级高于 `MyAspect1` ，所以会优先注册。示意图如下，整个拦截流程分为两部分，先是注册，后是执行。


**注册流程**


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01d31RXA1cpHyjyPHCs_!!6000000003649-2-tps-924-497.png)


**执行流程**


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01RXmEtD26Thmkg8eX8_!!6000000007663-2-tps-769-311.png)




代码如下。
```typescript
@Provide()
@Aspect([HomeController])
export class MyAspect1 implements IMethodAspect {
  before(point: JoinPoint) {
    console.log('111');
  }
}

@Provide()
@Aspect([HomeController], '*', 1)													// 这里可以设置优先级
export class MyAspect2 implements IMethodAspect {
  before(point: JoinPoint) {
    console.log('222');
  }
}
```
执行输出为
```
111
222
```


## 一些限制


- 1、拦截器不会对父类生效
