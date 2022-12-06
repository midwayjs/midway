# Parameter verification

We often need to perform type checking and parameter conversion when calling a method. Midway provides a simple ability to quickly check the type of a parameter. This ability comes from [joi](https://joi.dev/api/).

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Background

The most commonly used parameter check is the controller (Controller), and you can also use this capability in any Class.


Let's take the user used in the controller (Controller) as an example.

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

Under normal circumstances, we obtain all post results from the `body` and perform some verifications.

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
    if (! user.id || typeof user.id! = = 'number') {
    	throw new Error('id error');
    }

    if (user.age <= 30) {
    	throw new Error('age not match');
    }
    // xxx
  }
}
```
If each method needs to be verified in this way, it will be very complicated.

In response to this situation, Midway provides Validate components.  `@Validate` and `@Rule` decorators are used to **quickly define verification rules** to help users **reduce these duplicate codes**.

Note that starting with v3, `@Rule` and `@Validate` decorators are exported from `@midwayjs/validate`.



## Installation dependency

```bash
$ npm i @midwayjs/validate@3 --save
```

Or reinstall the following dependencies in `package.json`.

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

## Open the component

Add components to `configuration.ts`.

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import { join } from 'path';

@Configuration({
  imports: [koa, validate]
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // ...
  }
}
```

## Define inspection rules


According to the above logic, we need to **redefine a new Class** because the decorator can only be decorated on the actual Class, not the interface.


To facilitate subsequent processing, we put the user in a `src/dto` directory.


> Data Transfer Object DTO is a simple container for a set of aggregated data that needs to be transmitted across process or network boundaries. It should not contain business logic and limit its behavior to activities such as internal consistency checking and basic verification.

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

Since this class belongs to a `PlainObject` and does not need to be managed by dependency injection, we do not need to provide a `@Provide` decorator.


This User Class provides three attributes and their corresponding verification rules.


- `id` is a required number type.
- `firstName` a required string type
- `lastName` an optional string type with a maximum length of 10
- A maximum number of `age` is not more than 60.

The `@Rule` decorator is used to **modify the attributes** that need to be verified. Its parameters are a chain method of verification rules provided by the `RuleType` object.

:::info
The `RuleType` here is the joi object itself.
:::

