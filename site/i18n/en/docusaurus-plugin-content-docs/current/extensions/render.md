# Template rendering

This component is used to render ejs and nunjucks templates using the server in midway system.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ❌ |




## Use ejs


### Installation dependency


Select the corresponding template installation dependency.
```bash
$ npm i @midwayjs/view-ejs@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/view-ejs": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



### Introducing components


First, introduce components and import them in `configuration.ts`:
```typescript
import { Configuration } from '@midwayjs/decorator';
import * as view from '@midwayjs/view-ejs';
import { join } from 'path'

@Configuration({
  imports: [
    View // import ejs components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```
### Configuration

Configure suffixes to map to the specified engine.

```typescript
// src/config/config.default.ts
export default {
  // ...
  view: {
    mapping: {
      '.ejs': 'ejs',
    },
  },
  // ejs config
  ejs: {}
}
```
### Use


Note that the default view directory is `${appDir}/view`. Create a `hello.ejs` file in the view directory.


The directory structure is as follows:
```
➜  my_midway_app tree
.
├── src
│   └── controller                 ## Controller directory
│       └── home.ts
├── view                           ## Template directory
│   └── hello.ejs
├── test
├── package.json
└── tsconfig.json
```


We write some ejs format content in the template, such:
```typescript
// view/hello.ejs
hello <%= data %>
```


Rendering in Controller.
```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render() {
    await this.ctx.render('hello.ejs', {
      data: 'world',
    });
  }
}
```

### Configure suffix

The default suffix is `.html`. In order to change the suffix to `.ejs`, we can add a `defaultExtension` configuration.

```typescript
// src/config/config.default.ts
export default {
  // ...
  view: {
    defaultExtension: '.ejs',
    mapping: {
      '.ejs': 'ejs',
    },
  },
  // ejs config
  ejs: {}
}
```

In this way, we do not need to add suffixes when rendering.

```typescript
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render() {
    await this.ctx.render('hello', {
      data: 'world',
    });
  }
}
```


### Default rendering engine

We can set the default rendering engine by `defaultViewEngine`.

Its role is to use the engine specified by the `defaultViewEngine` field to render when the template suffix encountered, such as `.html` is not found in the `mapping` field of the configuration.

```typescript
// src/config/config.default.ts
export default {
  // ...
  view: {
    defaultViewEngine: 'ejs',
    mapping: {
      '.ejs': 'ejs',
    },
  },
  // ejs config
  ejs: {}
}
```

In this way, if the template is a suffix of `.html`, `ejs` will still be used for rendering because it is not specified in the `mapping`.

### Configure multiple template directories

If we need to encapsulate the code as a component, we need to support different template directories.

The default template directory is `${appDir}/view`. We can add other directories to `rootDir` fields.

```typescript
// src/config/config.default.ts

// Modify the default directory of the default view component
export default {
  // ...
  view: {
    rootDir: {
      default: path.join(__dirname, './view')
    }
  },
}

// Other components need to add directory configuration
export default {
  // ...
  // Configuration of view components
  view: {
    rootDir: {
      anotherRoot: path.join(__dirname, './view')
    }
  },
}
```

Through the object merging mechanism, all `rootDir` can be merged together, and values are obtained inside the component for matching.



## Use Nunjucks


Similar to ejs, just introduce the corresponding components.


1. Select the corresponding template installation dependency.
```bash
$ npm i @midwayjs/view-nunjucks@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/view-nunjucks": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



2. Introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as view from '@midwayjs/view-nunjucks';
import { join } from 'path'

@Configuration({
  imports: [
    view // import nunjucks components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


3. Add nunjucks configuration, such as default nunjucks.
```typescript
export default {
  // ...
  view: {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.nj': 'nunjucks',
    },
  },
}
```


4. Add templates to the view directory
```typescript
// view/test.nj
hi, {{ user }}
```


Rendering in Controller.
```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render() {
    await ctx.render('test.nj', { user: 'midway' });
  }
}
```
After the access, `hi, midway` is output.


If you need a custom filter, you can add it at the entrance. For example, a filter named `hello` is added below.
```typescript
import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as view from '@midwayjs/view-nunjucks';
import { join } from 'path'

@Configuration({
  imports: [view]
  importConfigs: [join(__dirname, 'config')]
})
export class MainConfiguration {

  @App()
  app;

  @Inject()
  env: view.NunjucksEnvironment;

  async onReady() {
    this.env.addFilter('hello', (str) => {
      return 'hi, '+ str;
    });
  }
}

```
Can be used in the template
```typescript
{{name | hello}}
```
Then render
```typescript
// controller
// ...
await ctx.render('test.nj', { name: 'midway' });
```
`hi, midway` is also output.



## Custom template engine

By default, we only provide ejs and nunjucks template engines. You can also write your own template engine code.

### Implement template engine

First, you need to create a template engine class for request scope, which will be initialized when each request is executed. You need to implement the `render` and `renderString` methods. If your template engine does not support a method, you can throw an exception.

```typescript
// lib/view.ts
import { Provide, Config } from '@midwayjs/decorator';
import { IViewEngine } from '@midwayjs/view';

@Provide()
export class MyView implements IViewEngine {

  @Config('xxxx')
  viewConfig;

  async render(name: string, locals?: Record<string, any>, options?: RenderOptions) {
    return myengine.render(name, locals, options);
  }

  async renderString(tpl: string
    locals?: Record<string, any>
    options?: RenderOptions) {

    throw new Error('not implement');
  }
};
```

These two methods accept three similar parameters, `renderString` the first parameter needs to pass in the template content to be parsed, while the `render` method parses the template file.

`render(name, locals, viewOptions)`

- name: the path from the `root` (default is `/view` ).
- Locals: data required by the template
- viewOptions: The template parameters for each rendering, the overridden configuration, can be overridden in the configuration file, which contains several parameters:
   - root: the absolute path of the template
   - Name: The original name value that calls the render method.
   - locals: the original locals value that calls the render method.

`renderString(tpl, locals, viewOptions)`

- tpl: template name
- Locals: Same as `render`
- viewOptions: Same as `render`

### Register template engine

After implementing the custom template engine, we need to register it at the startup portal.

By introducing `ViewManager`, we can use the `use` method to register a custom template engine.

```typescript
// src/configuration.ts
import { Configuration, Inject, Provide } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as view from '@midwayjs/view';
import { MyView } from './lib/my';

@Configuration({
  imports: [koa, view]
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  @Inject()
  viewManager: view.ViewManager;

  async onReady() {
    this.viewManager.use('ejs', MyView);
  }
}

```



## Precautions


To use in egg(@midwayjs/web) scenarios, close view and its related plug-ins in `plugint.ts`.


```typescript
import { EggPlugin } from 'egg';
export default {
  // ...
  view: false
} as EggPlugin;

```


Otherwise, the following similar errors will occur.
```
TypeError: Cannot set property view of #<EggApplication> which has only a getter
```

