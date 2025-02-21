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

:::tip

`@Validate` 装饰器可以传递多个配置项，比如 `errorStatus`，`locale` 等。

:::

| 配置项            | 类型                          | 描述                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus       | number                        | 当校验出错时，返回的 Http 状态码，在 http 场景生效，默认 422 |
| locale            | string                        | 校验出错文本的默认语言，默认为 `en_US`，会根据 i18n 组件的规则切换 |
| throwValidateError | boolean                       | 是否抛出校验错误，默认 `true`，如果设置为 `false`，则返回校验结果 |
| defaultValidator  | string                        | 设置默认使用的验证器                                         |



## 校验结果

校验结果是一个对象，包含了校验的状态，校验的错误，校验的值等信息。Midway 对不同的验证器的返回值做了封装，统一了返回值的格式。

整体结构如下：

```typescript
interface ValidateResult {
  /**
   * 校验是否成功
   */
  status: boolean;
  /**
   * 校验错误，如果有多个错误，会返回第一个错误
   */
  error?: any;
  /**
   * 校验的所有错误
   */
  errors?: any[];
  /**
   * 校验错误信息，如果有多个错误，会返回第一个错误的信息
   */
  message?: string;
  /**
   * 校验的所有错误信息
   */
  messages?: string[];
  /**
   * 校验额外信息
   */
  extra?: any;
}
```

:::tip

不同的验证器返回都已经处理成相同的结构。

:::



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

默认的 Web 参数装饰器都可以在第二个参数传入管道。

比如：

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

`ParseIntPipe` 管道可以将字符串，数字数据转换为数字，这样从请求参数获取到的 `age` 字段则会通过管道的校验并转换为数字格式。

可以使用 的内置管道有：

- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `DefaultValuePipe`

`ParseIntPipe` 用于将参数转为整形数字。

```typescript
import { ParseIntPipe } from '@midwayjs/validation';

// ...
async update(@Body('age', [ParseIntPipe]) age: number) {
  return age;
}

update({ age: '12'} ); => 12
update({ age: '12.2'} ); => Error
update({ age: 'abc'} ); => Error
```

`ParseFloatPipe` 用于将参数转为浮点型数字数字。

```typescript
import { ParseFloatPipe } from '@midwayjs/validation';

// ...
async update(@Body('size', [ParseFloatPipe]) size: number) {
  return size;
}

update({ size: '12.2'} ); => 12.2
update({ size: '12'} ); => 12
```

`ParseBoolPipe` 用于将参数转为布尔值。

```typescript
import { ParseBoolPipe } from '@midwayjs/validation';

// ...
async update(@Body('isMale', [ParseBoolPipe]) isMale: boolean) {
  return isMale;
}

update({ isMale: 'true'} ); => true
update({ isMale: '0'} ); => Error
```

`DefaultValuePipe` 用于设定默认值。

```typescript
import { DefaultValuePipe } from '@midwayjs/validation';

// ...
async update(@Body('nickName', [new DefaultValuePipe('anonymous')]) nickName: string) {
  return nickName;
}

update({ nickName: undefined} ); => 'anonymous'
```



## 自定义校验管道

如果默认的管道不满足需求，可以通过继承，快速实现一个自定义校验管道，组件已经提供了一个 `ParsePipe` 类用于快速编写。

```typescript
import { Pipe } from '@midwayjs/core';
import { ParsePipe, RuleType } from '@midwayjs/validation';

@Pipe()
export class ParseCustomDataPipe extends ParsePipe {
  getSchema() {
    // ...
  }
}
```

`getSchema` 方法用于返回一个校验规则。

比如 `ParseIntPipe` 的代码如下，管道执行时会自动获取这个 schema 进行校验，并在校验成功后将值返回。

我们依旧拿 `joi` 来举例。

```typescript
import { Pipe } from '@midwayjs/core';
import { ParsePipe, RuleType } from '@midwayjs/validation';
import * as Joi from 'joi';

@Pipe()
export class ParseIntPipe extends ParsePipe {
  getSchema() {
    return Joi.number().integer().required();
  }
}
```

## 校验规则

:::tip
- 新版本中已经移除了 `RuleType` 的使用，可以直接使用对应的验证器写法。
- `@Rule` 装饰器可以传递不同类型的验证器的规则。
- 在 `@Rule` 装饰器中，使用 `getSchema` 方法，需要使用箭头函数。

:::

