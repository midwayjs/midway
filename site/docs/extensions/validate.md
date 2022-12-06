# 参数校验

我们经常要在方法调用时执行一些类型检查，参数转换的操作，Midway 提供了一种简单的能力来快速检查参数的类型，这个能力来源于 [joi](https://joi.dev/api/) 。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 背景

最常用参数校验的地方是 控制器（Controller），同时你也可以在任意的 Class 中使用这个能力。


我们以控制器（Controller）中使用为例，还是那个 user。

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
import { Controller, Get, Provide } from '@midwayjs/decorator';

@Controller('/api/user')
export class HomeController {

  @Post('/')
  async updateUser(@Body() user: User ) {
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

针对这种情况，Midway 提供了 Validate 组件。 配合 `@Validate` 和 `@Rule` 装饰器，用来**快速定义校验的规则**，帮助用户**减少这些重复的代码**。

注意，从 v3 开始，`@Rule` 和 `@Validate` 装饰器从 `@midwayjs/validate` 中导出。



## 安装依赖

```bash
$ npm i @midwayjs/validate@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/validate": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## 开启组件

在 `configuration.ts` 中增加组件。

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import { join } from 'path';

@Configuration({
  imports: [koa, validate],
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

## 定义检查规则


按照上面的逻辑，我们需要 **重新定义一个新的 Class**，因为装饰器只能装饰在实际的 Class 上，而不是 interface。


为了方便后续处理，我们将 user 放到一个 `src/dto`  目录中。


> Data Transfer Object（数据传输对象）DTO 是一组需要跨进程或网络边界传输的聚合数据的简单容器。它不应该包含业务逻辑，并将其行为限制为诸如内部一致性检查和基本验证之类的活动。

```typescript
// src/dto/user.ts
import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  firstName: string;

  @Rule(RuleType.string().max(10))
  lastName: string;

  @Rule(RuleType.number().max(60))
  age: number;
}
```

由于这个类属于一个 `PlainObject` ，也不需要被依赖注入管理，我们不需要提供 `@Provide` 装饰器。


这个 User Class 提供了三个属性和他们对应的校验规则。


- `id` 一个必填的数字类型
- `firstName` 一个必填的字符串类型
- `lastName` 一个可选的最长为 10 的字符串类型
- `age` 一个最大不超过 60 的数字

`@Rule` 装饰器用于 **修饰需要被校验的属性**，它的参数为 `RuleType` 对象提供的校验规则的链式方法。

:::info
这里的 `RuleType` 即为 joi 对象本身。
:::


[joi](https://joi.dev/api/) 提供了非常多的校验类型，还可以对对象和数组中的字段做校验，还有例如字符串常用的 `RuleType.string().email()` ，以及 `RuleType.string().pattern(/xxxx/)`  正则校验等，具体可以查询 [joi](https://joi.dev/api/) 的 API 文档。



## 校验参数


定义完类型之后，就可以直接在业务代码中使用了，开启校验能力还需要 `@Validate` 装饰器。

```typescript
// src/controller/home.ts
import { Controller, Get, Provide } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { UserDTO } from './dto/user';

@Controller('/api/user')
export class HomeController {

  @Post('/')
  @Validate()
  async updateUser(@Body() user: UserDTO ) {
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
@Validate()
async updateUser(@Body() user: UserDTO ) {
  // typeof user.id === 'number'
}
```



## 校验规则



### 常见的校验写法

```typescript
RuleType.number().required();               // 数字，必填
RuleType.string().empty('')                 // 字符串非必填
RuleType.number().max(10).min(1);           // 数字，最大值和最小值
RuleType.number().greater(10).less(50);	    // 数字，大于 10，小于 50

RuleType.string().max(10).min(5);           // 字符串，长度最大 10，最小 5
RuleType.string().length(20);               // 字符串，长度 20
RuleType.string().pattern(/^[abc]+$/);      // 字符串，匹配正则格式

RuleType.object().length(5);                // 对象，key 数量等于 5


RuleType.array().items(RuleType.string());  // 数组，每个元素是字符串
RuleType.array().max(10);                   // 数组，最大长度为 10
RuleType.array().min(10);                   // 数组，最小长度为 10
RuleType.array().length(10);                // 数组，长度为 10

RuleType.string().allow('')	                // 非必填字段传入空字符串
```



### 级联校验

Midway 支持每个校验的 Class 中的属性依旧是一个对象。


我们给 `UserDTO` 增加一个属性 `school` ，并且赋予一个 `SchoolDTO` 类型。

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class SchoolDTO {
  @Rule(RuleType.string().required())
  name: string;
  @Rule(RuleType.string())
  address: string;
}

export class UserDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  firstName: string;

  @Rule(RuleType.string().max(10))
  lastName: string;

  // 这里传入 SchoolDTO 作为校验参数，此时会默认是required字段，
  // 如果用户不想要required，则@Rule(SchoolDTO, {required: false})
  @Rule(SchoolDTO)
  school: SchoolDTO;

  // 如果是数组，则也只要下面这样写，这边装饰器会判断类型是否是数组，只能适用这种class类型
  @Rule(SchoolDTO)
  xxxx: SchoolDTO[];
}
```

这个时候， `@Rule` 装饰器的参数可以为需要校验的这个类型本身。



### 继承校验


Midway 支持校验继承方式，满足开发者抽离通用的对象属性的时候做参数校验。


例如我们下面  `CommonUserDTO` 抽离接口的通用的一些属性，然后 `UserDTO` 作为特殊接口需要的特定参数。

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class CommonUserDTO {
  @Rule(RuleType.string().required())
  token: string;
  @Rule(RuleType.string())
  workId: string;
}

export class UserDTO extends CommonUserDTO {

  @Rule(RuleType.string().required())
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
import { Rule, RuleType, getSchema } from '@midwayjs/validate';

export class SchoolDTO {
  @Rule(RuleType.string().required())
  name: string;
  @Rule(RuleType.string())
  address: string;
}

export class UserDTO {

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.alternatives([RuleType.string(), getSchema(SchoolDTO)]).required())
  school: string | SchoolDTO;
}
```

我们可以使用 `getSchema` 方法，从某个 DTO 拿到当前的 joi schema，从而进行复杂的逻辑处理。



### 从原有 DTO 创建新 DTO


有时候，我们会希望从某个 DTO 中获取一部分属性，变成一个新的 DTO 类。


Midway 提供了 `PickDto` 和 `OmitDto` 两个方法根据现有的的 DTO 类型创建新的 DTO。


`PickDto` 用于从现有的 DTO 中获取一些属性，变成新的 DTO，而 `OmitDto` 用于将其中某些属性剔除，比如：


```typescript
// src/dto/user.ts
import { Rule, RuleType, PickDto } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  firstName: string;

  @Rule(RuleType.string().max(10))
  lastName: string;

  @Rule(RuleType.number().max(60))
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



### 复用校验规则

如果很多字段都是字符串必填，或者类似需求，写 `RuleType.string().required()` 有点长，可以将重复的部分赋值为新的规则对象，进行复用。


```typescript

// 自己在一个文件中定义一下你们部门的规范或常用的
const requiredString = RuleType.string().required();

export class UserDTO {

  @Rule(requiredString)                 // 这样就不用写上面这么长的了
  name: string;

  @Rule(requiredString)                 // 同上
  nickName: string;

  @Rule(requiredString)                 // 同上
  description: string;
}

// 自己在一个文件中定义一下你们部门的规范或常用的
const maxString = (length)=> RuleType.string().max(length);

export class UserDTO {

  @Rule(requiredString)                // 同上
  name: string;

  @Rule(requiredString)                // 同上
  nickName: string;

  @Rule(requiredString)                // 同上
  description: string;

  @Rule(maxString(50))                 // 这样通过换个参数即可
  info: string;

  @Rule(maxString(50).required())      // 这样也行
  info2: string;
}
```



## 多语言

在 Validate 中，同时依赖了 [i18n](./i18n) 组件来实现校验消息的国际化。

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

更多的参数用法请参考  [i18n](./i18n) 组件。



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
  }
}
```

如果可以的话，我们希望你将翻译提交给 Midway 官方，让大家都能使用。



## 自定义错误文本



### 指定单个规则的文本

如果只想定义某个 DTO 中某个规则的错误消息，可以简单指定。

```typescript
export class UserDTO {
  @Rule(RuleType.number().required().error(new Error('my custom message')))
  id: number;
}
```

这个 `id` 属性上的所有规则，只要有验证失败的，都会返回你的自定义消息。



### 全局指定部分文本

通过配置 i18n 组件的 `validate` 多语言文本表，你可以选择性的替换大部分的校验文本，所有的规则都会应用该文本。

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // 把你的翻译文本放到这里
    localeTable: {
      zh_CN: {
        validate: {
          'string.max': 'hello world',
        },
      },
    },
  }
}
```

这里的 `validate` 是 `@midwayjs/validate` 组件在 i18n 组件中配置的语言表关键字。

由于 [默认的语言表](https://github.com/midwayjs/midway/tree/main/packages/validate/locales) 也是对象形式，我们可以很方便的找到其中的字段，进行替换。

由于这些文本区分语言，所以需要谨慎处理，比如，替换不同的语言。

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // 把你的翻译文本放到这里
    localeTable: {
      zh_CN: {
        validate: {
          'string.max': '字符超长',
        },
      },
      en_US: {
        validate: {
          'string.max': 'string is too long',
        },
      },
    },
  }
}
```



### 完全自定义错误文本

如果希望完全自定义错误文本，可以通过替换内置的语言翻译文本来解决。

比如：

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    localeTable: {
      // 替换中文翻译
      zh_CN: {
        validate: require('../../locales/custom.json'),
      },
    },
  }
}
```





## 默认配置

我们可以对 validate 组件做一些配置。

| 配置项            | 类型                          | 描述                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus       | number                        | 当校验出错时，返回的 Http 状态码，在 http 场景生效，默认 422 |
| locale            | string                        | 校验出错文本的默认语言，当前有 `en_US` 和 `zh_CN` 两种，默认为 `en_US`，会根据 i18n 组件的规则切换 |
| validationOptions | joi 的 ValidationOptions 选项 | 常用的有 allowUnknown，stripUnknown 等选项，如果配置，那么全局的校验都允许出现没有定义的字段，更多的请查看 joi 的 [ValidationOptions 选项](https://joi.dev/api/?v=17.6.0#anyvalidatevalue-options)。 |





## 独立的校验服务

组件底层提供了单例的 `ValidateService` 校验服务类，如有必要，可以在中间件或者独立的服务中使用。事实上，所有的校验装饰器，最终都会走到这个方法。

`ValidateService` 提供了一个 `validate` 方法，用于校验 DTO。

我们以上面定义的 `UserDTO` 为例。

```typescript
import { ValidateService } from '@midwayjs/validate';

export class UserService {

  @Inject()
  validateService: ValidateService;

  async inovke() {

    // ...
    const result = this.validateService.validate(UserDTO, {
      name: 'harry',
      nickName: 'harry'
    });

    // 失败返回 result.error
    // 成功返回 result.value
  }
}
```

`validate` 方法返回的 result 包含 `error` 和 `value`  两个属性。失败会返回 `MidwayValidationError` 错误，成功会返回格式化好的 DTO 对象。



## 常见问题

### 1、允许未定义的字段

由于部分用户在参数校验的时候，希望允许出现没有定义的字段，可以在全局配置，以及装饰器上分别设置，前者对全局生效，后者对单个校验生效。

```typescript
// src/config/config.default.ts
export default {
  // ...
  validate: {
    validationOptions: {
      allowUnknown: true,		// 全局生效
  	}
  }
}
```

或者在装饰器上。

```typescript
@Controller('/api/user')
export class HomeController {

  @Post('/')
  @Validate({
    validationOptions: {
      allowUnknown: true,
    }
  })
  async updateUser(@Body() user: UserDTO ) {
    // user.id
  }
}
```



### 2、剔除参数中的未定义属性

也同样是 validationOptions 的属性，可以直接剔除传入的参数中的某些属性。

```typescript
// src/config/config.default.ts
export default {
  // ...
  validate: {
    validationOptions: {
      stripUnknown: true,		// 全局生效
  	}
  }
}
```

或者在装饰器上。

```typescript
@Controller('/api/user')
export class HomeController {

  @Post('/')
  @Validate({
    validationOptions: {
      stripUnknown: true,
    }
  })
  async updateUser(@Body() user: UserDTO ) {
  }
}
```



### 3、处理校验错误

上面提到，Midway 会在校验失败时抛出 `MidwayValidationError` 错误，我们可以在 [异常处理器](../error_filter) 中处理。

比如：

```typescript
// src/filter/validate.filter
import { Catch } from '@midwayjs/decorator';
import { MidwayValidationError } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    // ...
    return {
      status: 422,
      message: '校验参数错误,' + err.message
    }
  }
}
```

