import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Parameter Validation

We often need to perform type checking and parameter conversion operations when calling methods. Midway provides a simple capability to quickly check parameter types.

This module replaces the `@midwayjs/validate` component starting from `v4.0.0`.

The new version provides a more flexible validator extension mechanism, supports seamless switching between multiple validators (such as Joi, Zod, etc.), and provides better type support and performance optimization.

Related information:

| Description                         |     |
| ----------------------------------- | --- |
| Can be used for standard projects   | ✅   |
| Can be used for Serverless          | ✅   |
| Can be used for integration         | ✅   |
| Contains independent main framework | ❌   |
| Contains independent logs           | ❌   |



## Background

The most commonly used place for parameter validation is the controller (Controller), and you can also use this capability in any Class.

We'll use the controller (Controller) as an example.

```text
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

In normal situations, we get all Post results from `body` and perform some validation.

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

If every method needs such validation, it would be very tedious.

For this situation, Midway provides the Validation component. Combined with `@Validate` and `@Rule` decorators, it is used to **quickly define validation rules** and help users **reduce these repetitive codes**.

The following general capabilities will be exemplified with [joi](https://joi.dev/api/).



## Install Dependencies

You need to install the validation component and corresponding validators.

```bash
## Install validation component
$ npm i @midwayjs/validation@4 --save

## Choose one or more validators
$ npm i @midwayjs/validation-joi@4 --save

## Base library
$ npm i joi --save
```

Or add the following dependencies to `package.json` and reinstall.

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

## Enable Component

Add the component in `configuration.ts`:

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validation from '@midwayjs/validation';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    validation,
    // ... other components
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

Set the validator in the configuration file:

```typescript
// src/config/config.default.ts
import joi from '@midwayjs/validation-joi';

export default {
  // ...
  validation: {
    // Configure validators
    validators: {
      joi,
    },
    // Set default validator
    defaultValidator: 'joi'
  }
}
```



## Validation Rules

Through the `@Rule` decorator, you can pass validation rules.

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



## Validate Parameters

After defining the types, you can use them directly in business code, and the framework will automatically help you validate and convert DTOs.

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

All validation code is gone, making the business more pure. Of course, remember to replace the original user interface with a Class.

Once validation fails, the browser or console will report similar errors.

```
ValidationError: "id" is required
```

At the same time, since the type of `id` is defined, when getting a string, it will automatically convert id to a number.

```typescript
async updateUser(@Body() user: UserDTO ) {
  // typeof user.id === 'number'
}
```

If you need to configure information separately at the method level, you can use the `@Validate` decorator, such as configuring error status separately.

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

The `@Validate` decorator can pass multiple configuration items, such as `errorStatus`, `locale`, etc.

:::

| Configuration Item | Type                          | Description                                                  |
| ------------------ | ----------------------------- | ------------------------------------------------------------ |
| errorStatus        | number                        | HTTP status code returned when validation fails, effective in HTTP scenarios, default 422 |
| locale             | string                        | Default language for validation error text, default is `en_US`, will switch according to i18n component rules |
| throwValidateError | boolean                       | Whether to throw validation errors, default `true`, if set to `false`, returns validation results |
| defaultValidator   | string                        | Set the default validator to use                             |



## Validation Results

The validation result is an object that contains validation status, validation errors, validation values and other information. Midway encapsulates the return values of different validators and unifies the format of return values.

The overall structure is as follows:

```typescript
interface ValidateResult {
  /**
   * Whether validation is successful
   */
  status: boolean;
  /**
   * Validation error, if there are multiple errors, returns the first error
   */
  error?: any;
  /**
   * All validation errors
   */
  errors?: any[];
  /**
   * Validation error message, if there are multiple errors, returns the message of the first error
   */
  message?: string;
  /**
   * All validation error messages
   */
  messages?: string[];
  /**
   * Additional validation information
   */
  extra?: any;
}
```

:::tip

Returns from different validators have been processed into the same structure.

:::



## General Scenario Validation

If the parameter is not a DTO, you can use the `@Valid` decorator for validation. The `@Valid` decorator can directly pass a validation rule.

Using Joi:
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

Using Zod:
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

In non-Web scenarios, where there are no Web decorators like `@Body`, you can also use the `@Valid` decorator for validation.

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

## Validation Pipes

If your parameters are basic types, such as `number`, `string`, `boolean`, you can use the pipes provided by the component for validation.

All default Web parameter decorators can pass pipes in the second parameter.

For example:

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

The `ParseIntPipe` pipe can convert string and number data to numbers, so the `age` field obtained from request parameters will be validated and converted to number format through the pipe.

Available built-in pipes include:

- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `DefaultValuePipe`

`ParseIntPipe` is used to convert parameters to integer numbers.

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

`ParseFloatPipe` is used to convert parameters to floating-point numbers.

```typescript
import { ParseFloatPipe } from '@midwayjs/validation';

