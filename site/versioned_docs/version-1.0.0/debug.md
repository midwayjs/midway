---
title: Debug
---

一个更简单的 Debug 方案，新版本 VSCode 已经支持了 autoAttach。
第一步，vsc 里按 cmd+shift+p，开启 auto attach。

[
<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1598343869968-12f6eb2c-a38d-4670-9bc9-dac94f672bcc.png#align=left&display=inline&height=171&margin=%5Bobject%20Object%5D&originHeight=171&originWidth=869&size=0&status=done&style=none&width=869" width="869" />
](https://user-images.githubusercontent.com/418820/83840648-b92a1380-a731-11ea-844e-cbbbfbe52720.png)

第二步，修改，或者新增命令，其实就是在原来的命令后面传入调试参数。

```
"test": "npm run lint && midway-bin test --ts --inspect",
```

第三步，加入断点，在 vsc 的控制台（一定要在 vsc 里启动）执行命令，比如上面的 npm run test 即可断到。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1598343902763-e4ed8e5c-2dbc-48bb-a9f0-fd3cc2105c53.png#align=left&display=inline&height=2740&margin=%5Bobject%20Object%5D&name=image.png&originHeight=2740&originWidth=3378&size=1202444&status=done&style=none&width=3378" width="3378" />