[joi](https://joi.dev/api/) provides a lot of verification types. You can also verify fields in objects and arrays, such as `RuleType.string().email()` commonly used for strings, and regular check for `RuleType.string().pattern(/xxxx/)`. You can query API documents of [joi](https://joi.dev/api/).



## Check parameters


After defining the type, it can be directly used in the business code, and the `@Validate` decorator is required to turn on the verification capability.

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

All the verification codes have disappeared, and the business has become purer. Of course, remember to replace the original user interface with Class.

Once the verification fails, the browser or console will report a similar error.

```
ValidationError: "id" is required
```

In addition, because the type of `id` is defined, the id is automatically changed to a number when a string is obtained.

```typescript
@Validate()
async updateUser(@Body() user: UserDTO ) {
  // typeof user.id === 'number'
}
```



## Check rule



### Common verification writing

```typescript
RuleType.number().required(); // Number, required
RuleType.string().empty('') // string is not required
RuleType.number().max(10).min(1); //Number, Maximum and Minimum
RuleType.number().greater(10).less(50); // Number, greater than 10, less than 50

RuleType.string().max(10).min(5); //String, maximum length 10, minimum 5
RuleType.string().length(20); //String, length 20
RuleType.string().pattern(/^[abc]+$/); // String, matching regular format

RuleType.object().length(5); // Object, key number equals 5


RuleType.array().items(RuleType.string()); //Array, each element is a string
RuleType.array().max(10); // Array, maximum length is 10
RuleType.array().min(10); //Array, minimum length is 10
RuleType.array().length(10); // Array, length 10

RuleType.string().allow('') // non-required fields pass in an empty string
```



### Cascade Check

Midway supports that the attribute in the Class for each check is still an object.


We add an attribute `school` to `UserDTO` and give a `SchoolDTO` type.

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

  // The SchoolDTO is passed in here as the verification parameter, and the required field is the default,
  // If the user does not want required, @Rule(SchoolDTO, {required: false})
  @Rule(SchoolDTO)
  school: SchoolDTO;

  // If it is an array, as long as it is written as follows, the decorator here will judge whether the type is an array, and only this class type can be applied.
  @Rule(SchoolDTO)
  xxxx: SchoolDTO[];
}
```

In this case, the parameter of the `@Rule` decorator can be the type that needs to be verified.



### Inheritance check


Midway supports the verification inheritance method, which allows developers to verify parameters when they extract common object attributes.


For example, we `CommonUserDTO` the following to extract some common attributes of the interface, and then `UserDTO` specific parameters required as special interfaces.

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


The old version needs to be added to the subclass, the new version does not need ~

:::info
If the attribute name is the same, the rule of the current attribute is taken for verification and will not be merged with the parent class.
:::



### Multi-type verification

Starting from v3.4.5, Midway supports different types of verification for a certain attribute.

For example, a type can be either a normal type or a complex type.

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

We can use `getSchema` methods to get the current joi schema from a DTO to perform complex logical processing.



### Create a new DTO from the original DTO


Sometimes, we want to get some attributes from a DTO and become a new DTO class.


Midway provides `PickDto` and `OmitDto` methods to create a new DTO based on the existing DTO type.


The `PickDto` is used to get some attributes from the existing DTO and become the new DTO, while the `OmitDto` is used to remove some of them, such:


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

// Inherit a new DTO
export class SimpleUserDTO extends PickDto(UserDTO, ['firstName', 'lastName']) {}

// const simpleUser = new SimpleUserDTO();
// Contains only firstName and lastName attributes
// simpleUser.firstName = xxx

export class NewUserDTO extends OmitDto(UserDTO, ['age']) {}

// const newUser = new NewUserDTO();
// newUser.age definition and attribute do not exist

// Use
async login(@Body() user: NewUserDTO) {
  // ...
}

```



### Reuse verification rules

If many fields are required for strings or similar requirements, writing the `RuleType.string().required()` is a bit long, and the duplicate part can be assigned to a new rule object for reuse.


```typescript

// Define your department's specifications or commonly used ones in a document yourself.
const requiredString = RuleType.string().required();

export class UserDTO {

  @Rule(requiredString) // So you don't have to write it so long
  name: string;

  @Rule(requiredString) // Same as above
  nickName: string;

  @Rule(requiredString) // Same as above
  description: string;
}

// Define your department's specifications or commonly used ones in a document yourself.
const maxString = (length)=> RuleType.string().max(length);

export class UserDTO {

  @Rule(requiredString) // Same as above
  name: string;

  @Rule(requiredString) // Same as above
  nickName: string;

  @Rule(requiredString) // Same as above
  description: string;

  @Rule(maxString(50)) // This way, you can change the parameter
  info: string;

  @Rule(maxString(50).required()) // This will do
  info2: string;
}
```



## Multilingual

In Validate, the [i18n](./i18n) component is also relied on to internationalize check messages.

By default, both `en_US` and `zh_CN` are available. When a request fails, the specified language is returned.



### Specify the language through the decorator

By default, messages will be returned following the `defaultLocale` of i18n components and the browser's access language. However, we can specify the currently translated language in the decorator, such:

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



### Specify language through parameters

In addition to decorator designation, we can also use the standard i18n to specify the language through parameters.

For example, Query parameters.

```
Get /user/get_user?locale=zh_CN
```

For more information, see [i18n](./i18n).



### Translation in other languages

By default, Midway provides both `en_US` and `zh_CN` translations. If additional translations are required, you can configure them in i18n.

