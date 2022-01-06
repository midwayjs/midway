---
title: 接入 Alinode
---

## 准备工作

需要接入的应用是要部署在独立的服务获取云环境，可以接入互联网服务。

## 创建服务

**第一步**

登录阿里云，点击开通 [阿里云的 Node.js 性能平台](https://www.aliyun.com/product/nodejs) 的服务。

**第二步**

创建新应用，获取 APP ID 和 App Secret。
<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617267785895-dd0fb702-91c7-4b25-9c64-8a9358f2d254.png#align=left&display=inline&height=351&margin=%5Bobject%20Object%5D&name=image.png&originHeight=702&originWidth=1548&size=106487&status=done&style=none&width=774" width="774" />

## 安装监控依赖

**第一步**

安装 Node.js 性能平台所需的组件

```bash
# 安装版本管理工具 tnvm，安装过程出错参考：https://github.com/aliyun-node/tnvm
$ wget -O- https://raw.githubusercontent.com/aliyun-node/tnvm/master/install.sh | bash
$ source ~/.bashrc

# tnvm ls-remote alinode 								# 查看需要的版本
$ tnvm install alinode-v6.5.0 					# 安装需要的版本
$ tnvm use alinode-v6.5.0 							# 使用需要的版本

$ npm install @alicloud/agenthub -g 		# 安装 agenthub
```

这里有三个部分

- 1、安装 tnvm（alinode 源）
- 2、使用 tnvm 安装 alinode（替代默认的 node）
- 3、安装 alinode 需要的数据采集器

安装完成后，可以检查一下，需要确保 `which node`  和 `which agenthub` 的路径中包括 `.tnvm` 即可。

```bash
$ which node
/root/.tnvm/versions/alinode/v3.11.4/bin/node

$ which agenthub
/root/.tnvm/versions/alinode/v3.11.4/bin/agenthub
```

将 `创建新应用` 中获得的 `App ID`  和  `App Secret`  按如下所示保存为  `yourconfig.json`。比如放在项目根目录。

```typescript
{
  "appid": "****",
  "secret": "****",
}
```

启动插件：

```typescript
agenthub start yourconfig.json
```

## 启动 node 服务

在安装了服务器中，启动 Node 服务时，需要加入 ENABLE_NODE_LOG=YES 环境变量。

比如：

```bash
$ NODE_ENV=production ENABLE_NODE_LOG=YES node bootstrap.js
```

## Docker 容器的方法

关于 docker 容器的方法可以查看 [文档](https://help.aliyun.com/document_detail/66027.html?spm=a2c4g.11186623.6.580.261ba70feI6mWt)。

## 其他

更多内容可以查看阿里云 Node.js 性能平台的 [文档](https://help.aliyun.com/document_detail/60338.html?spm=a2c4g.11186623.6.548.599312e6IkGO9v)。
