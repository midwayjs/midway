---
sidebar: auto
---

# 依赖注入手册

Midway 中使用了非常多的依赖注入的特性，通过装饰器的轻量特性，让依赖注入变的优雅，从而让开发过程变的便捷有趣。

## 背景

midway 默认使用 [injection](http://web.npm.alibaba-inc.com/package/injection) 这个包来做依赖注入，这个包也是 MidwayJs 团队根据业界已有的实现而产出的自研产品，它除了常见的依赖了注入之外，还满足了 Midway 自身的一些特殊需求。

这篇文章不仅仅是 IoC 体系的介绍，也是属于 [injection](http://web.npm.alibaba-inc.com/package/injection) 这个包的一份使用文档。

你不仅可以在 Midway 的开发过程中用到它，如果你希望，它也可以在你的模块开发中帮助到你，它可以单独使用，也可以和现有框架集成，比如 `koa`, `thinkjs` 等。

::: tip
我们在 midway 包上做了自动导出，所以 injection 包中的模块，都能从 midway 中获取到。
import {Container} from 'injection' 和 import {Container} from 'midway' 是一样的。
:::

## IoC 概览

IoC([Inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)) 控制反转，是 Java Spring 中非常重要的思想和核心，有不少人是第一次听说，也不禁会有许多疑问。

- 什么是控制反转？
- 什么是依赖注入？
- 它们之间有什么关系？

软件中的对象就像齿轮一样，协同工作，但是互相耦合，一个零件不能正常工作，整个系统就崩溃了。这是一个强耦合的系统。

现在，伴随着工业级应用的规模越来越庞大，对象之间的依赖关系也越来越复杂，经常会出现对象之间的多重依赖性关系，因此，架构师和设计师对于系统的分析和设计，将面临更大的挑战。

```ts
// 常见的依赖
import {A} from './A';
import {B} from './B';

class C {
  consturctor() {
    this.a = new A();
    this.b = new B(a);
  }
}
```

这里的 A 被 B 和 C 所依赖，而且在构造器需要进行实例化操作，这样的依赖关系在测试中会非常麻烦。这个依赖，一般被叫做 "耦合"，而耦合度过高的系统，必然会出现牵一发而动全身的情形。

为了解决对象间耦合度过高的问题，软件专家 Michael Mattson 提出了 IoC 理论，用来实现对象之间的“解耦”。

控制反转（Inversion of Control）是一种是面向对象编程中的一种设计原则，用来减低计算机代码之间的耦合度。


## 使用 injection 解耦

如果你使用了 midway，这些创建的过程将会自动完成，这里为了更好理解，我们将从头开始展示。

首先是安装依赖：

```bash
npm i injection --save
```

然后我们将上面的代码进行解耦。

```ts
// 使用 IoC
import {Container} from 'injection';
const container = new Container();
container.bind(A);
container.bind(B);

class C {
  consturctor() {
    this.a = container.get('A');
    this.b = container.get('B');
  }
}
```

这里的 `container`  就是 IoC 容器，是依赖注入这种设计模式的一种实现，使得 C 和 A, B 没有了强耦合关系，甚至，我们可以把 C 也交给 IoC 容器，所以，IoC 容器成了整个系统的关键核心。

::: tip 注意
IoC 容器就像是一个对象池，管理这每个对象实例的信息（Class Definition），所以用户无需关心什么时候创建，当用户希望拿到对象的实例 (Object Instance) 时，可以直接拿到实例，容器会 **自动将所有依赖的对象都自动实例化**。
:::

## 获取 IoC 容器

所谓的容器就是一个对象池，它会在应用初始化的时候自动处理类的依赖，并将类进行实例化。比如下面的 `UserService` 类，在经过容器初始化之后，会自动实例化，并且对 `userModel` 进行赋值，看不到实例化的过程。

```ts
class UserService {
  
  private userModel;
  
  async getUser(uid) {
    // TODO
  }
}
```

Midway 内部使用了自动扫描的机制，在应用初始化之前，会扫描所有的文件，包含装饰器的文件会 **自动绑定** 到容器。

injection 的容器有几种：

- AppliationContext 基础容器，提供了基础的增加定义和根据定义获取对象实例的能力
- Container 用的最多的容器，做了上层封装，通过 bind 函数能够方便的生成类定义，midway 从此类开始扩展
- RequestContext 用于请求链路上的容器，会自动销毁对象并依赖另一个容器创建实例。

其中 `Container` 是我们最常用的容器，下面的代码就是创建一个容器。

```ts
import {Container} from 'injection';
const container = new Container();
```

## 对象定义

一个对象的基本元信息，比如名字，是否异步，有哪些属性，依赖等等，我们把这些信息组合到一起，形成一个对象定义。

对象定义往往表现在他的基础类型上， injection 内置了名为 `ObjectDefinition` 的对象定义类，它包含一系列属性，比如：

- 有哪些属性
- 是否有依赖的对象
- 创建时是否是异步的
- 初始化方法是哪个
- 是否自动装配

以上只是列举了一小部分，通过这个定义，容器就可以将一个对象简单的创建出来。

`ObjectDefinition` 的具体属性文档，可以在 [这里看到](https://midwayjs.org/midway/api-reference/classes/objectdefinition.html)

## 绑定对象定义

我们在创建容器之后，将会往这个容器中添加一些对象定义，这样容器才能将对应对象创建出来。

```ts
class UserService {
  
  private userModel;
  
  async getUser(uid) {
    // TODO
  }
}


// 内部代码
const container = new Container();  // 创建容器
container.bind('userService', UserService); // 可以在绑定的时候传一个名字作为 key
container.bind(UserService); // 也可以直接传入 Class，自动分析对象的元信息生成对象定义
```

`bind` 方法通过传入类型，自动分析类型上面包含的元信息，具体的 API 参数可以查看[这里](https://midwayjs.org/midway/api-reference/classes/container.html#bind)。

## 普通情况下获取对象

```ts
//... 省略绑定逻辑

const userService = await container.getAsync('userService');  // 这里根据 key 获取对象
const user = await userService.getUser('123');

// 如果对象以及对象的依赖中没有异步的情况，也可以同步获取
const userService = container.get('userService'); 
const user = userService.getUser('123');
//...
```

只有绑定过的对象定义才能通过 `get` 和 `getAsync` 方法创建出来。

如果一个对象依赖了另一个对象，那么在创建的时候，依赖的对象都会被自动创建并且在容器中管理起来。

::: tip Tip
由于 Node.js 中大多对象或者依赖都需要支持异步的情况，所以一般情况下我们都使用 `getAsync` 方法。
:::


## 使用装饰器注入

如果每次代码都需要手动绑定，然后通过 `get/getAsync` 方法拿到对应的对象，那将会非常繁琐，由于 在设计之初 midway/injection 体系就基于 ts，参考了业界的 IoC 实现，完成了属于自己的依赖注入能力，主要是通过 `@provide` 和 `@inject` 两个装饰器来完成绑定定义和自动注入属性，大大简化了代码量。

::: tip
由于使用了依赖注入体系，我们希望所有的业务代码都通过 class 语法来完成
:::

```typescript
@provide()
export class UserService {
 
  @inject()
  userModel;

  async getUser(userId) {
    return await this.userModel.get(userId);
  }
}
```

我们可以看到业务代码的样子和以往有着一些不同。

* 类加了装饰器，同时直接导出，不需要关心如何实例化
* 属性加了装饰器，但是没有任何初始化以及赋值的操作即可使用

### @provide()

有了 `@provide()` 装饰器，就可以简化绑定，被 IoC 容器自动扫描，并绑定定义到容器上，对应的逻辑是 [绑定对象定义](#绑定对象定义)。

`@provide(id?)` 的参数为对象 id，可选。

:::tip 注意
@provide 装饰器是用于自动被 IoC 容器装载。
:::

### @inject()

`@inject()` 的作用是将容器中的定义实例化成一个对象，并且绑定到属性中，这样，在调用的时候就可以访问到该属性。

:::warning 注意
注入的时机为构造器（new）之后，所以在构造方法(constructor)中是无法获取注入的属性的，如果要获取注入的内容，可以使用 [构造器注入](#构造器注入)。
:::

父类的属性使用 `@inject()` 装饰器装饰，子类实例会得到装饰后的属性。

```typescript
class Parent {
  @inject()
  katana1;
}

class Child extends Parent {
  @inject()
  katana2;
}

class Grandson extends Child {
  @inject()
  katana3;
}
```

`Grandson` 的实例 `gradson` 拥有 `@inject()` 装饰器注入的
`grandson.katana3`, `grandson.katana2`, `grandson.katana1` 属性。

实现时，会查找 `Gradson` 的原型链，遍历原型链上所有用 `@inject()` 装饰的属性，运行装饰器，注入相应的属性。

查找类的原型使用 [reflect-metadata](https://github.com/rbuckton/reflect-metadata) 仓库的 [OrdinaryGetPrototypeOf](https://github.com/rbuckton/reflect-metadata/blob/c2dbe1d02ceb9987f9002eedf0cdb21d74de0019/Reflect.ts#L1553-L1583) 方法，使用 `recursiveGetPrototypeOf` 方法以数组形式返回该类的所有原型。

``` typescript
function recursiveGetPrototypeOf(target: any): any[] {
  const properties = [];
  let parent = ordinaryGetPrototypeOf(target);
  while (parent !== null) {
    properties.push(parent);
    parent = ordinaryGetPrototypeOf(parent);
  }
  return properties;
}
```

## 对象 id

在默认情况下，injection 会将类名变为 `驼峰` 形式作为对象 id，这样你可以通过容器获取实例。

```typescript
container.getAsync('userService'); // 根据字符串 id 获取实例
container.getAsync(UserService);   // 传入类名，自动根据类目获取实例
```

而默认情况下，Midway 的依赖注入使用的是 `byName` ，只要同名，就会自动进行注入。

而在某些场景下，用户希望注入不同的实例，这个时候可以对默认生成的 id 进行修改。

```typescript
@provide('uModel')
export class UserModel {
}

@provide('user')
export class UserService {
 
  @inject('uModel')
  userModel;

  async getUser(userId) {
    return await this.userModel.get(userId);
  }
}

// 使用修改之后的 id 获取对象
const userService = await container.getAsync('user');
```

同理，在使用 `@inject` 的时候也可以使用不同的 id。

## 构造器注入

除了标准的属性注入方法之外，midway 在一定程度上支持了构造器注入的方式，来让一些应用或者三方包平稳过度。

同样还是使用 `@inject` 装饰器。

```ts
@provide()
export class A {
  config = {
    c: 20
  };
}


@provide()
export class B {
  config = {
    c: 40
  };
}

@provide()
export class BaseService {

  config;
  plugin2;

  constructor(
    @inject() a,
    @config('hello') config,
    @inject() b,
    @plugin('plugin2') plugin2
  ) {
    this.config = Object.assign(config, {
      c: a.config.c + b.config.c + config.c
    });
    this.plugin2 = plugin2;
  }

} 
```

在一个类的构造器中，我们可以还可以使用其他的类似 `@config`, `@plugin`, `@logger` 等装饰器。只要是通过 IoC 管理的对象，都能够被自动依赖和注入。


## 配置作用域

在 injection 体系中，有三种作用域。

* Singleton 单例，全局唯一（进程级别）
* Request  **默认**，请求作用域，生命周期随着请求链路，在请求链路上唯一，请求结束立即销毁
* Prototype 原型作用域，每次调用都会重复创建一个新的对象

在这三种作用域中，midway 的默认作用域为 **请求作用域**，这也意味着，如果我们需要将一个对象定义为其他两种作用域，需要额外的配置。

injection 提供了 `@scope` 装饰器来定义一个类的作用域。

```typescript
@scope(ScopeEnum.Prototype)
@provide('petrol')
export class PetrolEngine implements Engine {
  capacity = 10;
}

@scope(ScopeEnum.Singleton)
@provide('diesel')
export class DieselEngine implements Engine {
  capacity = 20;
}


// in IoC Container
assert(container.getAsync('petrol') === container.getAsync('petrol'))  // false
assert(container.getAsync('diesel') === container.getAsync('diesel'))  // true
```

<p class="warning">
  插件，在 midway 中为单例，不可配置。
</p>

## 异步初始化

在某些情况下，我们需要一个实例在被其他依赖调用前需要初始化，如果这个初始化只是读取某个文件，那么可以写成同步方式，而如果这个初始化是从远端拿取数据或者连接某个服务，这个情况下，普通的同步代码就非常的难写。

midway 提供了异步初始化的能力，通过 `@init` 标签来管理初始化方法。

`@init` 方法目前只能是一个。

```typescript
@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @init()
  async init() {
    await new Promise(resolve => {
      setTimeout(() => {
        this.config.c = 10;
        resolve();
      }, 100);
    });
  }

}

```

::: warning 注意
@async 装饰器已废弃，所有的 init 方法默认都会异步，同步初始化可以直接在构造器执行，此装饰器没有意义。
:::

只要在方法上标记 `@init` 装饰器之后，这个时候会自动在实例化之后，通过异步的来调用 `@init`  标记的方法。

## 动态函数注入

在某些场景下，我们需要函数作为某个逻辑动态执行，而 IoC 中的对象属性则都是已经创建好的，无法满足动态的逻辑需求。

比如你需要一个工厂函数，根据不同的场景返回不同的实例，也可能有一个三方包，是个函数，在业务中想要直接调用，种种的场景下，你就需要直接注入一个函数，并且在函数中拿到上下文。

标准的函数注入样例。

```typescript
export function contextHandler(context) {
  return async () => {
    // const xxx = context.getAsync('xxxx');
    return true;
  };
}

providerWrapper([
  {
    id: 'contextHandler',
    provider: contextHandler,
  }
]);
```

使用端。

```typescript
@provide()
export class BaseService {

  @inject()
  contextHandler: () => boolean;

}
```

midway 通过 `providerWrapper` 函数来包裹一个函数，并且指定提供的 key，供其他 IoC 对象使用。由于函数直接传递了一个 context 对象，可以轻松的通过此对象拿到所需的其他对象，而不需要管理依赖。


函数注入大多数为了创建一个简单的工厂。

```typescript
export function adapterFactory(context: IApplicationContext) {
  return async (adapterName: string) => {
    if (adapterName === 'google') {
      return await context.getAsync('googleAdapter');
    }

    if (adapterName === 'baidu') {
      return await context.getAsync('baiduAdapter');
    }

    // return await context.getAsync(adapterName + 'Adapter');
  };
}

providerWrapper([
  {
    id: 'adapterFactory',
    provider: adapterFactory,
  }
]);
```

这样在业务中，可以直接来使用了。

```typescript

@provide()
export class BaseService {

  @config('adapterName')
  adapterName;

  @inject('adapterFactory')
  factory;

  adapter: Adapter;

  @init()
  async init() {
    this.adapter = await this.factory(this.adapterName);
  }

}

```

::: tip
这个函数可以是异步的 (async)。
:::

再举个例子，比如如果应用希望自己使用 sequelize， 而 sequelize 的创建 model 的过程是个异步操作，代码就可以这么写：

```ts
import { providerWrapper, IApplicationContext } from 'midway';
import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInstance } from 'sequelize';

// 可以直接写 async 方法
export async function factory(context: IApplicationContext) {

  const instance = await context.getAsync<SequelizeInstance>('coreDB');

  const UiKeyTraceModel = instance.define(name, {
    gmtCreate: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'gmt_create',
    },
    gmtModified: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'gmt_modified',
    }
  }, {
    timestamps: true,
    createdAt: 'gmt_create',
    updatedAt: 'gmt_modified',
    freezeTableName: true,
    tableName: 'xxxx'
  });

  return UiKeyTraceModel;
}

providerWrapper([
  {
    id: 'keyTraceModel',
    provider: factory
  }
]);
```

通过 `providerWrapper` 我们将一个原本的函数写法进行了包裹，和现有的依赖注入体系可以融合到一起，让容器能够统一管理。

## 注入已有对象

有时候，应用已经有现有的实例，而不是类，比如引入了一个第三库，这个时候如果希望对象能够被其他 IoC 容器中的实例引用，也可以通过增加对象的方式进行处理。

我们拿常见的 http 请求库 [urllib](https://www.npmjs.com/package/urllib) 来举例。

假如我们希望在不同的类中来使用，并且不通过 require 的方式，你需要在容器的入口通过 [registerobject](https://midwayjs.org/midway/api-reference/classes/container.html#registerobject) 方法添加这个对象。

在添加的时候需要给出一个 key，方便其他类中注入。

```ts
// in global file
import * as urllib from 'urllib';
container.registerobject('httpclient', urllib);
```

这个时候就可以在任意的类中通过 `@inject` 来使用了。

```ts
@provide()
export class BaseService {

  @inject()
  httpclient;

  async getUser() {
    return await this.httpclient.request('/api/getuser');
  }
} 
```

::: tip
在 midway 中可以在 src/app.ts 中进行添加。
:::


## 通过依赖图排错

在业务代码中，我们可能会碰到依赖注入不生效或者作用域配置错误的问题，这个时候由于容器管理的问题显得不透明，用户也不太清楚容器里有哪些东西，分别依赖了什么。

我们提供了一个依赖树生成的方法，目前可以通过它生成文本形式的图形。

```ts
const container = new Container();
container.bind(UserService);
container.bind(UserController);
container.bind(DbAPI);
const newTree = await container.dumpDependency();

console.log(newTree);
```

通过 `dumpDependency` 方法生成的文本，可以直接在 [viz-js](http://viz-js.com/) 渲染为图案，方便排查问题。

也可以通过安装 `graphviz` 等工具将文本树转化为图片形式。

::: tip
midway 在启动时会将依赖树生成到 /run 目录下，方便排错。
:::
