# 参数校验

我们经常要在方法调用时执行一些类型检查，参数转换的操作，Midway 提供了一种简单的能力来快速检查参数的类型

本模块自 `v4.0.0` 起替换 `@midwayjs/validate` 组件。

新版本提供了更灵活的验证器扩展机制，支持多种验证器（如 Joi、Zod 等）的无缝切换，并提供了更好的类型支持和性能优化。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 背景

最常用参数校验的地方是控制器（Controller），同时你也可以在任意的 Class 中使用这个能力。

我们以控制器（Controller）中使用为例。

```typescript
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   └── user.ts
│   ├── interface.ts
│   └── service
│       └── user.ts
├── test
├── package.json
└── tsconfig.json
```

普通情况下，我们从 `body` 上拿到所有 Post 结果，并进行一些校验。

```typescript
// src/interface.ts
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

// src/controller/home.ts
import { Controller, Get, Provide } from '@midwayjs/core';

@Controller('/api/user')
export class HomeController {
  @Post('/')
  async updateUser(@Body() user: User) {
    if (!user.id || typeof user.id !== 'number') {
      throw new Error('id error');
    }

    if (user.age <= 30) {
      throw new Error('age not match');
    }
    // xxx
  }
}
```

如果每个方法都需要这么校验，会非常的繁琐。

针对这种情况，Midway 提供了 Validation 组件。配合 `@Validate` 和 `@Rule` 装饰器，用来 **快速定义校验的规则**，帮助用户 **减少这些重复的代码**。

