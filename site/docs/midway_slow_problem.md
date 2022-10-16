# 关于 Midway 启动慢的问题

Midway 在本地开发时会使用 ts-node 实时扫描并 require 模块，如果 ts 文件太多（比如 200+）个，启动时可能会导致比较慢，在 Windows 下非 SSD 硬盘的情况下特别明显，导致 ts-node 的类型检查的 Server 频繁 fullGC，每个文件加载可能会达到 1-2s。

一般 Mac 都是 SSD，所以基本没有问题，而 Windows 会有出现，构建后执行无此问题。

如下图所示。

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523014939-40121f9c-bc19-4f9e-a7e6-e744d409a9ea.png)

## 如何判断

1、先清理下 ts-node 缓存。

在临时目录中有一个 `ts-node-*` 的目录，删除即可（不知道临时目录的可以在命令行执行 `require('os').tmpdir()` 输出查看）。

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523402032-7e9c162a-762e-4cba-82b4-8ae63fe37280.png)

删了下面类似的这个目录。

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523340452-7924affe-96b5-4544-85b7-e41ace4206e8.png)

2、用 ts-node 启动 Midway

执行下面的启动命令。

```bash
// midway v1
cross-env DEBUG=midway* NODE_ENV=local midway-bin dev --ts

// midway v2
cross-env NODE_DEBUG=midway* NODE_ENV=local midway-bin dev --ts
```

会出现每个文件的 require 时长，如果时间比较久一般就是了。

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523470970-1812326a-39d9-4b39-af57-7723f80f6e17.png)

## 解决问题

由于 `TS_NODE_TYPE_CHECK` 内部会启动一个 Server，在文件特别的多的情况下，每次 require 都会做类型检查，如果造成严重启动影响，建议关闭。**代价是启动运行时不会做类型校验，由于一般在编辑器里已经有提示，运行时不再做检查也可以。**

在执行命令前增加下面两个环境变量。

```bash
TS_NODE_TYPE_CHECK=false TS_NODE_TRANSPILE_ONLY=true
```

比如：

```json
cross-env TS_NODE_TYPE_CHECK=false TS_NODE_TRANSPILE_ONLY=true NODE_DEBUG=midway* NODE_ENV=local midway-bin dev --ts
```

下面是使用相同的项目的对比效果。

|              | 第一次执行（无缓存） | 第二次执行（有缓存） |
| ------------ | -------------------- | -------------------- |
| 不加优化参数 | 约 258s              | 约 5.6s              |
| 加优化参数   | 约 15s               | 约 4.7s              |
|              |                      |                      |

## 其他

如果任有问题，请提交你的仓库 + node_modules 给我们。