// ...
async update(@Body('size', [ParseFloatPipe]) size: number) {
  return size;
}

update({ size: '12.2'} ); => 12.2
update({ size: '12'} ); => 12
```

`ParseBoolPipe` is used to convert parameters to boolean values.

```typescript
import { ParseBoolPipe } from '@midwayjs/validation';

// ...
async update(@Body('isMale', [ParseBoolPipe]) isMale: boolean) {
  return isMale;
}

update({ isMale: 'true'} ); => true
update({ isMale: '0'} ); => Error
```

`DefaultValuePipe` is used to set default values.

```typescript
import { DefaultValuePipe } from '@midwayjs/validation';

// ...
async update(@Body('nickName', [new DefaultValuePipe('anonymous')]) nickName: string) {
  return nickName;
}

update({ nickName: undefined} ); => 'anonymous'
```



## Custom Validation Pipes

If the default pipes don't meet your needs, you can quickly implement a custom validation pipe by inheritance. The component already provides a `ParsePipe` class for quick writing.

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

The `getSchema` method is used to return a validation rule.

For example, the code for `ParseIntPipe` is as follows. When the pipe is executed, it will automatically get this schema for validation and return the value after successful validation.

We still use `joi` as an example.

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

## Validation Rules

:::tip
- The use of `RuleType` has been removed in the new version, you can directly use the corresponding validator syntax.
- The `@Rule` decorator can pass rules from different types of validators.
- In the `@Rule` decorator, when using the `getSchema` method, you need to use arrow functions.

:::

### Common joi Validation Syntax

```typescript
import * as Joi from 'joi';

Joi.number().required(); // number, required
Joi.string().empty(''); // string, not required
Joi.number().max(10).min(1); // number, max and min values
Joi.number().greater(10).less(50); // number, greater than 10, less than 50

Joi.string().max(10).min(5); // string, max length 10, min length 5
Joi.string().length(20); // string, length 20
Joi.string().pattern(/^[abc]+$/); // string, match regex format

Joi.object().length(5); // object, key count equals 5

Joi.array().items(Joi.string()); // array, each element is a string
Joi.array().max(10); // array, max length 10
Joi.array().min(10); // array, min length 10
Joi.array().length(10); // array, length 10

Joi.string().allow(''); // non-required field passes empty string

export enum DeviceType {
  iOS = 'ios',
  Android = 'android',
}
Joi.string().valid(...Object.values(DeviceType)) // validate based on enum values
```

### Cascading Validation

Midway supports properties in each validation Class that are still objects.

We add a property `school` to `UserDTO` and assign it a `SchoolDTO` type.

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

  // Complex object
  // The validator is not registered when this executes, so arrow functions are needed
  @Rule(() => getSchema(SchoolDTO).required())
  school: SchoolDTO;

  // Object array
  @Rule(() => Joi.array().items(getSchema(SchoolDTO)).required())
  schoolList: SchoolDTO[];
}
```

At this time, the parameter of the `@Rule` decorator can be the type itself that needs to be validated.

### Inheritance Validation

Midway supports validation inheritance, satisfying developers' needs to extract common object properties when doing parameter validation.

For example, our `CommonUserDTO` below extracts some common properties of the interface, and then `UserDTO` serves as specific parameters needed for special interfaces.

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

The old version needed to be added to the subclass, but the new version doesn't need it anymore~

:::info
If property names are the same, the current property's rules are used for validation and won't merge with the parent class.
:::

### Multi-type Validation

Starting from v3.4.5, Midway supports validation of different types for a property.

For example, a certain type can be either a common type or a complex type.

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

We can use the `getSchema` method to get the current schema from a DTO for complex logic processing.

### Creating New DTOs from Existing DTOs

Sometimes, we want to get some properties from a DTO and turn them into a new DTO class.

Midway provides `PickDto` and `OmitDto` methods to create new DTOs based on existing DTO types.

