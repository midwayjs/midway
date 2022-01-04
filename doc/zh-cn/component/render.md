# 模板渲染

本组件用于在 midway 体系使用服务端渲染 ejs，nunjucks 模板。



相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ❌    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ❌    |




## 使用 ejs


### 安装依赖


选择对应的模板安装依赖。
```bash
$ npm i @midwayjs/view-ejs@3 --save
```


### 引入组件


首先，引入组件，在 `configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/decorator';
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
export class ContainerLifeCycle {
}
```
### 配置
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
### 使用


注意，默认的 view 目录为 `${appRoot}/view` ，在其中创建一个 `hello.ejs` 文件。


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
import { Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
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


## 使用 Nunjucks


和 ejs 类似，引入对应组件即可。


1、选择对应的模板安装依赖。
```bash
$ npm i @midwayjs/view-nunjucks@3 --save
```


2、引入组件，在 `configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/decorator';
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
export class ContainerLifeCycle {
}
```


3、增加 nunjucks 的配置，比如默认使用 nunjucks。
```typescript
// src/config/config.default.ts
export const view = {
  defaultViewEngine: 'nunjucks',
  mapping: {
    '.nj': 'nunjucks',
  },
};

```


4、在 view 目录增加模板
```typescript
// view/test.ejs
hi, {{ user }}
```


在 Controller 中渲染。
```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
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
import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as view from '@midwayjs/view-nunjucks';
import { join } from 'path'

@Configuration({
  imports: [view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

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


## 注意事项


如需在 egg(@midwayjs/web) 场景下使用，请在 `plugint.ts` 中关闭 view 和其相关插件。


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

