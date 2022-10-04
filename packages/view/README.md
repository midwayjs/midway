# midway-view

Base view component for midway.

## Install

@midwayjs/view don't have build-in view engine, So you should choose a template engine like ejs, and install `@midwayjs/view-ejs`.
View component will be auto install and enable by import `view-ejs`.

```bash
$ npm i @midwayjs/view-ejs --save
```

## Usage

First, import component in `src/configuration.ts`.

```typescript
import { Configuration } from '@midwayjs/core';
import * as view from '@midwayjs/view-ejs';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    view
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerLifeCycle {
}
```

Configure the mapping, the file with `.ejs` extension will be rendered by ejs.

```typescript
// src/config/config.default.ts
export const view = {
  defaultViewEngine: 'ejs',
  mapping: {
    '.ejs': 'ejs',
  },
};

// ejs config
export const ejs = {};
```

In controller, you can call `ctx.render`.

```typescript
import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render(){
    await this.ctx.render('hello.ejs', {
      data: 'world',
    });
  }
}
```

## Use multiple view engine

@midwayjs/view support multiple view engine, so you can use more than one template engine in one application.

If you want add another template engine like nunjucks, then you can add @midwayjs/view-nunjucks component.

Configure the plugin and mapping

```typescript
// src/config/config.default.ts
export const view = {
  mapping: {
    '.ejs': 'ejs',
    '.nj': 'nunjucks',
  },
};
```
You can simply render the file with .nj extension.

```typescript
await this.ctx.render('user.nj');
```

## Write a view engine

Create a view engine class first, and implement render and renderString, if the template engine don't support, just throw an error.

```typescript
// lib/view.ts
import { Provide } from '@midwayjs/core';

@Provide()
export class MyView {

  @Config('xxxx')
  viewConfig;

  async render(fullpath, locals) {
    return myengine.render(fullpath, locals);
  }

  async renderString() { throw new Error('not implement'); }
};
```

These methods receive three arguments, `renderString` will pass tpl as the first argument instead of name in `render`.

`render(name, locals, viewOptions)`

- name: the file path that can resolve from root (`/view` by default)
- locals: data used by template
- viewOptions: the view options for each render, it can override the view default config in `config/config.default.js`. Plugin should implement it if it has config.
  When you implement view engine, you will receive this options from `render`, the options contain:
  - root: it will resolve the name to full path, but seperating root and name in viewOptions.
  - name: the original name when call render
  - locals: the original locals when call render

`renderString(tpl, locals, viewOptions)`

- tpl: the template string instead of the file, using in `renderString`
- locals: same as `render`
- viewOptions: same as `render`

### Register

After define a view engine, you can register it.

```typescript
// src/configuration.ts
import { Configuration, Inject, Provide } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as view from '@midwayjs/view';
import { MyView } from './lib/my';

@Configuration({
  imports: [koa, view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  @Inject()
  viewManager: view.ViewManager;

  async onReady(){
    this.viewManager.use('ejs', MyView);
  }
}

```

You can define a view engine name, normally it's a template name.

## Configuration

### Root

Root is `${appDir}/view` by default, but you can define multiple directory.

```typescript
export default appInfo => {
  const appDir = appInfo.appDir;
  return {
    view: {
      rootDir: {
        default: `${appDir}/view`,
        anotherDir: `${appDir}/view2`
      }
    }
  }
}
```

### defaultExtension

When render a file, you should specify a extension that let @midway/view know which engine you want to use. However you can define `defaultExtension` without write the extension.

```typescript
// src/config/config.default.ts
export const view = {
  defaultExtension: '.html',
};

// controller
import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render(){
    // render user.html
    await this.ctx.render('user');
  }
}
```

### viewEngine and defaultViewEngine

If you are using `renderString`, you should specify viewEngine in view config, see example above.

However, you can define `defaultViewEngine` without set each time.

```js
// config/config.default.js
export const view = {
  defaultViewEngine: 'ejs',
};
```


## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
