# 脚手架

Midway 编写了 `create-midway` 包，通过 npx 命令，可以方便的使用 `npm init midway` 命令创建脚手架。

```bash
$ npm init midway@latest -y
```

:::tip

如果不加 @latest 的 tag，可能不会更新到最新版本。

:::



## 通过 CLI 创建脚手架



### 默认行为

不传递参数，可以列出当前最常用的模版列表。

比如执行

```bash
$ npm init midway@latest -y
```

会进入模板选择界面。当前文档以 v4 为准，默认会优先展示最新模板。下面的输出为示意，具体列表以 CLI 实际输出为准。

```bash
➜  ~ npm init midway@latest
? Hello, traveller.
  Which template do you like? …

 ⊙ v4
❯ koa-v4 - A web application boilerplate with midway v4(koa)
  koa-v4-esm - A web application boilerplate with midway v4(koa)
  react-functional-v4 - A functional web application boilerplate with midway v4(react)
  vue-functional-v4 - A functional web application boilerplate with midway v4(vue)
```

该模式下，会根据用户选择，按照指引创建模版。



### 关于参数传递

由于 `npm init midway` 等价与 `npm exec create-midway`，根据不同的 npm 版本，[传递参数](https://docs.npmjs.com/cli/v10/commands/npm-exec) 的格式不同。

比如在最新的 npm 中，使用额外的 `--` 传递参数。

比如

```bash
$ npm init midway -- -h
```

`-h` 参数可以显式所有的可用选项。

下面所有的参数示例，都将以这个模式展示。



### 显式所有模版

非当前版本的模版，会默认隐藏，可以通过 `-a` 参数展示所有内置的模版。

```bash
$ npm init midway -- -a
```



### 指定模版名

每个模版都有一个模版名和模版描述，比如 `koa-v4 - A web application boilerplate with midway v4 (koa)` 的模板名为 `koa-v4`。

可以通过 `--type` 参数指定模板名。

```bash
$ npm init midway -- --type=koa-v4
```



### 指定模版包名

当自定义模版在 npm 上发布时，我们可以使用 `-t` 或者 `--template` 来指定包名。

```bash
$ npm init midway -- -t=custom-template
```

如果包还在本地开发，也可以指定一个相对路径或者绝对路径。

```bash
$ npm init midway -- -t=./custom-template
```



### 指定创建目标目录

通过 `--target` 参数可以指定创建的目录，必须和 `type` 或者 `template` 参数一同使用。

比如，下面的命令指定了 `koa-v4` 模版，将其生成到当前 `abc` 目录下，如果目录不存在，则会新建。

```bash
$ npm init midway -- --type=koa-v4 --target=abc
```

一般 `target` 可以省略，把路径放到最后一个参数即可。

```bash
$ npm init midway -- --type=koa-v4 abc
```



### 指定客户端

如果有私有客户端，可以使用 `--npm` 指定客户端。

```bash
$ npm init midway -- --npm=tnpm
```



### 指定源

如果有私有源，可以使用 `--registry` 指定私有源。

```bash
$ npm init midway -- --registry=https://registry.npmmirror.com
```



### 脚手架参数

如果脚手架中包含用户可传递的参数，也可以通过命令行传递。

```bash
$ npm init midway -- --bbb=ccc
```

如果参数名和工具的参数重复了，可以使用 `t_` 的参数，在工具传递给脚手架时，会自动处理。

```bash
$ npm init midway -- --type=koa-v4 --t_type=ccc
```



## 编写脚手架

Midway 脚手架使用了自研的 light-generator 工具，具体的使用可以参考 [https://github.com/midwayjs/light-generator](https://github.com/midwayjs/light-generator)。

也可以参考 Midway 自己的 [模版工程](https://github.com/midwayjs/midway-boilerplate)。
