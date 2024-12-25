# About the slow start of Midway

Midway will use ts-node to scan and require modules in real time when developing locally. If there are too many ts files (such as 200 +), it may lead to slower startup, especially in the case of non-SSD hard disks under Windows, resulting in frequent fullGC of Server for ts-node type checking, and each file load may reach 1-2s.

Generally, Mac is SSD, so there is basically no problem, but Windows will appear, and there will be no such problem after construction.

As shown in the following figure.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523014939-40121f9c-bc19-4f9e-a7e6-e744d409a9ea.png)

## How to judge

1. Clean up the ts-node cache first.

There is a directory of `ts-node-*` in the temporary directory, which can be deleted (if you do not know the temporary directory, you can execute the `require('OS').tmpdir()` output view on the command line).

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523402032-7e9c162a-762e-4cba-82b4-8ae63fe37280.png)

Deleted the following similar directory.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523340452-7924affe-96b5-4544-85b7-e41ace4206e8.png)

2. Start Midway with ts-node

Execute the following startup command.

```bash
// midway v1
cross-env DEBUG=midway* NODE_ENV=local midway-bin dev --ts

// midway v2
cross-env NODE_DEBUG=midway* NODE_ENV=local midway-bin dev --ts
```

The require duration of each file will appear, if the time is relatively long.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1601523470970-1812326a-39d9-4b39-af57-7723f80f6e17.png)

## Solve the problem

Since a Server will be started inside `TS_NODE_TYPE_CHECK`, when there are many special files, the type check will be done every require. If it causes serious startup impact, it is recommended to close it. **The cost is that the type check is not performed at the start of the runtime. Because there is a prompt in the editor, the check is not performed at the runtime.**

Add the following two environment variables before executing the command.

```bash
TS_NODE_TYPE_CHECK=false TS_NODE_TRANSPILE_ONLY=true
```

For example:

```json
cross-env TS_NODE_TYPE_CHECK=false TS_NODE_TRANSPILE_ONLY=true NODE_DEBUG=midway* NODE_ENV=local midway-bin dev --ts
```

The following is the comparison effect of using the same items.

|              | First execution (no cache) | Second execution (with cache) |
| ------------ | -------------------- | -------------------- |
| No optimization parameters | About 258s | about 5.6s |
| Add optimization parameters | About 15s | About 4.7s |
|              |                      |                      |

## Other

If you have any questions, please submit your warehouse + node_modules to us.
