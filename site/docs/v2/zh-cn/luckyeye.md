---
title: 检查工具
---

Midway 为常见的错误提供了一些检查工具，以方便用户快速排错。`@midwayjs/luckyeye`  包提供了一些基础的检查规则，配合 Midway 新版本可以快速排查问题。

> luckyeye，寓意为幸运眼，能快速发现和定位问题。

## 使用

首先安装 `@midwayjs/luckyeye`  包。

```bash
npm i @midwayjs/luckyeye --save-dev
```

一般情况下，我们会将它加入到一个检查脚本中，比如：

```json
"scripts": {
  // ......
  "check": "luckyeye"
},
```

接下去，我们需要配置“规则包”，比如 `midway_v2`  就是针对 midway v2 版本的规则检查包。

在 `package.json`  中加入下面的段落。

```json
"midway-luckyeye": {
  "packages": [
    "midway_v2"
  ]
},
```

## 执行

配置完后，可以执行上面添加的检查脚本。

```bash
npm run check
```

**蓝色**代表输出的信息，用于排错，**绿色**代表检查项通过，**红色**代表检查项有问题，需要修改，**黄色**代表检查项可以做修改，但是可选。

执行效果如下。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1610983986151-79c54e7c-3ff0-4f94-98bc-359dda0fa694.png#align=left&display=inline&height=464&margin=%5Bobject%20Object%5D&name=image.png&originHeight=928&originWidth=1234&size=155051&status=done&style=none&width=617" width="617" />

## 自定义规则包

请参考 [https://github.com/midwayjs/luckyeye](https://github.com/midwayjs/luckyeye) 的 README。
