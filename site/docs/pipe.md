# 管道

管道是参数装饰器的内部机制，可以在参数装饰器逻辑之后执行一些自定义代码，一般用于以下的场景：

- 1、数据的校验
- 2、参数的转换



## 组件提供的管道

`@midwayjs/validate` 默认提供了验证管道，只需要启用组件即可使用。

例如：

```typescript
@Controller('/api/user')
export class HomeController {

  @Post('/')
  async updateUser(@Body() user: UserDTO ) {
    // ...
  }
}
```

`@Body` 装饰器已经被自动注册了 `ValidatePipe` ，如果 `UserDTO` 是一个已经经过 `@Rule` 装饰器修饰的 DTO，会自动校验并转换。

如果使用了基础类型，则也可以通过数据转换管道进行校验和转换。

例如：

```typescript
import { ParseIntPipe } from '@midwayjs/validate';

@Controller('/api/user')
export class HomeController {

  @Post('/update_age')
  async updateAge(@Body('age', [ParseIntPipe]) age: number ) {
    // ...
  }
}
```

`ParseIntPipe` 管道可以将字符串，数字数据转换为数字，这样从请求参数获取到的 `age` 字段则会通过管道的校验并转换为数字格式。

除此之外，还提供了 `ParseBoolPipe` ，`ParseFloatPipe` 等更多数据转换管道，具体请查看 [Validate 组件](./extensions/validate)。



## 自定义管道

管道可以是一个实现 `PipeTransform`  接口的类或者方法，我们一般将管道放在 `src/pipe` 目录。

比如：

```typescript
// src/pipe/validate.pipe.ts
import { Pipe, PipeTransform, TransformOptions } from '@midwayjs/core';

@Pipe()
export class ValidatePipe implements PipeTransform<T, R> {
  transform(value: T, options: TransformOptions): R {
    return value;
  }
}
```

`PipeTransform<T, R>` 是每个管道必须要实现的泛型接口。泛型 `T` 表明输入的 `value` 的类型，`R` 表明 `transfrom()` 方法的返回类型。

为实现 `PipeTransfrom`，每个管道必须声明 `transfrom()` 方法。该方法有两个参数：

- `value`
- `options`

`value` 是当前处理的参数值，`options` 是当前处理的选项，包含以下属性。

```typescript
export TransformOptions<OriginType = unknown> {
  metaType: TSDesignType<OriginType>;
  metadata: Record<string, any>;
  target: any;
  methodName: string;
}
```

| 参数       | 描述                                                         |
| :--------- | :----------------------------------------------------------- |
| metaType   | 一个 ts 元数据类型的解析对象，包含 `name` 、`originDesign`、`isBaseType` 三个属性。 |
| metadata   | 参数装饰器的元数据对象                                       |
| target     | 当前装饰的实例本身                                           |
| methodName | 当前参数装饰器装饰器的方法名                                 |



## 绑定管道

管道必须依附在参数装饰器上使用。

在自定义装饰器的选项中，我们可以透传管道参数达到应用管道的目的。

例如我们自定义一个 `RegValid` 参数装饰器，用于传入正则和另一个管道参数：

```typescript
import { PipeUnionTransform, createCustomParamDecorator } from '@midwayjs/core';

function RegValid(reg: RegExp, pipe: PipeUnionTransform) {
  return createCustomParamDecorator('reg-valid', {
    reg,
  }, {
    // ...
    pipes: [pipe]
  });
}
```

`createCustomParamDecorator` 的第三个参数支持传入一个 `pipes` 属性，我们需要将管道传入其中，这样管道就会和装饰器绑定，在后续的运行中自动执行。

具体可以查询 [自定义装饰器](./custom_decorator) 中的参数装饰器章节。

`RegValid` 装饰器用于正则的校验，实现部分我们暂时忽略。

另外，我们再定义一个管道用于截取数据。

```typescript
@Pipe()
export class CutPipe implements PipeTransform {
  transform(value: number, options: TransformOptions): string {
    return String(value).slice(5);
  }
}
```

现在我们可以使用他们了。

```typescript
class UserService {
  async invoke(@RegValid(/\d{11}/, CutPipe) phoneNumber: string) {
    return phoneNumber;
  }
}

invoke(13712345678) => '345678'
```



## 默认绑定的管道

假如我们希望向一个现成的参数装饰器能拥有管道能力，但是不希望该装饰器有管道参数。

就像内置的 `@Query` 等装饰器，没有管道参数，却可以在 validate 组件启用时自动执行管道逻辑。

我们使用 `decoratorService` 提供的反向注册 API，这在跨组件提供能力时非常有用。

我们以上面编写的 `RegValid` 为例。

```typescript
@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  async onReady(container: IMidwayContainer) {
    // register default pipe
    this.decoratorService.registerParameterPipes('reg-valid', [
      CutPipe,
    ]);
  }
}
```

`registerParameterPipes` 方法用于向某一种参数装饰器隐式注册一些管道，上述实例中，`reg-valid` 是自定义参数的 key，通过 key 我们可以向这个参数装饰器注册。 

这些管道会在显式传入的管道之前被默认执行。

这样在使用时，即使我们不传递管道参数，也依旧会执行管道。

```typescript
class UserService {
  async invoke(@RegValid(/\d{11}/) phoneNumber: string) {
    return phoneNumber;
  }
}

invoke(13712345678) => '345678'
```

