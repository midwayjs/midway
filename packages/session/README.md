# @midwayjs/session

Session component for @midwayjs/koa and @midwayjs/faas


## Install

```bash
$ npm i @midwayjs/session --save
$ npm i @types/koa-session --save-dev
```


## Usage

@midwayjs/koa has enabled this component by default, @midwayjs/faas needs to be manually enabled.

```bash
// src/configuration.ts

import { join } from 'path';
import * as faas from '@midwayjs/faas';
import * as session from '@midwayjs/session';

@Configuration({
  imports: [
    faas,
    session,
  ],
  // ...
})
export class ContainerLifeCycle implements ILifeCycle {}

```

## Config

You can configure session in your `config.*.ts`.

default value.

```ts
export const session = {
  maxAge: 24 * 3600 * 1000, // ms
  key: 'mw.sess',
  httpOnly: true,
  encrypt: true,
  // sameSite: null,
  logValue: true,
};
```

you can use all config from koa-session.

## Custom Session Store

Write a session store class first, extends abstract `SessionStore` class.

```ts
import { SessionStore } from '@midwayjs/session';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemorySessionStore extends SessionStore {
  sessions = {};
  async get(key) {
    return this.sessions[key];
  }

  async set(key, value) {
    this.sessions[key] = value;
  }

  async destroy(key) {
    this.sessions[key] = undefined;
  }
}
```

add custom sessionStore to session component.

```ts
import { MemorySessionStore } from './store';
import * as session from '@midwayjs/session';

@Configuration({
  imports: [
    koa,
    session,
  ],
  //...
})
export class AutoConfiguration {
  @Inject()
  memoryStore: MemorySessionStore;

  @Inject()
  sessionStoreManager: session.SessionStoreManager;

  async onReady() {
    this.sessionStoreManager.setSessionStore(this.memoryStore);
  }
}
```

## Questions & Suggestions

Please open an issue [here](https://github.com/midwayjs/midway/issues/).

## License

MIT
