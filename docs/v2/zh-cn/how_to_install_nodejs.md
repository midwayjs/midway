---
title: 如何安装 Node.js 环境
---

## 使用场景

一般来说，直接从 [Node.js 官网](https://link.zhihu.com/?target=https%3A//nodejs.org/)下载对应的安装包，即可完成环境配置。
但在**本地开发**的时候，经常需要快速更新或切换版本。
社区有 [nvm](https://link.zhihu.com/?target=https%3A//github.com/creationix/nvm)、[n](https://link.zhihu.com/?target=https%3A//github.com/tj/n) 等方案，我们推荐跨平台的 [nvs](https://link.zhihu.com/?target=https%3A//github.com/jasongin/nvs)。

- nvs 是跨平台的。
- nvs 是基于 Node 编写的，我们可以参与维护。

> 友情提示：Node 6.x 和 8.x 都将在今年结束 LTS 的支持，请尽快升级到 10.x 。
> [https://github.com/nodejs/Release](https://link.zhihu.com/?target=https%3A//github.com/nodejs/Release)

**PS：nvs 我们一般只用于本地开发，线上参见：**[科普文：运维不给升级 Node 版本怎么办？](https://zhuanlan.zhihu.com/p/39226941)

---

## 如何安装

### Linux / macOS 环境

通过 Git Clone 对应的项目即可。

```
$ export NVS_HOME="$HOME/.nvs"
$ git clone https://github.com/jasongin/nvs --depth=1 "$NVS_HOME"
$ . "$NVS_HOME/nvs.sh" install
```

### Windows 环境

由于 Windows 环境配置比较复杂，所以还是推荐使用 `msi` 文件完成初始化工作。
访问 [nvs/releases](https://link.zhihu.com/?target=https%3A//github.com/jasongin/nvs/releases) 下载最新版本的 `nvs.msi`，然后双击安装即可。

---

## 配置镜像地址

在国内由于大家都懂的原因，需要把对应的镜像地址修改下：

```
$ nvs remote node https://npm.taobao.org/mirrors/node/
$ nvs remote
default             node
chakracore          https://github.com/nodejs/node-chakracore/releases/
chakracore-nightly  https://nodejs.org/download/chakracore-nightly/
nightly             https://nodejs.org/download/nightly/
node                https://nodejs.org/dist/
```

---

## 使用指南

通过以下命令，即可非常简单的安装 Node.js 最新的 LTS 版本。

```bash
# 安装最新的 LTS 版本
$ nvs add lts
# 配置为默认版本
$ nvs link lts
```

安装其他版本：

```bash
# 安装其他版本尝尝鲜
$ nvs add 12
# 查看已安装的版本
$ nvs ls
# 在当前 Shell 切换版本
$ nvs use 12
```

更多指令参见 `nvs --help` 。

---

## 共用 npm 全局模块

使用 `nvs` 时，默认的 `prefix` 是当前激活的 Node.js 版本的安装路径。
带来一个问题是：切换版本之后，之前安装全局命令模块需要重新安装，非常不方便。
解决方案是配置统一的全局模块安装路径到 `~/.npm-global`，如下：

```bash
$ mkdir -p ~/.npm-global
$ npm config set prefix ~/.npm-global
```

还需配置环境变量到 `~/.bashrc` 或 `~/.zshrc` 文件里面：

```bash
$ echo "export PATH=~/.npm-global/bin:$PATH" >> ~/.zshrc
$ source ~/.zshrc
```

---

## 相关阅读

- [科普文：Node.js 安全攻防 - 如何伪造和获取用户真实 IP ？](https://zhuanlan.zhihu.com/p/62265144)
- [科普文：运维不给升级 Node 版本怎么办？](https://zhuanlan.zhihu.com/p/39226941)
- [科普文：为什么不能在服务器上 npm install ？](https://zhuanlan.zhihu.com/p/39209596)
