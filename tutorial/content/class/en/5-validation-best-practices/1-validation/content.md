---
title: Data Validation
preview: /api/users
focus: /src/dto/user.dto.ts
routes:
  - /api/users
  - /api/users/1
---

# Data Validation

Validation is essential for correctness, security, and stable APIs. Midway provides the `@midwayjs/validation` component: declare rules on a DTO, and the framework validates and converts the data before your controller method runs.

## Why validate?

Without validation, you can get:

- Malicious payload injection
- Type mismatches
- Invalid business data
- Downstream persistence errors

With validation, you get predictable and safer behavior.

## Install validation component

`@midwayjs/validation` drives the validation flow, while a validator implements the rules (joi, zod, class-validator, and more). This lesson uses joi:

```bash
npm install @midwayjs/validation @midwayjs/validation-joi joi
```

`package.json`:

```json
{
  "dependencies": {
    "@midwayjs/validation": "^4.0.0",
    "@midwayjs/validation-joi": "^4.0.0",
    "joi": "^17.13.3"
  }
}
```

> The older `@midwayjs/validate` only supports joi and no longer gets new features. Use `@midwayjs/validation` for new projects.

The project on the right already has these dependencies installed.

## Enable validation component

Import the component in `src/configuration.ts`:

```typescript
import { Configuration, App, CommonJSFileDetector } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validation from '@midwayjs/validation';
import * as DefaultConfig from './config/config.default';

@Configuration({
  imports: [koa, validation],
  detector: new CommonJSFileDetector(),
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;
}
```

Then register the validator in `src/config/config.default.ts` and make it the default:

```typescript
import joi from '@midwayjs/validation-joi';

export default {
  // ...
  validation: {
    validators: {
      joi,
    },
    defaultValidator: 'joi',
  },
};
```

## DTO rules

Declare a rule for each field with `@Rule()` in `src/dto/user.dto.ts`:

```typescript
import { Rule } from '@midwayjs/validation';
import * as Joi from 'joi';

export class CreateUserDTO {
  @Rule(Joi.string().min(1).max(20).required())
  name: string;

  @Rule(Joi.string().email().required())
  email: string;

  @Rule(Joi.number().integer().min(0).max(150).optional())
  age?: number;
}
```

Use the DTO class as the parameter type. No extra decorator is needed:

```typescript
@Post('/')
async create(@Body() dto: CreateUserDTO) {
  // dto has already passed validation here
  const user = await this.userService.createUser(dto.name, dto.email, dto.age);
  return {
    success: true,
    message: 'User created successfully',
    data: user,
  };
}
```

Try it in the terminal on the right:

```bash
# Passes; the string "18" is converted to the number 18
curl -X POST localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"harry@example.com","age":"18"}'

# Invalid email, returns 422
curl -X POST localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"bad"}'
```

`@Query()` works the same way: `/api/users?page=abc` returns `"page" must be a number`.

To change validation behavior for one method, use `@Validate()`, for example to change the error status (422 by default):

```typescript
import { Validate } from '@midwayjs/validation';

@Post('/')
@Validate({ errorStatus: 400 })
async create(@Body() dto: CreateUserDTO) {
  // ...
}
```

## Single parameters and nested objects

Use built-in pipes for primitive parameters such as path params:

```typescript
import { ParseIntPipe } from '@midwayjs/validation';

@Get('/:id')
async getOne(@Param('id', [ParseIntPipe]) id: number) {
  // id is already a number
}
```

Use `getSchema()` to reuse another DTO's rules. Wrap it in an arrow function, because validators aren't registered yet when decorators run:

```typescript
import { Rule, getSchema } from '@midwayjs/validation';

export class UserProfileDTO {
  @Rule(() => getSchema(AddressDTO).required())
  address: AddressDTO;
}
```

## Handling validation errors

On failure the framework throws `MidwayValidationError` with status 422. Combine it with an error filter to unify the response format:

```typescript
import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validation';
import { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    ctx.status = 422;
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      message: err.message,
    };
  }
}
```

## Summary

- Use `@midwayjs/validation` with a validator such as `@midwayjs/validation-joi`
- Define rules in DTO classes with `@Rule()`
- DTO parameters are validated automatically; use `@Validate()` for per-method options
- Use pipes like `ParseIntPipe` for primitive parameters
- Handle `MidwayValidationError` in an error filter
