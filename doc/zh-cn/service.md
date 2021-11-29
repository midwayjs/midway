# 服务和注入

在业务中，只有控制器（Controller）的代码是不够的，一般来说会有一些业务逻辑被抽象到一个特定的逻辑单元中，我们一般称为服务（Service）。


![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1600604974682-f5309741-dda9-484b-bcf3-ac054f98fe78.png#height=172&id=xMfop&margin=%5Bobject%20Object%5D&name=image.png&originHeight=344&originWidth=2130&originalType=binary&ratio=1&size=46493&status=done&style=none&width=1065)


提供这个抽象有以下几个好处：

- 保持 Controller 中的逻辑更加简洁。
- 保持业务逻辑的独立性，抽象出来的 Service 可以被多个 Controller 重复调用。
- 将逻辑和展现分离，更容易编写测试用例。



## 创建服务


在 Midway 中，普通的服务就是一个 Class，比如我们之前创建了一个接受 user 请求的 Controller，这些我们来新增一个处理这些数据的服务。


对于服务的文件，我们一般会存放到 `src/service` 目录中。我们来添加一个 user 服务。
```typescript
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.ts
│   │   └── home.ts
│   ├── interface.ts
│   └── service
│       └── user.ts
├── test
├── package.json
└── tsconfig.json
```
内容为：
```typescript
// src/service/user.ts
import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserService {

  async getUser(id: number) {
    return {
      id,
      name: 'Harry',
      age: 18,
    };
  }
}
```
除了一个 `@Provide` 装饰器外，整个服务的结构和普通的 Class 一模一样，这样就行了。


之前我们还增加了一个 User 定义，这里也可以直接使用。
```typescript
import { Provide } from '@midwayjs/decorator';
import { User } from '../interface';

@Provide()
export class UserService {

  async getUser(id: number): Promise<User> {
    return {
      id,
      name: 'Harry',
      age: 18',
    };
  }
}
```


## 使用服务


在 Controller 处，我们需要来调用这个服务。传统的代码写法，我们需要初始化这个 Class（new），然后将实例放在需要调用的地方。在 Midway 中，你**不需要这么做**，只需要编写我们提供的** "依赖注入" **的代码写法。


```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@Controller('/api/user')
export class APIController {

  @Inject()
  userService: UserService;

  @Get('/')
  async getUser(@Query('id') uid) {
    const user = await this.userService.getUser(uid);
    return {success: true, message: 'OK', data: user};
  }
}

```
使用服务的过程分为几部分：


- 1、使用 `@Provide` 装饰器暴露你的服务
- 2、在调用的代码处，使用 `@Inject` 装饰器注入你的服务
- 3、调用注入服务，执行对应的方法



Midway 的核心 “依赖注入” 容器会**自动关联**你的控制器（Controller） 和服务（Service），在运行过程中**会自动初始化**所有的代码，你**无需手动初始化**这些 Class。


## 注入行为描述


看到这里，你应该明白为什么控制器（Controller) 和服务（Service）上都有一个 `@Provide` 装饰器。不仅如此，之后的大部分代码中，你都会发现这个装饰器。


`@Provide` 装饰器的作用：


- 1、这个 Class，被依赖注入容器托管，会自动被实例化（new）
- 2、这个 Class，可以被其他在容器中的 Class 注入



而对应的 `@Inject` 装饰器，作用为：


- 1、在依赖注入容器中，找到对应的属性名，并赋值为对应的实例化对象



:::info
`@Inject` 的类中，必须有 `@Provide` 才会生效。
:::


`@Provide` 和 `@Inject` 装饰器是成对出现的，两者通过冒号后的类名进行关联。
```typescript
// service
@Provide()
export class UserService {
  //...
}

// controller
@Provide()
@Controller('/api/user')
export class APIController {

  @Inject()
  userService: UserService;		// <------ 这里的类型是 Class，即会注入一个该类型的实例

  //...
}

```
这样的组合之后会用到很多地方，**请务必记住这个用法**。


依赖注入还有更为复杂的情况，可以阅读 [依赖注入](container) 参考。