### 常见的 joi 校验写法

```typescript
import * as Joi from 'joi';

Joi.number().required(); // 数字，必填
Joi.string().empty(''); // 字符串非必填
Joi.number().max(10).min(1); // 数字，最大值和最小值
Joi.number().greater(10).less(50); // 数字，大于 10，小于 50

Joi.string().max(10).min(5); // 字符串，长度最大 10，最小 5
Joi.string().length(20); // 字符串，长度 20
Joi.string().pattern(/^[abc]+$/); // 字符串，匹配正则格式

Joi.object().length(5); // 对象，key 数量等于 5

Joi.array().items(Joi.string()); // 数组，每个元素是字符串
Joi.array().max(10); // 数组，最大长度为 10
Joi.array().min(10); // 数组，最小长度为 10
Joi.array().length(10); // 数组，长度为 10

Joi.string().allow(''); // 非必填字段传入空字符串

export enum DeviceType {
  iOS = 'ios',
  Android = 'android',
}
Joi.string().valid(...Object.values(DeviceType)) // 根据枚举值校验
```

### 级联校验

Midway 支持每个校验的 Class 中的属性依旧是一个对象。

我们给 `UserDTO` 增加一个属性 `school` ，并且赋予一个 `SchoolDTO` 类型。

```typescript
import { Rule, getSchema } from '@midwayjs/validation';
import * as Joi from 'joi';

export class SchoolDTO {
  @Rule(Joi.string().required())
  name: string;
  @Rule(Joi.string())
  address: string;
}

export class UserDTO {
  @Rule(Joi.number().required())
  id: number;

  @Rule(Joi.string().required())
  firstName: string;

  @Rule(Joi.string().max(10))
  lastName: string;

  // 复杂对象
  // 这里执行的时候 validator 还未注册，所以需要使用箭头函数
  @Rule(() => getSchema(SchoolDTO).required())
  school: SchoolDTO;

  // 对象数组
  @Rule(() => Joi.array().items(getSchema(SchoolDTO)).required())
  schoolList: SchoolDTO[];
}
```

这个时候， `@Rule` 装饰器的参数可以为需要校验的这个类型本身。

### 继承校验

Midway 支持校验继承方式，满足开发者抽离通用的对象属性的时候做参数校验。

例如我们下面 `CommonUserDTO` 抽离接口的通用的一些属性，然后 `UserDTO` 作为特殊接口需要的特定参数。

```typescript
import { Rule } from '@midwayjs/validation';

export class CommonUserDTO {
  @Rule(Joi.string().required())
  token: string;
  @Rule(Joi.string())
  workId: string;
}

export class UserDTO extends CommonUserDTO {
  @Rule(Joi.string().required())
  name: string;
}
```

老版本需要在子类上面加，新版本不需要啦～

:::info
如果属性名相同，则取当前属性的规则进行校验，不会和父类合并。
:::

### 多类型校验

从 v3.4.5 开始，Midway 支持某个属性的不同类型的校验。

例如某个类型，既可以是可以普通类型，又可以是一个复杂类型。

```typescript
import { Rule, getSchema } from '@midwayjs/validation';
import * as Joi from 'joi';

export class SchoolDTO {
  @Rule(Joi.string().required())
  name: string;
  @Rule(Joi.string())
  address: string;
}

export class UserDTO {
  @Rule(Joi.string().required())
  name: string;

  @Rule(() => Joi.alternatives([Joi.string(), getSchema(SchoolDTO)]).required())
  school: string | SchoolDTO;
}
```

我们可以使用 `getSchema` 方法，从某个 DTO 拿到当前的 schema，从而进行复杂的逻辑处理。

### 从原有 DTO 创建新 DTO

有时候，我们会希望从某个 DTO 中获取一部分属性，变成一个新的 DTO 类。

Midway 提供了 `PickDto` 和 `OmitDto` 两个方法根据现有的的 DTO 类型创建新的 DTO。

`PickDto` 用于从现有的 DTO 中获取一些属性，变成新的 DTO，而 `OmitDto` 用于将其中某些属性剔除，比如：

```typescript
// src/dto/user.ts
import { Rule, PickDto } from '@midwayjs/validation';

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

// 继承出一个新的 DTO
export class SimpleUserDTO extends PickDto(UserDTO, ['firstName', 'lastName']) {}

// const simpleUser = new SimpleUserDTO();
// 只包含了 firstName 和 lastName 属性
// simpleUser.firstName = xxx

export class NewUserDTO extends OmitDto(UserDTO, ['age']) {}

// const newUser = new NewUserDTO();
// newUser.age 定义和属性都不存在

// 使用
async login(@Body() user: NewUserDTO) {
  // ...
}

```



