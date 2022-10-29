---
slug: jest_update
title: Jest v29 更新
authors: [harry]
tags: [更新, jest]
---

最近由于 axios 组件的升级，会出现下面的报错。

原因为脚手架自带的 jest v26 不支持 package.json 中的 `exports` 逻辑。

解决方法：

- 1、将 `package.json` 中的 jest 版本从 v26 更新为 v29
- 2、将 `@midwayjs/cli` 的版本升级为 `1.3.16` 版本以上，也可以升级到 `2.0`

示例如下：

```json
{
  "devDependencies": {
    "@midwayjs/cli": "^2.0.1",
    "@types/jest": "^29.2.0",
    "jest": "^29.2.2",
    "ts-jest": "^29.0.3",
    // ...
  }
}
```
