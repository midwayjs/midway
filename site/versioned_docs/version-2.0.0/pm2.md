---
title: 使用 pm2
---

[PM2](https://github.com/Unitech/pm2) 是带有内置负载平衡器的 Node.js 应用程序的生产过程管理器。可以利用它来简化很多 Node 应用管理的繁琐任务，如性能监控、自动重启、负载均衡等。

## 安装

我们一般会把 pm2 安装到全局。

```bash
$ npm install pm2 -g    # 命令行安装 pm2
```

## 常用命令

```bash
$ pm2 start   	# 启动一个服务
$ pm2 list    	# 列出当前的服务
$ pm2 stop			# 停止某个服务
$ pm2 restart		# 重启某个服务
$ pm2 delete		# 删除某个服务
$ pm2 logs			# 查看服务的输出日志
```

比如， `pm2 list` ，就会以表格显示。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616560437389-b193a0d0-b463-49f1-a347-8dec20e7504d.png#align=left&display=inline&height=310&margin=%5Bobject%20Object%5D&name=image.png&originHeight=310&originWidth=1065&size=165090&status=done&style=none&width=1065" width="1065" />

pm2 的服务都有一个数组 id，你可以用 id 快速操作它。

比如：

```bash
$ pm2 stop 1			# 停止编号为 1 的服务
$ pm2 delete 1		# 删除编号为 1 的服务
```

使用 `--name`  参数添加一个应用名。

```bash
$ pm2 start ./bootstrap.js --name test_app
```

然后你可以用这个应用名来操作启停。

```bash
$ pm2 stop test_app
$ pm2 restart test_app
```

## 启动应用

Midway 应用一般使用 `npm run start`  做线上部署。其对应的命令为 `NODE_ENV=production node bootstrap.js` 。

:::info
部署前需要执行编译 npm run build
:::

对应的 pm2 命令为

```bash
$ NODE_ENV=production pm2 start ./bootstrap.js --name midway_app -i 4
```

- --name 用于指定应用名
- -i 用于指定启动的实例数（进程），会使用 cluster 模式启动

效果如下：

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616562075255-088155ee-7c4f-4eae-b5c5-db826f78b519.png#align=left&display=inline&height=189&margin=%5Bobject%20Object%5D&name=image.png&originHeight=189&originWidth=1008&size=48357&status=done&style=none&width=1008" width="1008" />

## Docker 容器启动

在 Docker 容器中，后台启动的代码都会被退出，达不到预期效果。pm2 使用另一个命令来支持容器启动。

请将命令修改为 pm2-runtime start 。

```bash
$ NODE_ENV=production pm2-runtime start ./bootstrap.js --name midway_app -i 4
```

具体的 pm2 行为请参考 [pm2 容器部署说明](https://www.npmjs.com/package/pm2#container-support)。