## 多语言

默认情况下，提供了 `en_US` 和 `zh_CN` 两种校验的翻译文本，所以在请求失败时，会返回当前浏览器访问所指定的语言。



### 通过装饰器指定语言

默认情况下，会跟着 i18n 组件的 `defaultLocale` 以及浏览器访问语言的情况来返回消息，不过，我们可以在装饰器中指定当前翻译的语言，比如：

```typescript
@Controller('/user')
export class UserController {
  @Post('/')
  @Validate({
    locale: 'en_US',
  })
  async getUser(@Body() bodyData: UserDTO) {
    // ...
  }
}
```

### 通过参数指定语言

除了装饰器指定，我们也可以使用标准的 i18n 通过参数指定语言的方式。

比如 Query 参数。

```
Get /user/get_user?locale=zh_CN
```

更多的参数用法请参考 [i18n](./i18n) 组件。

### 其他语言的翻译

默认情况下，Midway 提供了 `en_US` 和 `zh_CN` 两种校验的翻译文本，如果还需要额外的翻译，可以配置在 i18n 中。

比如：

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // 增加翻译
    zh_TW: {
      validate: require('../../locales/zh_TW.json'),
    },
  },
};
```


## 自定义错误文本

如果只想定义某个 DTO 中某个规则的错误消息，可以简单指定。

```typescript
export class UserDTO {
  @Rule(RuleType.number().required().error(new Error('my custom message')))
  id: number;
}
```


## 

## 默认配置

在 `src/config/config.default.ts` 中，我们可以对 validation 组件做一些配置。

| 配置项            | 类型                          | 描述                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus       | number                        | 当校验出错时，返回的 Http 状态码，在 http 场景生效，默认 422 |
| locale            | string                        | 校验出错文本的默认语言，默认为 `en_US`，会根据 i18n 组件的规则切换 |
| validators        | Record<string, Function>      | 配置要使用的验证器                                           |
| defaultValidator  | string                        | 设置默认使用的验证器，如果未设置，则使用用户 `require` 的第一个验证器 |



## 高级



### 独立的校验服务

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
    }, {
      throwValidateError: false,
    });

    if (result.status) {
      // 成功
    } else {
      // 失败
    }
  }
}
```





### 使用 `zod` 验证器

如果你选择使用 `zod` 验证器，需要先安装 `zod` 和相关依赖包：

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

如有需要，可以参考 [zod-i18n-map](https://github.com/g-plane/zod-i18n-map) 的文档，添加更多的语言支持。

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // 配置验证器
    localeTable: {
      zh_TW: {
        zod: require('zod-i18n-map/locales/zh-TW/zod.json'),
      },
    },
  }
}
```


### 使用 `class-validator` 验证器

你需要先安装 `class-validator` 和相关依赖包：

```bash
$ npm i @midwayjs/validation@4 @midwayjs/validation-class-validator@4 class-validator class-transformer --save
```

在配置文件中设置验证器：

```typescript
// src/config/config.default.ts
import * as classValidator from '@midwayjs/validation-class-validator';

export default {
  // ...
  validation: {
    validators: {
      'class-validator': classValidator,
    },
    defaultValidator: 'class-validator'
  }
}
```

然后就可以使用 `class-validator` 的验证规则：

```typescript
import { Rule } from '@midwayjs/validation';
import { IsString, IsNumber } from 'class-validator';

export class UserDTO {
  @Rule(IsString())
  name: string;

  @Rule(IsNumber())
  age: number;
}
```

默认针对 `class-validator` 的验证规则，Midway 提供了 `zh_CN` 和 `en_US` 两种翻译文本。

如果需要更多的语言支持，可以参考 [class-validator-multi-lang](https://github.com/EndyKaufman/class-validator-multi-lang/tree/i18n) 提供的翻译文本。

比如，我们想支持俄语 (ru) 的翻译，可以将对应的翻译文件拷贝出来放在 `/locales/ru.json` 文件中。
配置如下。

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // 配置验证器
    localeTable: {
      ru_RU: {
        classValidator: require('../../locales/ru.json'),
      },
    },
  }
}
```






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