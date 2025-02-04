# 事件

事件组件是基于 [eventemitter2](https://github.com/EventEmitter2/EventEmitter2) 实现的，提供了强大的事件处理能力。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 安装依赖

```bash
$ npm i @midwayjs/event-emitter@3 --save
```

或者在 `package.json` 中增加依赖后，重新安装

```json
{
  "dependencies": {
    "@midwayjs/event-emitter": "^3.0.0"
  }
}
```

## 使用组件

首先在 `configuration.ts` 中引入组件：

```typescript
import { Configuration } from '@midwayjs/core';
import * as eventEmitter from '@midwayjs/event-emitter';

@Configuration({
  imports: [
    // ...
    eventEmitter
  ]
})
export class MainConfiguration {
}
```

## 基础使用

### 定义事件监听器

:::caution
注意：`@OnEvent()` 装饰器只能用在单例（Singleton）类上。如果在非单例类上使用，事件监听器将无法正常工作。
:::

使用 `@OnEvent()` 装饰器来定义事件监听器：

```typescript
import { Provide, Singleton } from '@midwayjs/core';
import { OnEvent } from '@midwayjs/event-emitter';

@Provide()
@Singleton()    // 必须使用 @Singleton 装饰器
export class UserService {
  @OnEvent('user.created')
  async handleUserCreated(user: any) {
    console.log('新用户创建:', user);
  }
}
```

### 发送事件

通过注入 `EventEmitterService` 来发送事件：

```typescript
import { Inject } from '@midwayjs/core';
import { EventEmitterService } from '@midwayjs/event-emitter';

@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async createUser() {
    const user = { id: 1, name: 'harry' };
    // ... 创建用户逻辑
    
    // 发送同步事件
    this.eventEmitterService.emit('user.created', user);
    
    // 或者发送异步事件
    await this.eventEmitterService.emitAsync('user.created', user);
  }
}
```

## 高级特性

### 事件监听器选项

`@OnEvent()` 装饰器支持多个配置选项，每个选项都有其特定的用途：

#### prependListener

用于控制监听器的执行顺序。设置为 `true` 时，会将监听器添加到监听器队列的开头，这样可以确保该监听器最先执行。

```typescript
@Provide()
@Singleton()
export class UserService {
  // 这个监听器会最先执行
  @OnEvent('user.created', { prependListener: true })
  async handleUserCreatedFirst(user: any) {
    console.log('第一个处理用户创建事件');
  }

  // 这个监听器会在队列末尾执行
  @OnEvent('user.created')
  async handleUserCreated(user: any) {
    console.log('后续处理用户创建事件');
  }
}
```

#### suppressErrors

控制事件处理器中的错误处理行为：
- 默认值为 `true`，表示错误会被捕获并忽略
- 设置为 `false` 时，错误会被抛出，可以在外层捕获

```typescript
@Provide()
@Singleton()
export class UserService {
  // 错误会被抛出
  @OnEvent('user.created', { suppressErrors: false })
  async handleWithError(user: any) {
    throw new Error('处理失败');  // 这个错误会被抛出
  }

  // 错误会被忽略
  @OnEvent('user.created', { suppressErrors: true })
  async handleSuppressError(user: any) {
    throw new Error('处理失败');  // 这个错误会被忽略
  }
}

// 在调用处可以捕获错误
@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async createUser() {
    try {
      await this.eventEmitterService.emitAsync('user.created', { id: 1 });
    } catch (err) {
      // 可以捕获到 suppressErrors: false 的处理器抛出的错误
      console.error('事件处理失败:', err);
    }
  }
}
```

#### async

控制事件处理器的执行方式：
- 设置为 `true` 时，处理器会在单独的事件循环中异步执行
- 默认为 `false`，会按顺序同步执行

```typescript
@Provide()
@Singleton()
export class UserService {
  // 异步执行，不会阻塞其他处理器
  @OnEvent('user.created', { async: true })
  async handleAsync(user: any) {
    await someTimeConsumingTask();
    console.log('异步处理完成');
  }

  // 同步执行，会按顺序等待
  @OnEvent('user.created')
  async handleSync(user: any) {
    console.log('同步处理');
  }
}
```

### 通配符事件

通配符事件允许你使用模式匹配来监听一组相关的事件。需要在配置中启用 `wildcard: true`。

#### 配置启用

```typescript
// config/config.default.ts
export default {
  eventEmitter: {
    wildcard: true,  // 启用通配符功能
  }
}
```

#### 使用示例

```typescript
@Provide()
@Singleton()
export class UserService {
  // 监听所有用户相关事件
  @OnEvent('user.*')
  async handleUserEvents(...args: any[]) {
    // 注意：通配符模式下，事件处理器直接接收发送事件时传入的参数
    console.log('事件参数:', args);
  }

  // 监听多层级的事件
  @OnEvent('user.*.detail')
  async handleUserDetailEvents(...args: any[]) {
    // 可以匹配 user.profile.detail, user.settings.detail 等
    console.log('事件参数:', args);
  }
}

// 发送事件示例
@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async updateUser() {
    // 这些事件都会被上面的 user.* 处理器捕获
    await this.eventEmitterService.emitAsync('user.created', { id: 1 });
    await this.eventEmitterService.emitAsync('user.updated', { id: 1, name: 'new name' });
    await this.eventEmitterService.emitAsync('user.profile.detail', { id: 1, profile: {} });
  }
}
```

:::info
注意：在使用通配符事件时，事件处理器的参数直接是事件发送时传入的参数。无法在处理器中获取具体触发的事件名称，所以建议在发送事件时将必要的信息包含在事件参数中。
:::

### 命名空间事件

命名空间事件提供了一种组织和分组事件的方式。通过 `delimiter` 配置分隔符。

#### 配置启用

```typescript
// config/config.default.ts
export default {
  eventEmitter: {
    delimiter: '.' // 设置命名空间分隔符
  }
}
```

#### 使用示例

```typescript
@Provide()
@Singleton()
export class OrderService {
  // 监听订单命名空间下的创建事件
  @OnEvent('order.created')
  async handleOrderCreated(order: any) {
    console.log('订单创建:', order);
  }

  // 如果需要使用通配符匹配，需要额外启用 wildcard: true
  @OnEvent('order.payment.*')
  async handleOrderPaymentEvents(...args: any[]) {
    // 可以匹配 order.payment.success, order.payment.failed 等
    console.log('事件参数:', args);
  }
}

// 发送命名空间事件
@Provide()
export class PaymentService {
  @Inject()
  eventEmitterService: EventEmitterService;

  async processPayment() {
    // 发送支付成功事件
    await this.eventEmitterService.emitAsync('order.payment.success', {
      orderId: '123',
      amount: 100
    });
  }
}
```

:::info
注意：命名空间的分隔符默认是 `.`，你可以通过 `delimiter` 配置修改。如果需要使用通配符（如 `*`）进行事件匹配，则需要额外启用 `wildcard: true` 配置。
:::

## 配置

在 `config.default.ts` 中可以配置 Event Emitter 的行为：

```typescript
export default {
  // ...
  eventEmitter: {
    // 是否开启通配符事件
    wildcard: true,
    // 命名空间分隔符
    delimiter: '.',
    // 是否启用新监听器事件
    newListener: false,
    // 是否启用移除监听器事件
    removeListener: false,
    // 设置最大监听器数量
    maxListeners: 10,
    // 是否启用详细的内存泄漏检测
    verboseMemoryLeak: false,
  }
}
```

## 常见问题

### 1. 事件处理顺序

- 默认情况下，事件处理器按照注册顺序执行
- 使用 `prependListener: true` 可以将处理器添加到队列开头
- 异步事件处理器（`emitAsync`）会按顺序等待每个处理器完成

### 2. 错误处理

- 默认情况下，事件处理器中的错误会被抑制（`suppressErrors: true`）
- 设置 `suppressErrors: false` 可以让错误抛出
- 使用 `emitAsync` 时，可以通过 try/catch 捕获错误

### 3. 性能考虑

- 合理使用通配符事件，过多的通配符匹配可能影响性能
- 设置适当的 `maxListeners` 值，避免内存泄漏
- 及时移除不需要的事件监听器