For example:

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Add translation
    zh_TW: {
      validate: require('../../locales/zh_TW.json')
    },
  }
}
```

If possible, we hope you will submit the translation to Midway for everyone to use.



## Custom error text



### Specifies the text of a single rule

If you only want to define an error message for a rule in a DTO, you can simply specify.

```typescript
export class UserDTO {
  @Rule(RuleType.number().required().error(new Error('my custom message')))
  id: number;
}
```

All rules on this `id` attribute will return a custom message if the verification fails.



### Global Specify Partial Text

By configuring the `validate` multilingual text table of the i18n component, you can selectively replace most of the check text, and all rules will apply the text.

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Put your translated text here
    localeTable: {
      zh_CN: {
        validate: {
          'string. Max': 'Hello World',
        },
      },
    },
  }
}
```

The `validate` here is the language table keyword configured by the `@midwayjs/validate` component in the i18n component.

Because the [default language table](https://github.com/midwayjs/midway/tree/main/packages/validate/locales) is also in the form of an object, we can easily find the fields and replace them.

Since these texts distinguish languages, they need to be handled carefully, for example, replacing different languages.

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Put your translated text here
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



### Fully customize error text

If you want to completely customize the wrong text, you can solve it by replacing the built-in language translation text.

For example:

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    localeTable: {
      // Replace Chinese translation
      zh_CN: {
        validate: require('../../locales/custom.json'),
      },
    },
  }
}
```





## Default configuration

We can do some configuration for validate components.

| Configuration Item | Type | Description |
| ----------------- | ----------------------------- | ------------------------------------------------------------ |
| errorStatus | number | When the verification error occurs, the returned Http status code takes effect in the http scenario. The default 422 |
| locale | string | The default language for verifying the error text. Currently, there are two languages: `en_US` and `zh_CN`. The default language is `en_US`. |
| validationOptions | Joi's ValidationOptions options | Commonly used options are allowUnknown, stripUnknown and other options. If configured, the global validation allows undefined fields to appear. For more information, please see joi's [ValidationOptions option](https://joi.dev/api/?v= 17.6.0#anyvalidatevalue-options). |





## Independent verification service

The bottom layer of the component provides a single instance of `ValidateService` verification service class, which can be used in middleware or independent services if necessary. In fact, all the verification decorators will eventually go to this method.

`ValidateService` provides a `validate` method for verifying DTO.

Let's take the `UserDTO` defined above as an example.

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

    // Failed to return to re. Error
    // Successfully returned result.value
  }
}
```

The result returned by the `validate` method contains two attributes: `error` and `value`. Failure will return a `MidwayValidationError` error, and success will return a formatted DTO object.



## Frequently Asked Questions

### 1. Allow undefined fields

Since some users want to allow undefined fields during parameter verification, they can be set separately on the global configuration and decorator. The former takes effect on the global and the latter takes effect on a single verification.

```typescript
// src/config/config.default.ts
export default {
  // ...
  validate: {
    validationOptions: {
      allowUnknown: true, // global takes effect
  	}
  }
}
```

Or on the decorator.

```typescript
@Controller('/api/user')
export class HomeController {

  @Post('/')
  @Validate({
    validationOptions: {
      allowUnknown: true
    }
  })
  async updateUser(@Body() user: UserDTO ) {
    // user.id
  }
}
```



### 2. Remove undefined attributes from parameters

It is also a validationOptions attribute, which can directly eliminate some attributes in the passed-in parameters.

```typescript
// src/config/config.default.ts
export default {
  // ...
  validate: {
    validationOptions: {
      stripUnknown: true, // global takes effect
  	}
  }
}
```

Or on the decorator.

```typescript
@Controller('/api/user')
export class HomeController {

  @Post('/')
  @Validate({
    validationOptions: {
      stripUnknown: true
    }
  })
  async updateUser(@Body() user: UserDTO ) {
  }
}
```



### 3. Handling verification errors

As mentioned above, Midway will throw `MidwayValidationError` error when the check fails, which we can handle in the [exception handler](../error_filter).

For example:

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
      status: 422
      message: 'Check parameter error,' + err.message
    }
  }
}
```

