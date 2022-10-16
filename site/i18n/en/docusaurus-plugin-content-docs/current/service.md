# Service and Injection

In business, only the code of the controller (Controller) is not enough. Generally speaking, some business logic is abstracted into a specific logical unit, which we generally call the service (Service).


![image.png](https://img.alicdn.com/imgextra/i2/O1CN01LLV2Qd20Fbu1NWXVA_!!6000000006820-2-tps-2130-344.png)


Providing this abstraction has the following benefits:

- Keep the logic in the Controller more concise.
- To maintain the independence of business logic, abstract Service can be repeatedly called by multiple Controller.
- Separating logic from presentation makes it easier to write test cases.



## Create service


In Midway, the common service is a Class. For example, we created a Controller to accept user requests before. We will add a service to process the data.


For service files, we usually store them in the `src/service` directory. Let's add a user service.

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

The content is:

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
Except for an `@Provide` decorator, the structure of the entire service is exactly the same as the ordinary Class, so that's all.


We also added a User definition before, which can also be used directly here.

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


## Use service


At Controller, we need to call this service. In traditional code writing, we need to initialize this Class(new) and then place the instance where it needs to be called. In Midway, you **don't need to do** this, you just need to write the **"dependency injection"** code we provide.


```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { UserService } from '../service/user';

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

The process of using the service is divided into several parts:


- 1. Use the `@Provide` decorator to expose your service
- 2. In the code that you call, use the `@Inject` decorator to inject your service.
- 3, call the injection service, execute the corresponding method.


Midway's core "dependency injection" container will **automatically associate** your controller (Controller) and service (Service), and all code **will be automatically initialized** during operation. you **do not need to manually initialize** these classes.


## Injection behavior description

Seeing here, you will have some doubts as to why there is an `@Provide` decorator on the service (Service), but not on the controller (Controller).

In fact, the controller (Controller) also has this decorator, but in the new version, Controller includes Provide functions. If you are not sure when you can hide it, you can write it all down.

If you don't write, the default is equivalent to the following code.

```ts
@Provide()
@Controller('/api/user')
export class APIController {
```

`@Provide` the role of decorator:


- 1. This Class, hosted by the dependent injection container, will be automatically instantiated (new)
- 2. This Class can be injected by other Class in the container.


The corresponding `@Inject` decorator is used:


- 1. In the dependency injection container, find the corresponding attribute name and assign it to the corresponding instantiated object



:::info
In the class of `@Inject`, the corresponding `@Provide` must be valid.
:::


`@Provide` and `@Inject` decorators appear in pairs, and the two are associated by the class name after the colon.
```typescript
// service
@Provide()
export class UserService {
  //...
}

// controller
@Provide() // <------ Because there are Controller that include Provide capabilities, the display here is more complete
@Controller('/api/user')
export class APIController {

  @Inject()
  userService: UserService; // <------ The type here is Class, that is, an instance of this type will be injected

  //...
}

```
This combination will be used in many places. **Please remember this usage**.


Dependency injection is more complex. For more information, see [Dependency injection](container).
