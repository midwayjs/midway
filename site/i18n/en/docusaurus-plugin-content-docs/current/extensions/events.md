# Events

The Events component is implemented based on [eventemitter2](https://github.com/EventEmitter2/EventEmitter2), providing powerful event handling capabilities.

Related Information:

| Description                  |      |
| --------------------------- | ---- |
| Available for Standard Project | ✅    |
| Available for Serverless    | ✅    |
| Available for Integration   | ✅    |
| Contains Independent Framework | ❌    |
| Contains Independent Log    | ❌    |

## Installation

```bash
$ npm i @midwayjs/event-emitter@3 --save
```

Or add the dependency to your `package.json` and reinstall:

```json
{
  "dependencies": {
    "@midwayjs/event-emitter": "^3.0.0"
  }
}
```

## Using the Component

First, import the component in your `configuration.ts`:

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

## Basic Usage

### Defining Event Listeners

:::caution
Note: The `@OnEvent()` decorator can only be used on singleton classes. Event listeners will not work properly if used on non-singleton classes.
:::

Use the `@OnEvent()` decorator to define event listeners:

```typescript
import { Provide, Singleton } from '@midwayjs/core';
import { OnEvent } from '@midwayjs/event-emitter';

@Provide()
@Singleton()    // @Singleton decorator is required
export class UserService {
  @OnEvent('user.created')
  async handleUserCreated(user: any) {
    console.log('New user created:', user);
  }
}
```

### Emitting Events

Inject `EventEmitterService` to emit events:

```typescript
import { Inject } from '@midwayjs/core';
import { EventEmitterService } from '@midwayjs/event-emitter';

@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async createUser() {
    const user = { id: 1, name: 'harry' };
    // ... user creation logic
    
    // Emit synchronous event
    this.eventEmitterService.emit('user.created', user);
    
    // Or emit asynchronous event
    await this.eventEmitterService.emitAsync('user.created', user);
  }
}
```

## Advanced Features

### Event Listener Options

The `@OnEvent()` decorator supports multiple configuration options:

#### prependListener

Controls the execution order of listeners. When set to `true`, the listener will be added to the beginning of the listener queue.

```typescript
@Provide()
@Singleton()
export class UserService {
  // This listener will execute first
  @OnEvent('user.created', { prependListener: true })
  async handleUserCreatedFirst(user: any) {
    console.log('First handler for user creation');
  }

  // This listener will execute at the end of the queue
  @OnEvent('user.created')
  async handleUserCreated(user: any) {
    console.log('Subsequent handler for user creation');
  }
}
```

#### suppressErrors

Controls error handling behavior in event handlers:
- Default value is `true`, meaning errors will be caught and ignored
- When set to `false`, errors will be thrown and can be caught externally

```typescript
@Provide()
@Singleton()
export class UserService {
  // Errors will be thrown
  @OnEvent('user.created', { suppressErrors: false })
  async handleWithError(user: any) {
    throw new Error('Processing failed');  // This error will be thrown
  }

  // Errors will be ignored
  @OnEvent('user.created', { suppressErrors: true })
  async handleSuppressError(user: any) {
    throw new Error('Processing failed');  // This error will be ignored
  }
}

// Errors can be caught at the call site
@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async createUser() {
    try {
      await this.eventEmitterService.emitAsync('user.created', { id: 1 });
    } catch (err) {
      // Can catch errors from handlers with suppressErrors: false
      console.error('Event processing failed:', err);
    }
  }
}
```

#### async

Controls how event handlers are executed:
- When set to `true`, handlers will execute asynchronously in separate event loops
- Default is `false`, handlers will execute synchronously in sequence

```typescript
@Provide()
@Singleton()
export class UserService {
  // Asynchronous execution, won't block other handlers
  @OnEvent('user.created', { async: true })
  async handleAsync(user: any) {
    await someTimeConsumingTask();
    console.log('Async processing complete');
  }

  // Synchronous execution, will wait in sequence
  @OnEvent('user.created')
  async handleSync(user: any) {
    console.log('Sync processing');
  }
}
```

### Wildcard Events

Wildcard events allow you to listen to a group of related events using pattern matching. Requires enabling `wildcard: true` in configuration.

#### Configuration

```typescript
// config/config.default.ts
export default {
  eventEmitter: {
    wildcard: true,  // Enable wildcard functionality
  }
}
```

#### Usage Example

```typescript
@Provide()
@Singleton()
export class UserService {
  // Listen to all user-related events
  @OnEvent('user.*')
  async handleUserEvents(...args: any[]) {
    // Note: In wildcard mode, event handlers receive the emitted event parameters directly
    console.log('Event parameters:', args);
  }

  // Listen to multi-level events
  @OnEvent('user.*.detail')
  async handleUserDetailEvents(...args: any[]) {
    // Matches events like user.profile.detail, user.settings.detail
    console.log('Event parameters:', args);
  }
}

// Event emission example
@Provide()
export class UserController {
  @Inject()
  eventEmitterService: EventEmitterService;

  async updateUser() {
    // These events will be caught by the user.* handler above
    await this.eventEmitterService.emitAsync('user.created', { id: 1 });
    await this.eventEmitterService.emitAsync('user.updated', { id: 1, name: 'new name' });
    await this.eventEmitterService.emitAsync('user.profile.detail', { id: 1, profile: {} });
  }
}
```

:::info
Note: In wildcard events, handlers receive the emitted parameters directly. The specific event name that triggered the handler cannot be accessed, so it's recommended to include necessary information in the event parameters.
:::

### Namespaced Events

Namespaced events provide a way to organize and group events. The delimiter can be configured using the `delimiter` option.

#### Configuration

```typescript
// config/config.default.ts
export default {
  eventEmitter: {
    delimiter: '.' // Set namespace delimiter
  }
}
```

#### Usage Example

```typescript
@Provide()
@Singleton()
export class OrderService {
  // Listen to order creation events in the order namespace
  @OnEvent('order.created')
  async handleOrderCreated(order: any) {
    console.log('Order created:', order);
  }

  // To use wildcard matching, wildcard: true must be enabled
  @OnEvent('order.payment.*')
  async handleOrderPaymentEvents(...args: any[]) {
    // Matches events like order.payment.success, order.payment.failed
    console.log('Event parameters:', args);
  }
}

// Emitting namespaced events
@Provide()
export class PaymentService {
  @Inject()
  eventEmitterService: EventEmitterService;

  async processPayment() {
    // Emit payment success event
    await this.eventEmitterService.emitAsync('order.payment.success', {
      orderId: '123',
      amount: 100
    });
  }
}
```

:::info
Note: The default namespace delimiter is `.` and can be modified using the `delimiter` configuration. If you need to use wildcards (like `*`) for event matching, you need to additionally enable `wildcard: true` in the configuration.
:::

## Configuration

Configure Event Emitter behavior in `config.default.ts`:

```typescript
export default {
  // ...
  eventEmitter: {
    // Enable wildcard events
    wildcard: true,
    // Namespace delimiter
    delimiter: '.',
    // Enable new listener events
    newListener: false,
    // Enable remove listener events
    removeListener: false,
    // Set maximum number of listeners
    maxListeners: 10,
    // Enable verbose memory leak detection
    verboseMemoryLeak: false,
  }
}
```

## Common Issues

### 1. Event Handler Order

- By default, event handlers execute in registration order
- Use `prependListener: true` to add handlers to the beginning of the queue
- Async event handlers (`emitAsync`) will wait for each handler to complete in sequence

### 2. Error Handling

- By default, errors in event handlers are suppressed (`suppressErrors: true`)
- Set `suppressErrors: false` to allow errors to be thrown
- When using `emitAsync`, errors can be caught using try/catch

### 3. Performance Considerations

- Use wildcard events judiciously, as excessive wildcard matching may impact performance
- Set appropriate `maxListeners` values to avoid memory leaks
- Remove unnecessary event listeners promptly 