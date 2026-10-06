---
title: 数据验证
focus: /src/dto/user.dto.ts
---

# 数据验证（Validation）

数据验证是确保应用安全和稳定的重要环节。Midway 提供了 `@midwayjs/validation` 组件，只要在 DTO 上声明规则，框架就会在进入 Controller 方法之前自动完成校验和类型转换。

## 为什么需要数据验证？

没有验证的应用会面临：

- ❌ 恶意数据注入
- ❌ 类型错误导致崩溃
- ❌ 业务逻辑错误
- ❌ 数据库约束冲突

有了验证：

- ✅ 确保数据格式正确
- ✅ 提前发现错误
- ✅ 提供清晰的错误提示
- ✅ 减少后续处理的复杂度

## 安装验证组件

`@midwayjs/validation` 本身只负责校验流程，具体的规则由验证器实现，支持 joi、zod、class-validator 等。本节使用 joi：

```bash
npm install @midwayjs/validation @midwayjs/validation-joi joi
```

`package.json`：

```json
{
  "dependencies": {
    "@midwayjs/validation": "^4.0.0",
    "@midwayjs/validation-joi": "^4.0.0",
    "joi": "^17.13.3"
  }
}
```

> 旧的 `@midwayjs/validate` 只支持 joi，已不再新增功能。新项目请使用 `@midwayjs/validation`。

右侧项目已经装好了这些依赖。

## 启用验证组件

在 `src/configuration.ts` 中导入组件：

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

然后在 `src/config/config.default.ts` 中注册验证器，并设为默认：

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

## 使用验证装饰器

### 1. 在 DTO 上声明规则

打开 `src/dto/user.dto.ts`，用 `@Rule()` 为每个字段声明规则：

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

### 2. 在 Controller 中使用

参数类型写成 DTO 类即可，不需要额外的装饰器：

```typescript
@Post('/')
async create(@Body() dto: CreateUserDTO) {
  // 走到这里时，dto 已经通过校验
  const user = await this.userService.createUser(dto.name, dto.email, dto.age);
  return {
    success: true,
    message: '用户创建成功',
    data: user,
  };
}
```

在右侧终端里试一下：

```bash
# 校验通过，字符串 "18" 会被转换成数字 18
curl -X POST localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"harry@example.com","age":"18"}'

# 邮箱格式错误，返回 422
curl -X POST localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"bad"}'
```

`@Query()` 同样生效，访问 `/api/users?page=abc` 会得到 `"page" must be a number`。

### 3. 单独配置某个方法

需要修改某个方法的校验行为时，使用 `@Validate()`，例如修改失败时的状态码（默认 422）：

```typescript
import { Validate } from '@midwayjs/validation';

@Post('/')
@Validate({ errorStatus: 400 })
async create(@Body() dto: CreateUserDTO) {
  // ...
}
```

## 常用验证规则

### 字符串验证

```typescript
export class UserDTO {
  @Rule(Joi.string().required())
  name: string;

  @Rule(Joi.string().email().required())
  email: string;

  @Rule(Joi.string().min(6).max(20).required())
  password: string;

  @Rule(Joi.string().pattern(/^1[3-9]\d{9}$/).required())
  phone: string;

  @Rule(Joi.string().valid('male', 'female').required())
  gender: string;

  @Rule(Joi.string().optional())
  bio?: string;
}
```

### 数字验证

```typescript
export class ProductDTO {
  @Rule(Joi.number().required())
  price: number;

  @Rule(Joi.number().min(0).max(100).required())
  discount: number;

  @Rule(Joi.number().integer().required())
  stock: number;

  @Rule(Joi.number().positive().required())
  quantity: number;
}
```

### 布尔值与日期

```typescript
export class EventDTO {
  @Rule(Joi.boolean().required())
  enabled: boolean;

  @Rule(Joi.date().required())
  startDate: Date;

  @Rule(Joi.date().min('now').required())
  endDate: Date;
}
```

### 数组验证

```typescript
export class BatchDTO {
  @Rule(Joi.array().items(Joi.string()).required())
  tags: string[];

  @Rule(Joi.array().items(Joi.number()).min(1).max(10).required())
  ids: number[];
}
```

### 嵌套对象验证

用 `getSchema()` 拿到另一个 DTO 的规则。注意要写成箭头函数，因为装饰器执行时验证器还没有注册：

```typescript
import { Rule, getSchema } from '@midwayjs/validation';

class AddressDTO {
  @Rule(Joi.string().required())
  city: string;

  @Rule(Joi.string().required())
  street: string;
}

export class UserProfileDTO {
  @Rule(Joi.string().required())
  name: string;

  @Rule(() => getSchema(AddressDTO).required())
  address: AddressDTO;
}
```

## 自定义错误消息

```typescript
export class RegisterDTO {
  @Rule(
    Joi.string()
      .min(2)
      .max(20)
      .required()
      .error(new Error('用户名长度必须在 2-20 个字符之间'))
  )
  username: string;

  @Rule(Joi.string().min(8).required().error(new Error('密码至少 8 个字符')))
  password: string;

  @Rule(
    Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .error(new Error('两次密码输入不一致'))
  )
  confirmPassword: string;
}
```

## 校验单个参数

路径参数等基础类型可以使用内置管道，校验并转换成数字：

```typescript
import { ParseIntPipe } from '@midwayjs/validation';

@Get('/:id')
async getOne(@Param('id', [ParseIntPipe]) id: number) {
  // id 已经是数字
}
```

## 验证错误处理

校验失败时，框架会抛出 `MidwayValidationError`，默认返回 422 状态码。可以结合上一章的异常过滤器，统一错误格式：

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

## 小结

✅ 使用 `@midwayjs/validation` + 验证器（如 `@midwayjs/validation-joi`）进行验证
✅ 使用 `@Rule()` 在 DTO 上定义规则
✅ 参数类型为 DTO 时自动校验，需要单独配置时使用 `@Validate()`
✅ 基础类型参数可以使用 `ParseIntPipe` 等内置管道
✅ 校验失败抛出 `MidwayValidationError`，可以用异常过滤器统一处理

下一节，我们将总结项目的最佳实践！
