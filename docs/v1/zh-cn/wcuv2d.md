---
title: 高级装饰器 API
---

midway 内部有一套标准的装饰器管理器，用来所有装饰器对接 IoC 容器，扫描和扩展，我们称之为 `decoratorManager` 。

标准的的代码参考为  [https://github.com/midwayjs/injection/blob/master/src/base/decoratorManager.ts](https://github.com/midwayjs/injection/blob/master/src/base/decoratorManager.ts)

通过 `decoratorManager` ，我们可以自定义装饰器，并且将元数据附加其中，内部的各种装饰器都是通过该能力实现的。

`decoratorManager`   上有非常多的 get/set 方法，用于不同场景装饰器的处理，常见的有:

**装饰器**
\*\*

- `saveModule`  用于保存某个类到某个装饰器
- `listModule`  获取所有绑定到某类型装饰器的 class

**元信息 （对应 **[**reflect-metadata**](https://www.npmjs.com/package/reflect-metadata)**)**
\*\*

- `saveClassMetadata`  保存元信息到 class
- `attachClassMetadata`  附加元信息到 class
- `getClassMetadata`  从 class 获取元信息
- `savePropertyDataToClass`   保存属性的元信息到 class
- `attachPropertyDataToClass`  附加属性的元信息到 class
- `getPropertyDataFromClass`  从 class 获取属性元信息
- `listPropertyDataFromClass`  列出输出所有的元数据
- `savePropertyMetadata`  保存属性元信息到属性本身
- `attachPropertyMetadata`  附加属性元信息到属性本身
- `getPropertyMetadata`   从属性上获取保存的元信息

**快捷操作**

- `getProviderId`  获取 class 上 provide 出来的 id
- `getObjectDefinition`  获取对象定义（ObjectDefiniton)
- `getParamNames`  获取一个函数的所有参数名
- `clearAllModule`  清理装饰器对应的 class map（对应 saveModule）

## 自定义装饰器

我们举一个例子，如果我们需要定义一个类装饰器 @Model ，被修饰的 class 则表明是一个 Model class，然后进一步操作。

创建一个装饰器文件，比如 `src/decorator/model` 。

```typescript
import { scope, ScopeEnum, saveClassMetadata, saveModule } from 'midawy';

const MODEL_KEY = 'decorator:model';

export function Model(): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    saveModule(MODEL_KEY, target);
    // 保存一些元数据信息，任意你希望存的东西
    saveClassMetadata(
      MODEL_KEY,
      {
        test: 'abc',
      },
      target
    );
    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    Scope(ScopeEnum.Request)(target);
  };
}
```

上面只是定了了这个装饰器，我们还要实现相应的功能，这个功能文件必须在一开始就加载，midway2 开始有生命周期的概念，可以在生命周期中执行。midway1 可以在 `app.ts`  中执行。

```typescript
// 实现 Model 装饰器功能
import { listModule } from 'midway';

const MODEL_KEY = 'decorator:model';
// 可以获取到所有装饰了 @Model 装饰器的 class
const modules = listModule(MODEL_KEY);
for (let mod of modules) {
  // 实现自定义能力
  // 从 mod 上拿元数据，做不同的处理
  // 提前初始化等 app.applicationContext.getAsync(getProvideId(mod));
}
```

最后，我们要使用这个装饰器。

```typescript
import { Model } from '../decorator/model';

// Provide 的作用是暴露出一个 IoC id，能被 IoC 扫描到
@provide()
// Model 的作用是我们自己的逻辑能被执行（保存的元数据）
@Model()
export class UserModel {}
```

## 清理信息

由于 `decoratorManager`  全局唯一，方法都为静态方法，所以在单测或者多 IoC 容器的场景下，需要对其进行清理。

```typescript
import { clearAllModule } from 'midway';

// 执行即可
clearAllModule();
```
