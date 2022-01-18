# Midway Static File Component

Static server plugin for egg, base on [koa-static-cache](https://github.com/koajs/static-cache).

## Install

```bash
$ npm i @midwayjs/static-file --save
```

available in koa/egg/faas.

## Usage

import info component in `configuration.ts` file

```ts
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    staticFile,
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}

```

support all configurations in [koa-static-cache](https://github.com/koajs/static-cache). and with default configurations below:

- dynamic: `true`
- preload: `false`
- maxAge: `31536000` in prod env, `0` in other envs
- buffer: `true` in prod env, `false` in other envs

provides one more option:

- maxFiles: the maximum value of cache items, only effective when dynamic is true, default is `1000`.

**All static files in `$appDir/public` can be visited with prefix `/public`, and all the files are lazy loaded.**

- In non-production environment, assets won't be cached, your modification can take effect immediately.
- In production environment, `@midwayjs/static-file` will cache the assets after visited, you need to restart the process to update the assets.
- Dir default is `$appDir/public` but you can also define **multiple directory** by default, static server will use all these directories.

```js
// {app_root}/src/config/config.default.ts
export const staticFile = {
  dirs: {
    default: {
      prefix: '/public',
      dir: 'xxx'
    },
    antoherDir: {
      prefix: '/',
      dir: 'xxx'
    }
  }
};
```

if you want to override default prefix, just set `dirs.default`.

```js
// {app_root}/src/config/config.default.ts
export const staticFile = {
  dirs: {
    default: {
      prefix: '/',
    },
  }
};
```


## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
