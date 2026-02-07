---
type: lesson
title: 数据验证
focus: /src/dto/user.dto.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---

# 数据验证（Validation）

数据验证是确保应用安全和稳定的重要环节。Midway 集成了强大的验证库，让数据验证变得简单。

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

Midway 使用 `@midwayjs/validate` 组件进行验证：

```bash
npm install @midwayjs/validate
```

`package.json`：

```json
{
  "dependencies": {
    "@midwayjs/validate": "^4.0.0"
  }
}
```

可选安装 Swagger 以生成 API 文档：

```bash
npm install @midwayjs/swagger
```

`package.json`：

```json
{
  "dependencies": {
    "@midwayjs/swagger": "^4.0.0"
  }
}
```

## 启用验证组件

在 `configuration.ts` 中导入：

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';

@Configuration({
  imports: [
    koa,
    validate,
  ],
  importConfigs: [
    {
      default: { /* 配置 */ },
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // 应用启动完成
  }
}
```

## 使用验证装饰器

### 1. 基础验证

创建 `src/dto/user.dto.ts`：

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class CreateUserDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().email().required())
  email: string;

  @Rule(RuleType.number().min(0).max(150).optional())
  age?: number;
}
```

### 2. 在 Controller 中使用

```typescript
import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { CreateUserDTO } from '../dto/user.dto';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/')
  @Validate()
  async create(@Body() dto: CreateUserDTO) {
    const user = await this.userService.createUser(dto.name, dto.email);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }
}
```

## 常用验证规则

### 字符串验证

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().email().required())
  email: string;

  @Rule(RuleType.string().min(6).max(20).required())
  password: string;

  @Rule(RuleType.string().pattern(/^1[3-9]\d{9}$/).required())
  phone: string;

  @Rule(RuleType.string().valid('male', 'female').required())
  gender: string;

  @Rule(RuleType.string().optional())
  bio?: string;
}
```

### 数字验证

```typescript
export class ProductDTO {
  @Rule(RuleType.number().required())
  price: number;

  @Rule(RuleType.number().min(0).max(100).required())
  discount: number;

  @Rule(RuleType.number().integer().required())
  stock: number;

  @Rule(RuleType.number().positive().required())
  quantity: number;
}
```

### 布尔值验证

```typescript
export class SettingsDTO {
  @Rule(RuleType.boolean().required())
  enabled: boolean;

  @Rule(RuleType.boolean().optional())
  newsletter?: boolean;
}
```

### 日期验证

```typescript
export class EventDTO {
  @Rule(RuleType.date().required())
  startDate: Date;

  @Rule(RuleType.date().min('now').required())
  endDate: Date;
}
```

### 数组验证

```typescript
export class BatchDTO {
  @Rule(RuleType.array().items(RuleType.string()).required())
  tags: string[];

  @Rule(RuleType.array().items(RuleType.number()).min(1).max(10).required())
  ids: number[];

  @Rule(RuleType.array().items(RuleType.object()).optional())
  items?: any[];
}
```

### 嵌套对象验证

```typescript
class AddressDTO {
  @Rule(RuleType.string().required())
  city: string;

  @Rule(RuleType.string().required())
  street: string;

  @Rule(RuleType.string().required())
  zipCode: string;
}

export class UserProfileDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.object().required())
  address: AddressDTO;
}
```

## 自定义错误消息

```typescript
export class CreateUserDTO {
  @Rule(
    RuleType.string()
      .required()
      .min(2)
      .max(20)
      .error(new Error('用户名长度必须在 2-20 个字符之间'))
  )
  name: string;

  @Rule(
    RuleType.string()
      .email()
      .required()
      .error(new Error('请输入有效的邮箱地址'))
  )
  email: string;

  @Rule(
    RuleType.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .required()
      .error(new Error('密码必须包含大小写字母和数字,至少8位'))
  )
  password: string;
}
```

## 实战示例：完整的用户注册

### 1. 创建 DTO

`src/dto/auth.dto.ts`：

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class RegisterDTO {
  @Rule(
    RuleType.string()
      .min(2)
      .max(20)
      .required()
      .error(new Error('用户名长度必须在 2-20 个字符之间'))
  )
  username: string;

  @Rule(
    RuleType.string()
      .email()
      .required()
      .error(new Error('请输入有效的邮箱地址'))
  )
  email: string;

  @Rule(
    RuleType.string()
      .min(8)
      .required()
      .error(new Error('密码至少 8 个字符'))
  )
  password: string;

  @Rule(
    RuleType.string()
      .valid(RuleType.ref('password'))
      .required()
      .error(new Error('两次密码输入不一致'))
  )
  confirmPassword: string;

  @Rule(RuleType.number().min(18).max(100).optional())
  age?: number;

  @Rule(RuleType.string().valid('male', 'female', 'other').optional())
  gender?: string;

  @Rule(RuleType.boolean().required())
  agreeTerms: boolean;
}

export class LoginDTO {
  @Rule(RuleType.string().required().error(new Error('请输入用户名或邮箱')))
  username: string;

  @Rule(RuleType.string().required().error(new Error('请输入密码')))
  password: string;
}
```

### 2. 创建 Controller

```typescript
import { Controller, Post, Body } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { RegisterDTO, LoginDTO } from '../dto/auth.dto';

@Controller('/api/auth')
export class AuthController {
  @Post('/register')
  @Validate()
  async register(@Body() dto: RegisterDTO) {
    if (!dto.agreeTerms) {
      return {
        success: false,
        message: '请同意用户协议',
      };
    }

    return {
      success: true,
      message: '注册成功',
      data: {
        username: dto.username,
        email: dto.email,
      },
    };
  }

  @Post('/login')
  @Validate()
  async login(@Body() dto: LoginDTO) {
    return {
      success: true,
      message: '登录成功',
      token: 'mock_token_here',
    };
  }
}
```

## 参数验证

除了 Body，也可以验证其他参数：

```typescript
import { Controller, Get, Query, Param } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';

export class QueryDTO {
  @Rule(RuleType.number().min(1).max(100).optional())
  page?: number;

  @Rule(RuleType.number().min(1).max(100).optional())
  pageSize?: number;

  @Rule(RuleType.string().optional())
  keyword?: string;
}

@Controller('/api/users')
export class UserController {
  @Get('/')
  @Validate()
  async list(@Query() query: QueryDTO) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    return {
      success: true,
      data: [],
      pagination: { page, pageSize },
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const userId = parseInt(id);

    if (isNaN(userId) || userId <= 0) {
      return {
        success: false,
        message: 'ID 必须是正整数',
      };
    }

    return { success: true };
  }
}
```

## 验证错误处理

当验证失败时，会自动返回错误信息：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation Failed",
  "errors": [
    {
      "field": "email",
      "message": "请输入有效的邮箱地址"
    },
    {
      "field": "password",
      "message": "密码至少 8 个字符"
    }
  ]
}
```

## 小结

✅ 使用 `@midwayjs/validate` 组件进行验证
✅ 使用 `@Rule()` 装饰器定义验证规则
✅ 在 Controller 方法上使用 `@Validate()` 启用验证
✅ 支持字符串、数字、日期、数组等多种类型
✅ 可以自定义错误消息
✅ 验证失败会自动返回错误信息

下一节，我们将总结项目的最佳实践！
