# 模板渲染

本组件用于在 midway 体系使用服务端渲染 ejs，nunjucks 模板。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ❌    |




## 使用 ejs


### 安装依赖


选择对应的模板安装依赖。
```bash
$ npm i @midwayjs/view-ejs@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

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



### 引入组件


首先，引入组件，在 `configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/core';
import * as view from '@midwayjs/view-ejs';
import { join } from 'path'

@Configuration({
  imports: [
    view		// 导入 ejs 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```
### 配置

配置后缀，映射到指定的引擎。

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
### 使用


注意，默认的 view 目录为 `${appDir}/view` ，在其中创建一个 `hello.ejs` 文件。


目录结构如下：
```
➜  my_midway_app tree
.
├── src
│   └── controller                 ## Controller 目录
│       └── home.ts
├── view                           ## 模板目录
│   └── hello.ejs
├── test
├── package.json
└── tsconfig.json
```


我们在模板里写一些 ejs 格式的内容，比如：
```typescript
// view/hello.ejs
hello <%= data %>
```


在 Controller 中渲染。
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

### 配置后缀

默认后缀为 `.html` ，为了改成习惯的 `.ejs` 后缀，我们可以加一个 `defaultExtension` 配置。

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

这样我们在渲染时不需要增加后缀。

```typescript
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render(){
    await this.ctx.render('hello', {
      data: 'world',
    });
  }
}
```


### 默认渲染引擎

我们可以通过 `defaultViewEngine` 来设置默认的渲染引擎。

其作用是，当遇到的模板后缀，比如 `.html` 未在配置的 `mapping` 字段中找到时，使用该 `defaultViewEngine` 字段指定的引擎来渲染。

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

这样，如果模板是 `.html` 后缀，由于 `mapping` 中未指定，依旧会使用 `ejs` 来渲染。

### 配置多个模板目录

如果我们需要将代码封装为组件提供，就需要支持不同的模板目录。

默认的模板目录在 `${appDir}/view`。我们可以在 `rootDir` 字段增加其他的目录。

```typescript
// src/config/config.default.ts

// 修改默认 view 组件的 default 目录
export default {
  // ...
  view: {
    rootDir: {
      default: path.join(__dirname, './view'),
    }
  },
}

// 其他组件需要增加目录的配置
export default {
  // ...
  // view 组件的配置
  view: {
    rootDir: {
      anotherRoot: path.join(__dirname, './view'),
    }
  },
}
```

通过对象合并的机制，使得所有的 `rootDir` 都能合并到一起，组件内部会获取 values 做匹配。



## 使用 Nunjucks


和 ejs 类似，引入对应组件即可。


1、选择对应的模板安装依赖。
```bash
$ npm i @midwayjs/view-nunjucks@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

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



2、引入组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/core';
import * as view from '@midwayjs/view-nunjucks';
import { join } from 'path'

@Configuration({
  imports: [
    view		// 导入 nunjucks 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


3、增加 nunjucks 的配置，比如默认使用 nunjucks。
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


4、在 view 目录增加模板
```typescript
// view/test.nj
hi, {{ user }}
```


在 Controller 中渲染。
```typescript
import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async render(){
    await ctx.render('test.nj', { user: 'midway' });
  }
}
```
访问后会输出 `hi, midway` 。


如果有自定义 filter 的需求，可以在入口处增加，比如下面增加了一个名为 `hello` 的 filter。
```typescript
import { App, Configuration, Inject } from '@midwayjs/core';
import * as view from '@midwayjs/view-nunjucks';
import { join } from 'path'

@Configuration({
  imports: [view],
  importConfigs: [join(__dirname, 'config')]
})
export class MainConfiguration {

  @App()
  app;

  @Inject()
  env: view.NunjucksEnvironment;

  async onReady(){
    this.env.addFilter('hello', (str) => {
      return 'hi, ' + str;
    });
  }
}

```
在模板里可以使用
```typescript
{{ name | hello }}
```
然后渲染
```typescript
// controller
// ...
await ctx.render('test.nj', { name: 'midway' });
```
也会输出 `hi, midway` 。



## 自定义模板引擎

默认我们只提供了 ejs 和 nunjucks 的模板引擎，你也可以编写自己的模板引擎代码。

### 实现模板引擎

首先需要创建一个请求作用域的模板引擎类，它将在每个请求执行时初始化。你需需要实现其中的 `render` 和 `renderString` 方法。如果你的模板引擎不支持某个方法，可以抛出异常。

```typescript
// lib/view.ts
import { Provide, Config } from '@midwayjs/core';
import { IViewEngine } from '@midwayjs/view';

@Provide()
export class MyView implements IViewEngine {

  @Config('xxxx')
  viewConfig;

  async render(name: string, locals?: Record<string, any>, options?: RenderOptions) {
    return myengine.render(name, locals, options);
  }

  async renderString(tpl: string,
    locals?: Record<string, any>,
    options?: RenderOptions) {

    throw new Error('not implement');
  }
};
```

这两个方法接受类似的三个参数，`renderString` 第一个参数需要传入待解析的模板内容本身，而 `render` 方法会解析模板文件。

`render(name, locals, viewOptions)`

- name: 从 `root`（默认是 `/view` ) 相对的 path
- locals: 模板需要的数据
- viewOptions: 每次渲染的模板参数，可覆盖的配置，可以在配置文件中重写，其中包含几个参数：
  - root: 模板的绝对路径
  - name: 调用 render 方法的原始 name 值
  - locals: 调用 render 方法的原始 locals 值

`renderString(tpl, locals, viewOptions)`

- tpl: 模板名
- locals: 和 `render` 一样
- viewOptions: 和 `render` 一样

### 注册模板引擎

在实现自定义的模板引擎后，我们需要在启动入口注册它。

通过引入 `ViewManager` ，我们可以使用 `use` 方法注册自定义模板引擎。

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
export class MainConfiguration {

  @Inject()
  viewManager: view.ViewManager;

  async onReady(){
    this.viewManager.use('ejs', MyView);
  }
}

```



## 注意事项


如需在 egg(@midwayjs/web) 场景下使用，请在 `plugin.ts` 中关闭 view 和其相关插件。


```typescript
import { EggPlugin } from 'egg';
export default {
  // ...
  view: false,
} as EggPlugin;

```


否则会出现下面类似的错误。
```
TypeError: Cannot set property view of #<EggApplication> which has only a getter
```

