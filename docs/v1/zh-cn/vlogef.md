---
title: Docker 中进程过多
---

在 Docker 中部署，由于 egg 体系会根据 cpu 核数来启动进程，而 Docker 中获取的 cpu 数是错误的，就会导致启动非常多的 worker 进程。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588996147772-bb5c173c-e6bf-4412-af85-933ccc70b79d.png#align=left&display=inline&height=2474&margin=%5Bobject%20Object%5D&name=image.png&originHeight=2474&originWidth=4760&size=1722162&status=done&style=none&width=4760" width="4760" />

解决方法为修改 workers 数量。

参考：[https://github.com/eggjs/egg/issues/1431](https://github.com/eggjs/egg/issues/1431)