`PickDto` is used to get some properties from existing DTOs to create new DTOs, while `OmitDto` is used to exclude certain properties, for example:

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

// Inherit a new DTO
export class SimpleUserDTO extends PickDto(UserDTO, ['firstName', 'lastName']) {}

// const simpleUser = new SimpleUserDTO();
// Only contains firstName and lastName properties
// simpleUser.firstName = xxx

export class NewUserDTO extends OmitDto(UserDTO, ['age']) {}

// const newUser = new NewUserDTO();
// newUser.age definition and property don't exist

// Usage
async login(@Body() user: NewUserDTO) {
  // ...
}

```



## Internationalization

By default, `en_US` and `zh_CN` translation texts for validation are provided, so when requests fail, the language specified by the current browser access will be returned.



### Specify Language Through Decorator

By default, it follows the `defaultLocale` of the i18n component and the browser access language to return messages. However, we can specify the current translation language in the decorator, for example:

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

### Specify Language Through Parameters

In addition to decorator specification, we can also use the standard i18n method of specifying language through parameters.

For example, Query parameters.

```
Get /user/get_user?locale=zh_CN
```

For more parameter usage, please refer to the [i18n](./i18n) component.

### Translation for Other Languages

By default, Midway provides `en_US` and `zh_CN` validation translation texts. If additional translations are needed, they can be configured in i18n.

For example:

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Add translation
    zh_TW: {
      validate: require('../../locales/zh_TW.json'),
    },
  },
};
```


## Custom Error Text

If you only want to define the error message for a certain rule in a DTO, you can simply specify it.

```typescript
export class UserDTO {
  @Rule(RuleType.number().required().error(new Error('my custom message')))
  id: number;
}
```


## 

## Default Configuration

In `src/config/config.default.ts`, we can configure the validation component.

| Configuration Item | Type                          | Description                                                  |
| ------------------ | ----------------------------- | ------------------------------------------------------------ |
| errorStatus        | number                        | HTTP status code returned when validation fails, effective in HTTP scenarios, default 422 |
| locale             | string                        | Default language for validation error text, default is `en_US`, will switch according to i18n component rules |
| validators         | Record\<string, Function>      | Configure validators to use                                  |
| defaultValidator   | string                        | Set the default validator to use, if not set, uses the first validator the user `require`d |



## Advanced



### Independent Validation Service

The component provides a singleton `ValidationService` validation service class at the bottom level. If necessary, it can be used in middleware or independent services.

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
      // Success
    } else {
      // Failure
    }
  }
}
```





### Using `zod` Validator

Midway supports both Zod v3 and Zod v4 versions, you can choose according to project requirements:

- `@midwayjs/validation-zod` - Supports Zod v3 (3.x)
- `@midwayjs/validation-zod4` - Supports Zod v4 (4.x)

<Tabs>
<TabItem value="v3" label="Zod v3" default>

If you choose to use the Zod v3 validator, you need to first install the related dependency packages:

```bash
$ npm i @midwayjs/validation@4 @midwayjs/validation-zod@4 zod@3 --save
```

Set the validator in the configuration file:

```typescript
// src/config/config.default.ts
import zod from '@midwayjs/validation-zod';

export default {
  // ...
  validation: {
    // Configure validators
    validators: {
      'zod': zod,
    },
    // Set default validator
    defaultValidator: 'zod'
  }
}
```

Then you can use Zod validation rules:

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

The Zod validator uses translations provided by `zod-i18n-map`, supporting more languages, including:

- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- English (en)
- Japanese (ja)
- Korean (ko)
- Russian (ru)

And many other languages.

If needed, you can refer to the [zod-i18n-map](https://github.com/g-plane/zod-i18n-map) documentation to add support for more languages.

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Configure validators
    localeTable: {
      zh_TW: {
        zod: require('zod-i18n-map/locales/zh-TW/zod.json'),
      },
    },
  }
}
```

</TabItem>
<TabItem value="v4" label="Zod v4">

If you choose to use the Zod v4 validator, you need to first install the related dependency packages:

```bash
$ npm i @midwayjs/validation@4 @midwayjs/validation-zod4@4 zod@4 --save
```

Set the validator in the configuration file:

```typescript
// src/config/config.default.ts
import zod from '@midwayjs/validation-zod4';

export default {
  // ...
  validation: {
    // Configure validators
    validators: {
      'zod': zod,
    },
    // Set default validator
    defaultValidator: 'zod'
  }
}
```

You can use Zod validation rules directly:

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

