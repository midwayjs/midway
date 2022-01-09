---
title: 常见 TS 问题
---

TS 有很多编译静态检查，比如类型不一致，对象未定义等，默认情况下是最佳的，希望用户合理考虑编码风格和习惯，谨慎开关配置，享受 TS 静态检查带来的好处。

## 依赖包定义错误

如果依赖包和项目本身的 TS 版本不一致，在编译时会出现错误。

可以在 `tsconfig.json`  关闭依赖包的检查。

```typescript
{
  "compilerOptions": {
    "skipLibCheck": true
  },
}
```

## TS2564 初始化未赋值错误

错误如下：

```yaml
error TS2564: Property 'name' has no initializer and is not definitely assigned in the constructor.
```

原因为开启了 TS 的初始化属性检查，如果没有初始化赋值就会报错。

处理方法：

第一种：移除 tsconfig.json 的检查规则

```json
{
  "strictPropertyInitialization": false // 或者移除
}
```

第二种：属性加感叹号

```typescript
export class HomeController {
  @Inject()
  userService!: UserService;
}
```

## TS6133 对象声明未使用错误

错误如下：

```yaml
error TS6133: 'app' is declared but its value is never read.
```

原因为开启了 TS 的对象未使用检查，如果声明了但是没有使用就会报错。
​

处理方法：
​

第一种：移除未定义的变量

第二种：移除 tsconfig.json 的检查规则

```json
{
  "compilerOptions": {
    "noUnusedLocals": false
  }
}
```

​

## tsconfig 中定义 typings 不生效

在 tsconfig.json 中，如果定义了 typeRoots，且定义了 include，如果 include 中不包含 typeRoot 中的内容，则会在 dev/build 时报错。
​

此为 ts/ts-node 的问题，issue 见 [#782](https://github.com/TypeStrong/ts-node/issues/782) [#22217](https://github.com/microsoft/TypeScript/issues/22217)
​

比如：

```json
"typeRoots": [
    "./node_modules/@types",
    "./typings"
  ],
  "include": [
    "src",
    "typings"
  ],
  "exclude": [
    "dist",
    "node_modules"
  ],
```

上述，如果 include 中不写 typings，则会在 dev/build 时找不到定义而报错。
