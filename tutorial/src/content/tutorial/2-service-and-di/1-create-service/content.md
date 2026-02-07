---
type: lesson
title: 创建第一个 Service
focus: /src/service/user.service.ts
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

# 创建第一个 Service

Service 是用来封装业务逻辑的类，让代码更易维护和测试。

## 创建 User Service

让我们创建一个用户服务来管理用户数据。

### 步骤 1：创建 Service 类

在右侧编辑器中创建 `src/service/user.service.ts`：

```typescript
import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  // 模拟用户数据库
  private users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ];

  // 获取所有用户
  async getUsers() {
    return this.users;
  }

  // 根据 ID 获取用户
  async getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  // 创建新用户
  async createUser(name: string, email: string) {
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

## 关键点解析

### 1. `@Provide()` 装饰器

```typescript
@Provide()
export class UserService { }
```

- 将类注册到 IoC 容器中
- 使其可以被其他类注入使用
- 默认是单例模式（整个应用共享一个实例）

### 2. Service 的职责

Service 应该：
- ✅ 包含业务逻辑
- ✅ 访问数据库或外部 API
- ✅ 处理数据转换
- ✅ 可以被多个 Controller 复用

Service 不应该：
- ❌ 直接处理 HTTP 请求/响应
- ❌ 包含路由逻辑
- ❌ 直接访问 ctx（上下文）

### 3. 异步方法

注意我们使用了 `async` 关键字：

```typescript
async getUsers() {
  return this.users;
}
```

虽然这个例子是同步的，但在实际应用中，Service 通常会：
- 查询数据库（异步操作）
- 调用外部 API（异步操作）
- 读写文件（异步操作）

所以养成使用 `async/await` 的习惯很重要。

## 动手实践：添加更多方法

尝试为 UserService 添加更多方法：

```typescript
// 更新用户信息
async updateUser(id: number, data: { name?: string; email?: string }) {
  const user = this.users.find(u => u.id === id);
  if (!user) {
    return null;
  }
  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email;
  return user;
}

// 删除用户
async deleteUser(id: number) {
  const index = this.users.findIndex(u => u.id === id);
  if (index === -1) {
    return false;
  }
  this.users.splice(index, 1);
  return true;
}

// 搜索用户
async searchUsers(keyword: string) {
  return this.users.filter(
    user =>
      user.name.includes(keyword) || user.email.includes(keyword)
  );
}
```

## Service 的优势

现在我们的业务逻辑都在 Service 中，这带来了很多好处：

1. **可复用性** - 多个 Controller 可以使用同一个 Service
2. **可测试性** - 可以独立测试 Service，不需要启动 HTTP 服务器
3. **职责分离** - Controller 只负责处理请求，Service 负责业务逻辑
4. **易于维护** - 修改业务逻辑时只需修改 Service

## 小结

✅ 使用 `@Provide()` 注册 Service
✅ Service 封装业务逻辑
✅ Service 方法通常是异步的
✅ Service 可以被多个地方复用

下一节，我们将学习如何在 Controller 中使用这个 Service！
