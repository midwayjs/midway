# 参数校验

我们经常要在方法调用时执行一些类型检查，参数转换的操作，Midway 提供了一种简单的能力来快速检查参数的类型，这个能力来源于 [joi](https://joi.dev/api/) 。



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



## 定义检查规则


按照上面的逻辑，我们需要 **重新定义一个新的 Class**，因为装饰器只能装饰在实际的 Class 上，而不是 interface。


为了方便后续处理，我们将 user 放到一个 `src/dto`  目录中。


> Data Transfer Object（数据传输对象）DTO 是一组需要跨进程或网络边界传输的聚合数据的简单容器。它不应该包含业务逻辑，并将其行为限制为诸如内部一致性检查和基本验证之类的活动。

```typescript
// src/dto/user.ts
import { Rule, RuleType } from "@midwayjs/validate";

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
import { Controller, Get, Provide } from "@midwayjs/decorator";
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



## 常见的校验写法

```typescript
RuleType.number().required();								// 数字，必填
RuleType.string().empty('')                 // 字符串非必填
RuleType.number().max(10).min(1);   				// 数字，最大值和最小值
RuleType.number().greater(10).less(50);			// 数字，大于 10，小于 50

RuleType.string().max(10).min(5);						// 字符串，长度最大 10，最小 5
RuleType.string().length(20);								// 字符串，长度 20
RuleType.string().pattern(/^[abc]+$/);			// 字符串，匹配正则格式

RuleType.object().length(5);								// 对象，key 数量等于 5


RuleType.array().items(RuleType.string());	// 数组，每个元素是字符串
RuleType.array().max(10);										// 数组，最大长度为 10
RuleType.array().min(10);										// 数组，最小长度为 10
RuleType.array().length(10);								// 数组，长度为 10

RuleType.string().allow('')									// 非必填字段传入空字符串
```



## 级联校验

Midway 支持每个校验的 Class 中的属性依旧是一个对象。


我们给 `UserDTO` 增加一个属性 `school` ，并且赋予一个 `SchoolDTO` 类型。

```typescript
import { Rule, RuleType } from "@midwayjs/validate";

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



## 继承校验


Midway 支持校验继承方式，满足开发者抽离通用的对象属性的时候做参数校验。


例如我们下面  `CommonUserDTO` 抽离接口的通用的一些属性，然后 `UserDTO` 作为特殊接口需要的特定参数。

```typescript
import { Rule, RuleType } from "@midwayjs/validate";

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



## 从原有 DTO 创建新 DTO


有时候，我们会希望从某个 DTO 中获取一部分属性，变成一个新的 DTO 类。


Midway 提供了 `PickDto` 和 `OmitDto` 两个方法根据现有的的 DTO 类型创建新的 DTO。


`PickDto` 用于从现有的 DTO 中获取一些属性，变成新的 DTO，而 `OmitDto` 用于将其中某些属性剔除，比如：


```typescript
// src/dto/user.ts
import { Rule, RuleType, PickDto } from "@midwayjs/validate";

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

const SimpleUserDTO = PickDto(UserDTO, ['firstName', 'lastName']);

const simpleUser = new SimpleUserDTO();

// simpleUser.firstName = xxx


const NewUserDTO = OmitDto(UserDTO, ['age']);
const newUser = new NewUserDTO();

// newUser.age 定义和属性都不存在


```



## 复用校验规则

有人如果我很多都是字符串必填，或者类似需求，写 `RuleType.string().required()` 有点长，有点烦，那应该怎么办？


```typescript

const requiredString = RuleType.string().required(); // 自己在一个文件中定义一下你们部门的规范或常用的。

export class UserDTO{
  
  @Rule(requiredString)                 // 这样就不用写上面这么长的了
  name: string;
  
  @Rule(requiredString)									// 同上
  nickName: string;
  
  @Rule(requiredString)								  // 同上
  description: string;
}

const maxString = (length)=> RuleType.string().max(length);  // 自己在一个文件中定义一下你们部门的规范或常用的。

export class UserDTO{
  
  @Rule(requiredString)                // 同上  
  name: string;
  
  @Rule(requiredString)                // 同上
  nickName: string;
  
  @Rule(requiredString)                // 同上
  description: string;
  
  @Rule(maxString(50))								// 这样通过换个参数即可
  info: string;
  
  @Rule(maxString(50).required())     //这样也行
  info2: string;
}
```

相当于通过定义常用方法或变量。



## 默认配置

我们可以对 validate 组件做一些配置。

| 配置项            | 类型                          | 描述                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus       | number                        | 当校验出错时，返回的 Http 状态码，在 http 场景生效，默认 422 |
| locale            | string                        | 校验出错文本的默认语言，当前有 `en_US` 和 `zh_CN` 两种，默认为 `en_US`，会根据 i18n 组件的规则切换 |
| validationOptions | joi 的 ValidationOptions 选项 | 常用的有 allowUnknown 选项，如果配置，那么全局的校验都允许出现没有定义的字段 |



## 其他语言的翻译

默认情况下，Midway 提供了 `en_US` 和 `zh_CN` 两种校验的翻译文本，如果还需要额外的翻译，可以配置在 i18n 中。

比如：

```typescript
export const i18n = {
  localeTable: {
    // 增加翻译
    zh_TW: {
      validate: require('../../locales/zh_TW.json'),
    },
  },
};
```

如果可以的话，我们希望你将翻译提交给 Midway 官方，让大家都能使用。



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
    
    // 失败返回 resut.error
    // 成功返回 resut.value
  }
}
```

`validate` 方法返回的 result 包含 `error` 和 `value`  两个属性。失败会返回 `MidwayValidationError` 错误，成功会返回格式化好的 DTO 对象。



## 常见问题

### 1、允许未定义的字段

1、由于部分用户在参数校验的时候，希望允许出现没有定义的字段，可以在全局配置，以及装饰器上分别设置，前者对全局生效，后者对单个校验生效。

```typescript
// src/config/config.default 
export const validate = {
   validationOptions: {
     allowUnknown: true,		// 全局生效
   }
 };
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
