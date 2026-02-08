---
type: lesson
title: Project Structure
focus: /README.md
editor:
  fileTree:
    allowEdits: false
terminal: false
previews: false
---

# Understand the Midway Project Structure

Let's quickly walk through the standard Midway application layout.

## Directory overview

```text
my_midway_app/
├── src/
│   ├── controller/
│   │   └── home.controller.ts
│   ├── service/
│   ├── config/
│   │   └── config.default.ts
│   └── configuration.ts
├── bootstrap.js
├── package.json
└── tsconfig.json
```

## Core files

### `bootstrap.js`
Application entry that starts Midway.

### `src/configuration.ts`
Defines imported components and config loading.

### `src/controller/`
Request handling layer.

### `src/service/`
Reusable business logic.

### `src/config/`
Environment and framework configuration.

## Code walkthrough

### `bootstrap.js`

```javascript title="bootstrap.js"
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.run();
```

### `src/configuration.ts`

```typescript title="src/configuration.ts"
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as defaultConfig from './config/config.default';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // executed when app is ready
  }
}
```

### `src/controller/home.controller.ts`

```typescript title="src/controller/home.controller.ts"
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

### `src/config/config.default.ts`

```typescript title="src/config/config.default.ts"
export default {
  keys: '123456',
  koa: {
    port: 7001,
  },
};
```

## Common extra folders

- `middleware/`
- `filter/`
- `entity/` or `model/`
- `util/`
- `decorator/`

## Next step

Now that you know the layout, let's build your first controller.
