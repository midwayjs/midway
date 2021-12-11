# @midwayjs/express-session

Session component for @midwayjs/express


## Install

```bash
$ npm i @midwayjs/express-session --save
$ npm i @types/express-session --save-dev
```


## Usage

@midwayjs/express has enabled this component by default.

We use [cookie-session](https://github.com/expressjs/cookie-session) to keep session by default and use [express-session](https://github.com/expressjs/session) when set custom session store.

## Config

You can configure session in your `config.*.ts`.

default value.

```ts
export const session = {
  secret: undefined, // must be set in application
  name: 'MW_SESS',
  cookie: {
    maxAge: 24 * 3600 * 1000, // ms
    httpOnly: true,
    // sameSite: null,
  },
};
```

You can set 'session.cookie' for cookie-session config.

## Custom Session Store

You can use compatible session store [here](https://github.com/expressjs/session#compatible-session-stores).

Let's give an example for [memorystore](https://github.com/roccomuso/memorystore).

```ts
import { Configuration, Inject } from '@midwayjs/decorator';
import * as session from '@midwayjs/express-session';
import MemoryStore = require('memorystore');

@Configuration({
  imports: [
    express,
    session,
  ],
  //...
})
export class AutoConfiguration {
  @Inject()
  sessionStoreManager: session.SessionStoreManager;

  async onReady() {
    this.sessionStoreManager.setSessionStore(MemoryStore, {
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
}
```

## Questions & Suggestions

Please open an issue [here](https://github.com/midwayjs/midway/issues/).

## License

MIT
