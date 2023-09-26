# Pipeline

The pipeline is the internal mechanism of the parameter decorator, which can execute some custom code after the parameter decorator logic, and is generally used in the following scenarios:

- 1. Data verification
- 2. Conversion of parameters



## The pipeline provided by the component

`@midwayjs/validate` provides a validation pipeline by default, you only need to enable the component to use it.

For example:

```typescript
@Controller('/api/user')
export class HomeController {

   @Post('/')
   async updateUser(@Body() user: UserDTO ) {
     //...
   }
}
```

The `@Body` decorator has been automatically registered with `ValidatePipe`. If `UserDTO` is a DTO that has been decorated with the `@Rule` decorator, it will be automatically validated and converted.

If an underlying type is used, then validation and conversion can also be done through the data conversion pipeline.

For example:

```typescript
import { ParseIntPipe } from '@midwayjs/validate';

@Controller('/api/user')
export class HomeController {

   @Post('/update_age')
   async updateAge(@Body('age', [ParseIntPipe]) age: number ) {
     //...
   }
}
```

The `ParseIntPipe` pipeline can convert strings and numeric data into numbers, so that the `age` field obtained from the request parameters will pass the validation of the pipeline and be converted into a numeric format.

In addition, it also provides more data conversion pipelines such as `ParseBoolPipe`, `ParseFloatPipe`, please refer to [Validate Component](./extensions/validate) for details.



## Custom pipeline

A pipe can be a class or a method that implements the `PipeTransform` interface, and we generally put the pipe in the `src/pipe` directory.

for example:

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

`PipeTransform<T, R>` is a generic interface that every pipeline must implement. The generic `T` indicates the type of the input `value`, and `R` indicates the return type of the `transfrom()` method.

To implement `PipeTransfrom`, each pipe must declare a `transfrom()` method. This method has two parameters:

- `value`
- `options`

`value` is the currently processed parameter value, and `options` is the currently processed option, including the following attributes.

```typescript
export TransformOptions<OriginType = unknown> {
   metaType: TSDesignType<OriginType>;
   metadata: Record<string, any>;
   target: any;
   methodName: string;
}
```

| Parameters | Description                                                  |
| :--------- | ------------------------------------------------------------ |
| metaType   | A parsed object of ts metadata type, including `name`, `originDesign`, `isBaseType` three properties. |
| metadata   | Metadata object for parameter decorator                      |
| target     | the currently decorated instance itself                      |
| methodName | The method name of the current parameter decorator decorator |



## Bind the pipeline

Pipes must be attached to the parameter decorator to use.

In the options of the custom decorator, we can transparently pass the pipeline parameters to achieve the purpose of applying the pipeline.

For example, we customize a `RegValid` parameter decorator to pass in the regex and another pipeline parameter:

```typescript
import { PipeUnionTransform, createCustomParamDecorator } from '@midwayjs/core';

function RegValid(reg: RegExp, pipe: PipeUnionTransform) {
   return createCustomParamDecorator('reg-valid', {
     reg,
   }, {
     //...
     pipes: [pipe]
   });
}
```

The third parameter of `createCustomParamDecorator` supports passing in a `pipes` attribute, we need to pass the pipeline into it, so that the pipeline will be bound to the decorator and executed automatically in subsequent runs.

For details, please refer to the parameter decorator chapter in [Custom Decorator](./custom_decorator).

The `RegValid` decorator is used for regular validation, and we ignore the implementation part for now.

In addition, we define another pipeline for intercepting data.

```typescript
@Pipe()
export class CutPipe implements PipeTransform {
   transform(value: number, options: TransformOptions): string {
     return String(value).slice(5);
   }
}
```

Now we can use them.

```typescript
class UserService {
   async invoke(@RegValid(/\d{11}/, CutPipe) phoneNumber: string) {
     return phoneNumber;
   }
}

invoke(13712345678) => '345678'
```



## Default bound pipes

Suppose we want to have pipeline capabilities to an existing parameter decorator, but we don't want the decorator to have pipeline parameters.

Just like the built-in `@Query` and other decorators, there is no pipeline parameter, but it can automatically execute the pipeline logic when the validate component is enabled.

We use the reverse registration API provided by `decoratorService`, which is very useful when providing capabilities across components.

Let's take the `RegValid` written above as an example.

```typescript
@Configuration({
   //...
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

The `registerParameterPipes` method is used to implicitly register some pipes with a certain parameter decorator. In the above example, `reg-valid` is the key of a custom parameter, through which we can register with this parameter decorator.

These pipelines are executed by default before explicitly passed pipelines.

In this way, even if we don't pass pipeline parameters, the pipeline will still be executed.

```typescript
class UserService {
   async invoke(@RegValid(/\d{11}/) phoneNumber: string) {
     return phoneNumber;
   }
}

invoke(13712345678) => '345678'
```
