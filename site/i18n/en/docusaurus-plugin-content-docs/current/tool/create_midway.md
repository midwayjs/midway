# Scaffolding

Midway has written the `create-midway` package. Through the npx command, you can easily use the `npm init midway` command to create scaffolding.

```bash
$ npm init midway@latest -y
```

:::tip

If you don’t add the @latest tag, you may not be updated to the latest version.

:::



## Create scaffolding via CLI



### Default behavior

Without passing parameters, you can list the currently most commonly used templates.

For example, execute

```bash
$ npm init midway@latest -y
```

It will open the template picker. This doc targets v4, so the latest templates are shown first. The output below is illustrative only, and the actual list depends on the CLI version.

```bash
➜ ~ npm init midway@latest
? Hello, traveler.
   Which template do you like? …

  ⊙ v4
❯ koa-v4 - A web application boilerplate with midway v4(koa)
   koa-v4-esm - A web application boilerplate with midway v4(koa)
   react-functional-v4 - A functional web application boilerplate with midway v4(react)
   vue-functional-v4 - A functional web application boilerplate with midway v4(vue)
```

In this mode, templates will be created according to user selections and guidelines.



### About parameter passing

Since `npm init midway` is equivalent to `npm exec create-midway`, the format of [passing parameters](https://docs.npmjs.com/cli/v10/commands/npm-exec) depends on different npm versions. different.

For example, in the latest npm, use additional `--` to pass parameters.

for example

```bash
$ npm init midway -- -h
```

The `-h` parameter makes all available options explicit.

All parameter examples below will be displayed in this mode.



### Show all templates

Templates that are not the current version will be hidden by default. All built-in templates can be displayed through the `-a` parameter.

```bash
$ npm init midway -- -a
```



### Specify template name

Each template has a template name and template description. For example, the template name of `koa-v4 - A web application boilerplate with midway v4 (koa)` is `koa-v4`.

The template name can be specified via the `--type` parameter.

```bash
$ npm init midway -- --type=koa-v4
```



### Specify template package name

When the custom template is published on npm, we can use `-t` or `--template` to specify the package name.

```bash
$ npm init midway -- -t=custom-template
```

If the package is still being developed locally, you can also specify a relative path or an absolute path.

```bash
$ npm init midway -- -t=./custom-template
```



### Specify the creation target directory

The directory to be created can be specified through the `--target` parameter, which must be used together with the `type` or `template` parameter.

For example, the following command specifies the `koa-v4` template and generates it into the current `abc` directory. If the directory does not exist, it will be created.

```bash
$ npm init midway -- --type=koa-v4 --target=abc
```

Generally, `target` can be omitted and the path can be placed as the last parameter.

```bash
$ npm init midway -- --type=koa-v4 abc
```



### Specify npm client

If you have a private client, you can use `--npm` to specify the client.

```bash
$ npm init midway -- --npm=tnpm
```



### Specify registry

If you have a private source, you can use `--registry` to specify the private source.

```bash
$ npm init midway -- --registry=https://registry.npmmirror.com
```



### Scaffolding parameters

If the scaffold contains user-passable parameters, they can also be passed through the command line.

```bash
$ npm init midway -- --bbb=ccc
```

If the parameter name is the same as the parameter of the tool, you can use the parameter of `t_`, which will be automatically processed when the tool is passed to the scaffold.

```bash
$ npm init midway -- --type=koa-v4 --t_type=ccc
```



## Write scaffolding

Midway scaffolding uses the self-developed light-generator tool. For specific usage, please refer to [https://github.com/midwayjs/light-generator](https://github.com/midwayjs/light-generator).

You can also refer to Midway's own [template project](https://github.com/midwayjs/midway-boilerplate).
