---
type: lesson
title: Application Configuration
focus: /src/config/config.default.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Application Configuration

This lesson follows the `env_config` document and focuses on practical multi-environment setup.

## Config file conventions

```text
src/config/
  config.default.ts
  config.local.ts
  config.prod.ts
```

- `config.default.ts`: loaded in all environments
- `config.{env}.ts`: loaded only for a specific environment and overrides defaults

## Recommended export format

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    keys: ['123456'],
    port: 7001,
  },
  app: {
    name: 'midway-tutorial',
    version: '1.0.0',
  },
} as MidwayConfig;
```

## Load config in `configuration.ts`

```typescript
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class MainConfiguration {}
```

## Quick verification

Update `src/config/config.default.ts`:

```typescript
app: {
  name: 'midway-learning-lab',
  version: '2026.02',
},
```

After save:

- `output` should show app restart
- Preview remains available on port `7001`
- `GET /` should return updated config values

## Read config in code

```typescript
import { Controller, Get, Config } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Config('app.name')
  appName: string;

  @Config('app.version')
  appVersion: string;

  @Get('/')
  async home() {
    return {
      name: this.appName,
      version: this.appVersion,
    };
  }
}
```

## Summary

- Use `config.default.ts + config.{env}.ts`
- Prefer object-based config exports
- Declare env config explicitly in `importConfigs`
- Override behavior follows later-layer precedence
