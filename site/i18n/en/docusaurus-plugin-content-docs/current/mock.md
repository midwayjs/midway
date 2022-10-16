# Data simulation

Midway provides the built-in ability to simulate data during development and testing.



## Mock during testing

`@midwayjs/mock` provides some more general APIs for simulation during testing.

### Simulation context

`mockContext` methods are used to simulate the context.

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // Simulation context
  mockContext(app, 'user', 'midway');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.user => midway
  // ...
});
```

If your data is complex or logical, you can also use the callback form.

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // Simulation context
  mockContext(app, (ctx) => {
    ctx.user = 'midway';
  });
});
```

Note that this mock behavior is executed before all middleware.



### Analog Session

`mockSession` methods are used to simulate Session.

```typescript
import { mockSession } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  mockSession(app, 'user', 'midway');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.session.user => midway
  // ...
});
```

### Simulate Header

Use `mockHeader` methods to simulate Header.

```typescript
import { mockHeader } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  mockHeader(app, 'x-abc', 'bbb');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.headers['x-abc'] => bbb
  // ...
});
```

### Simulation class attribute

Use the `mockClassProperty` method to simulate the properties of the class.

If there is the following service class.

```typescript
@Provide()
export class UserService {
  data;

  async getUser() {
    return 'hello';
  }
}
```

We can simulate it when we use it.

```typescript
import { mockClassProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  mockClassProperty(UserService, 'data', {
    bbb: 1
  });
  // userService.data => {bbb: 1}

  // ...
});
```

It is also possible to simulate the method.

```typescript
import { mockClassProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  mockClassProperty(UserService, 'getUser', async () => {
    return 'midway';
  });

  // userService.getUser() => 'midway'

  // ...
});
```



### Simulate common object properties

Use the `mockProperty` method to mock object properties.

```typescript
import { mockProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  const a = {};
  mockProperty(a, 'name', 'hello');

  // a['name'] => 'hello'

  // ...
});
```

It is also possible to simulate the method.

```typescript
import { mockProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  const a = {};
  mockProperty(a, 'getUser', async () => {
    return 'midway';
  });

  // a.getUser() => 'midway'

  // ...
});
```



### Clean up mock

Every time the `close` method is called, all mock data is automatically cleared.

If you want to clean up manually, you can also perform method `restoreAllMocks`.

```typescript
import { restoreAllMocks } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  restoreAllMocks();
  // ...
});
```



## Standard Mock service

Midway provides standard MidwayMockService services for simulating data in code.

Various simulation methods in `@midwayjs/mock` have all called this service at the bottom.

For more information, see [Built-in services](./built_in_service#midwaymockservice).