The Zod v4 validator uses translations provided by `@semihbou/zod-i18n-map` and supports more languages, including:

- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- English (en)
- Japanese (ja)
- Korean (ko)
- Russian (ru)

and many other languages.

If needed, you can refer to the documentation of `https://github.com/VC-Semih/zod-i18n` to add support for more languages.

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    localeTable: {
      zh_TW: {
        zod: require('@semihbou/zod-i18n-map/locales/zh-TW/zod.json'),
      },
    },
  }
}
```

</TabItem>
</Tabs>


### Using `class-validator` Validator

You need to first install `class-validator` and related dependency packages:

```bash
$ npm i @midwayjs/validation@4 @midwayjs/validation-class-validator@4 class-validator class-transformer --save
```

Set the validator in the configuration file:

```typescript
// src/config/config.default.ts
import classValidator from '@midwayjs/validation-class-validator';

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

Then you can use `class-validator` validation rules:

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

By default, for `class-validator` validation rules, Midway provides `zh_CN` and `en_US` translation texts.

If you need support for more languages, you can refer to the translation texts provided by [class-validator-multi-lang](https://github.com/EndyKaufman/class-validator-multi-lang/tree/i18n).

For example, if we want to support Russian (ru) translation, we can copy the corresponding translation file and place it in the `/locales/ru.json` file.
The configuration is as follows.

```typescript
// src/config/config.default.ts
export default {
  // ...
  i18n: {
    // Configure validators
    localeTable: {
      ru_RU: {
        classValidator: require('../../locales/ru.json'),
      },
    },
  }
}
```






### Mixed Validators

You can configure multiple validators in the same project.

```typescript
// src/config/config.default.ts
import joi from '@midwayjs/validation-joi';
import zod from '@midwayjs/validation-zod';

export default {
  // ...
  validation: {
    // Configure validators
    validators: {
      'joi': joi,
      'zod': zod,
    },
    // Set default validator
    defaultValidator: 'joi'
  }
}
```

The `@Rule` decorator parameters can use different validation rules.

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

You cannot use different validators in the same class.

:::

You can manually select which validator to use through `defaultValidator`.

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

It can also be used in `ValidationService`.

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





### Custom Validators

In addition to using the built-in Joi and Zod validators, you can also implement your own validators. Validators need to implement the `IValidationService` interface:

```typescript
import { IMidwayContainer } from '@midwayjs/core';
import { IValidationService, ValidateResult, ValidationExtendOptions } from '@midwayjs/validation';

class CustomValidator implements IValidationService<any> {
  // Initialize validator
  async init(container: IMidwayContainer): Promise<void> {
    // Perform initialization operations here
  }

  // Validate using schema
  validateWithSchema(
    schema: any,
    value: any,
    options: ValidationExtendOptions,
    validatorOptions: any
  ): ValidateResult {
    const res = {} as ValidateResult;
    try {
      // Implement your validation logic
      res.status = true;
      res.value = value;  // You can transform values here
    } catch (error) {
      res.status = false;
      res.error = error;
      res.message = error.message;
    }
    return res;
  }

  // Get schema
  getSchema(ClzType: any): any {
    // Implement logic to get schema
  }

  // Get basic type schemas
  getIntSchema(): any {
    // Return integer type schema
  }

  getBoolSchema(): any {
    // Return boolean type schema
  }

  getFloatSchema(): any {
    // Return float type schema
  }

  getStringSchema(): any {
    // Return string type schema
  }
}

// Export validator factory function
export default async (container: IMidwayContainer) => {
  return new CustomValidator();
};
```

Then use your custom validator in the configuration:

```typescript
// src/config/config.default.ts
import customValidator from './custom.validator';

export default {
  validation: {
    validators: {
      custom: customValidator,  // Register custom validator
    },
    defaultValidator: 'custom'  // Set as default validator
  }
};
```



## FAQ

### 1. Allow Undefined Fields in Joi

For the Joi validator, you can allow undefined fields through the following configuration:

```typescript
// src/config/config.default.ts
export default {
  // ...
  joi: {
    allowUnknown: true,
  }
};
```



### 2. Handle Validation Errors

As mentioned above, Midway will throw a `MidwayValidationError` when validation fails, which we can handle in [error filters](../error_filter).

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
      message: 'Validation parameter error: ' + err.message,
    };
  }
}
```



### 3. Internationalization Not Working

Please use a browser, not Postman directly for testing.