下面的通用能力将以  [joi](https://joi.dev/api/)  来举例。



## 安装依赖

你需要安装 validation 组件以及对应验证器。

```bash
## 安装 validation 组件
$ npm i @midwayjs/validation@4 --save

## 选择一个或多个验证器
$ npm i @midwayjs/validation-joi@4 --save

## 基础库
$ npm i joi --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/validation": "^4.0.0",
    "@midwayjs/validation-joi": "^4.0.0",
    "joi": "^17.13.3",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## 开启组件

在 `configuration.ts` 中增加组件：

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validation from '@midwayjs/validation';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    validation,
    // ... 其他组件
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // ...
  }
}
```

在配置文件中设置验证器：

```typescript
// src/config/config.default.ts
import * as joi from '@midwayjs/validation-joi';

export default {
  // ...
  validation: {
    // 配置验证器
    validators: {
      joi,
    },
    // 设置默认验证器
    defaultValidator: 'joi'
  }
}
```



## 校验规则

通过 `@Rule` 装饰器，可以传递校验规则。

```typescript
import { Rule } from '@midwayjs/validation';
import * as Joi from 'joi';

export class UserDTO {
  @Rule(Joi.number().required())
  id: number;

  @Rule(Joi.string().required())
  firstName: string;

  @Rule(Joi.string().max(10))
  lastName: string;

  @Rule(Joi.number().max(60))
  age: number;
}
```



## 校验参数

定义完类型之后，就可以直接在业务代码中使用了。

```typescript
// src/controller/home.ts
import { Controller, Get, Provide, Body } from '@midwayjs/core';
import { UserDTO } from './dto/user';

@Controller('/api/user')
export class HomeController {
  @Post('/')
  async updateUser(@Body() user: UserDTO) {
    // user.id
  }
}
```

所有的校验代码都通通不见了，业务变的更纯粹了，当然，记得要把原来的 user interface 换成 Class。

一旦校验失败，浏览器或者控制台就会报出类似的错误。

```
ValidationError: "id" is required
```

同时，由于定义了 `id` 的类型，在拿到字符串的情况下，会自动将 id 变为数字。

```typescript
async updateUser(@Body() user: UserDTO ) {
  // typeof user.id === 'number'
}
```

如果需要对方法级别单独配置信息，可以使用 `@Validate` 装饰器，比如单独配置错误状态。

```typescript
// src/controller/home.ts
import { Controller, Get, Provide } from '@midwayjs/core';
import { Validate } from '@midwayjs/validation';
import { UserDTO } from './dto/user';

@Controller('/api/user')
export class HomeController {
  @Post('/')
  @Validate({
    errorStatus: 422,
  })
  async updateUser(@Body() user: UserDTO) {
    // user.id
  }
}
```

## 通用场景校验

如果参数不是 DTO，可以使用 `@Valid` 装饰器进行校验，`@Valid` 装饰器可以直接传递一个验证规则。

使用 Joi：
```typescript
import { Controller, Get, Query } from '@midwayjs/core';
import { Valid } from '@midwayjs/validation';
import * as Joi from 'joi';

@Controller('/api/user')
export class HomeController {
  @Get('/')
  async getUser(@Valid(Joi.number().required()) @Query('id') id: number) {
    // ...
  }
}
```

使用 Zod：
```typescript
import { Controller, Get, Query } from '@midwayjs/core';
import { Valid } from '@midwayjs/validation';
import { z } from 'zod';

@Controller('/api/user')
export class HomeController {
  @Get('/')
  async getUser(@Valid(z.number().min(1)) @Query('id') id: number) {
    // ...
  }
}
```

在非 Web 场景下，没有 `@Body` 等 Web 类装饰器的情况下，也可以使用 `@Valid` 装饰器来进行校验。

```typescript
import { Valid } from '@midwayjs/validation';
import { Provide } from '@midwayjs/core';
import { UserDTO } from './dto/user';

@Provide()
export class UserService {
  async updateUser(@Valid() user: UserDTO) {
    // ...
  }
}
```

## 校验管道

如果你的参数是基础类型，比如 `number`, `string`, `boolean`，则可以使用组件提供的管道进行校验。

```typescript
import { ParseIntPipe } from '@midwayjs/validation';
import { Controller, Post, Body } from '@midwayjs/core';

@Controller('/api/user')
export class HomeController {
  @Post('/update_age')
  async updateAge(@Body('age', [ParseIntPipe]) age: number) {
    // ...
  }
}
```

可以使用的内置管道有：

- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `DefaultValuePipe`

## 自定义校验管道

如果默认的管道不满足需求，可以通过继承，快速实现一个自定义校验管道。

```typescript
import { Pipe } from '@midwayjs/core';
import { ParsePipe } from '@midwayjs/validation';
import * as Joi from 'joi';  // 或者使用 zod

@Pipe()
export class ParseCustomDataPipe extends ParsePipe {
  getSchema() {
    return Joi.number().integer().required();  // 使用 Joi
    // 或者使用 Zod
    // return z.number().int();
  }
}
```



## 多语言

在 Validation 中，同时依赖了 [i18n](./i18n) 组件来实现校验消息的国际化，不同的校验器会各自包含多语言的资源。

比如 Joi 验证器默认提供了 `en_US` 和 `zh_CN` 两种校验的翻译文本，如有需要，你可以增加其他语言的资源。

```typescript
// src/config/config.default.ts

export default {
  // ...
  i18n: {
    localeTable: {
      en_US: {
        joi: require('../locales/en_US.json'),
      },
      zh_CN: {
        joi: require('../locales/zh_CN.json'),
      },
    },
  },
}
```





## 默认配置

我们可以对 validation 组件做一些配置。

| 配置项            | 类型                          | 描述                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus       | number                        | 当校验出错时，返回的 Http 状态码，在 http 场景生效，默认 422 |
| locale            | string                        | 校验出错文本的默认语言，默认为 `en_US`，会根据 i18n 组件的规则切换 |
| validators        | Record<string, Function>      | 配置要使用的验证器                                           |
| defaultValidator  | string                        | 设置默认使用的验证器                                         |



## 独立的校验服务

组件底层提供了单例的 `ValidationService` 校验服务类，如有必要，可以在中间件或者独立的服务中使用。

```typescript
import { ValidationService } from '@midwayjs/validation';

export class UserService {
  @Inject()
  validateService: ValidationService;

  async invoke() {
    // ...
    const result = this.validateService.validate(UserDTO, {
      name: 'harry',
      nickName: 'harry',
    });

    // 失败返回 result.error
    // 成功返回 result.value
  }
}
```



## 高级



### 使用 Zod 验证器

如果你选择使用 Zod 验证器，需要先安装 `zod` 和相关依赖包：

```bash
$ npm i @midwayjs/validation@4 @midwayjs/validation-zod@4 zod --save
```

在配置文件中设置验证器：

```typescript
// src/config/config.default.ts
import * as zod from '@midwayjs/validation-zod';

export default {
  // ...
  validation: {
    // 配置验证器
    validators: {
      'zod': zod,
    },
    // 设置默认验证器
    defaultValidator: 'zod'
  }
}
```

然后就可以使用 Zod 的验证规则：

```typescript
import { Rule } from '@midwayjs/validation';
import { z } from 'zod';

export class UserDTO {
  @Rule(z.number().min(1))
  id: number;

  @Rule(z.string().min(1))
  firstName: string;

  @Rule(z.string().max(10))
  lastName: string;

  @Rule(z.number().max(60))
  age: number;
}
```

Zod 验证器使用了 `zod-i18n-map` 提供的翻译，支持更多的语言，包括：

- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 英语 (en)
- 日语 (ja)
- 韩语 (ko)
- 俄语 (ru)
  等多种语言。



### 混用验证器

你可以在同一个项目中配置了多个验证器。

```typescript
// src/config/config.default.ts
import * as joi from '@midwayjs/validation-joi';
import * as zod from '@midwayjs/validation-zod';

export default {
  // ...
  validation: {
    // 配置验证器
    validators: {
      'joi': joi,
      'zod': zod,
    },
    // 设置默认验证器
    defaultValidator: 'joi'
  }
}
```

 `@Rule` 装饰器的参数可以使用不同的校验规则。

```typescript
import { Rule } from '@midwayjs/validation';
import * as Joi from 'joi';
import { z } from 'zod';

export class UserDTO {
  @Rule(Joi.number().required())
  id: number;
  
  @Rule(Joi.string().required())
  name: string;
}

export class AnotherUserDTO {
  @Rule(z.number())
  id: number;
  
  @Rule(z.string().min(1))
  name: string;
}
```

:::tip

你不能在同一个类中使用不同的验证器。

:::

可以通过 `defaultValidator` 手动选择指定哪种验证器生效。

```typescript
@Controller('/user')
export class UserController {
  @Post('/')
  @Validate({
    defaultValidator: 'zod',
  })
  async getUser(@Body() bodyData: AnotherUserDTO) {
    // ...
  }
}
```

在 `ValidationService` 中也可以使用。

```typescript
import { ValidationService } from '@midwayjs/validation';

export class UserService {
  @Inject()
  validateService: ValidationService;

  async invoke() {
    // ...
    const result = this.validateService.validate(UserDTO, {
      name: 'harry',
      nickName: 'harry',
    }, {
      defaultValidator: 'zod'
    });
  }
}
```





### 自定义验证器

除了使用内置的 Joi 和 Zod 验证器，你还可以实现自己的验证器。验证器需要实现 `IValidationService` 接口：

```typescript
import { IMidwayContainer } from '@midwayjs/core';
import { IValidationService, ValidateResult, ValidationExtendOptions } from '@midwayjs/validation';

class CustomValidator implements IValidationService<any> {
  // 初始化验证器
  async init(container: IMidwayContainer): Promise<void> {
    // 在这里进行初始化操作
  }

  // 使用 schema 进行验证
  validateWithSchema(
    schema: any,
    value: any,
    options: ValidationExtendOptions,
    validatorOptions: any
  ): ValidateResult {
    const res = {} as ValidateResult;
    try {
      // 实现你的验证逻辑
      res.status = true;
      res.value = value;  // 可以在这里对值进行转换
    } catch (error) {
      res.status = false;
      res.error = error;
      res.message = error.message;
    }
    return res;
  }

  // 获取 schema
  getSchema(ClzType: any): any {
    // 实现获取 schema 的逻辑
  }

  // 获取基础类型的 schema
  getIntSchema(): any {
    // 返回整数类型的 schema
  }

  getBoolSchema(): any {
    // 返回布尔类型的 schema
  }

  getFloatSchema(): any {
    // 返回浮点数类型的 schema
  }

  getStringSchema(): any {
    // 返回字符串类型的 schema
  }
}

// 导出验证器工厂函数
export default async (container: IMidwayContainer) => {
  return new CustomValidator();
};
```

然后在配置中使用你的自定义验证器：

```typescript
// src/config/config.default.ts
import customValidator from './custom.validator';

export default {
  validation: {
    validators: {
      custom: customValidator,  // 注册自定义验证器
    },
    defaultValidator: 'custom'  // 设置为默认验证器
  }
};
```



## 常见问题

### 1. Joi 中允许未定义的字段

对于 Joi 验证器，可以通过以下配置允许未定义的字段：

```typescript
// src/config/config.default.ts
export default {
  // ...
  joi: {
    allowUnknown: true,
  }
};
```



### 2. 处理校验错误

上面提到，Midway 会在校验失败时抛出 `MidwayValidationError` 错误，我们可以在 [异常处理器](../error_filter) 中处理。

```typescript
// src/filter/validate.filter
import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validation';
import { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    return {
      status: 422,
      message: '校验参数错误,' + err.message,
    };
  }
}
```



### 3. 多语言未生效

请使用浏览器，不要直接使用 Postman 来测试。