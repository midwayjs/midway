---
title: 阿里云发布 FAQ
---

## 包大小问题

为了提升启动速度，阿里云 FC 容器限制压缩包大小为 50M，请尽可能精简你的后端代码依赖。

一般来说，midway 默认脚手架（eggjs）构建完在 9M 左右，其他框架会更小，请尝试先删除 `package-lock.json` 后再尝试。

## 容器时区问题

> 大部分 Docker  镜像都是基于 Alpine，Ubuntu，Debian，CentOS 等基础镜像制作而成。 基本上都采用 UTC 时间，默认时区为零时区。

阿里云容器环境的时区默认是 `GMT +0000` ，直接使用 `new Date()`  等前端获取的时候，国内的用户可能未作时区处理，会相差 8 个小时。

国内用户使用，默认可能习惯 `GMT +0800` 。可以通过环境变量调整（配置在平台或者 f.yml）。

```json
process.env.TZ = 'Asia/Shanghai';
```

```yaml
provider:
  name: aliyun
  runtime: nodejs12
	environment:
  	TZ: 'Asia/Shanghai'
```

:::info
注意，定时任务由网关触发，不会受到这里配置的函数时区影响。
:::

## 修改 AccessKey

有时候，我们在第一次发布时会填错一个 accessKey，或者其他区域选项，我们提供了一个 可以修改的参数，用于在发布时清理上次错误的选项。

```bash
midway-bin deploy --resetConfig
```

如果只希望调整特定字段，可以进入 `~/.fcli/config.yaml`  文件中，直接修改保存。

## CLI 发布红色提示

在 HTTP 触发器发布后，会出现下面的红色提示。这是**一个提示**，原因为，未配置域名的情况下，阿里云将默认添加 `Content-Disposition: attachment` 头到响应中，浏览器打开地址会变为附件下载。可以通过绑定自定义域名或者本地 curl 的方式来测试结果。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1587036400388-b2ebe43f-fa7d-463b-b9b6-b38bf9e18430.png#height=268&id=H2BJz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=268&originWidth=958&originalType=binary&ratio=1&size=242934&status=done&style=none&width=958" width="958" />

## HTTP 函数绑定自定义域名

阿里云的 http 函数绑定自定义域名的菜单就在左侧函数下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753540328-1198bf42-6b57-4062-8e7b-ba4a9cc5ec0b.png#height=572&id=f9LRZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=572&originWidth=1185&originalType=binary&ratio=1&size=64810&status=done&style=none&width=1185" width="1185" />

阿里云绑定域名会检测实名，备案等，请提前准备。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753614297-b391fe03-2fef-4d8d-a065-ce7322016085.png#height=887&id=ZndLt&margin=%5Bobject%20Object%5D&name=image.png&originHeight=887&originWidth=880&originalType=binary&ratio=1&size=72499&status=done&style=none&width=880" width="880" />

## 发布时指定 accessKey 等

```bash
export REGION=cn-beijing
export ACCOUNT_ID=xxx
export ACCESS_KEY_ID=xxx
export ACCESS_KEY_SECRET=xxx
```

当前阿里云发布使用的是 funcraft 工具，可以使用 funcraft 的环境变量，可以加载启动的命令行前，也可以使用 yml 的变量填充方式。

## 发布时超时问题

有时候包比较大， `midway-bin deploy`  上传可能会碰到超时的问题，这个超时时间是 funcraft 工具内部控制的。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1598423950078-15838cbb-95f3-41f9-94ac-a31741b111d3.png#height=179&id=EOCLm&margin=%5Bobject%20Object%5D&name=image.png&originHeight=358&originWidth=2784&originalType=binary&ratio=1&size=310195&status=done&style=none&width=1392" width="1392" />

解决方案： `~/.fcli/config.yaml`  里面配置 timeout，单位是 s（秒）。

一般来说，midway 默认脚手架（eggjs）构建完在 9M 左右，其他框架会更小，请尝试先删除 `package-lock.json` 后再尝试。

如无效果，确实是包过大，可以修改 fun 工具的部署时间，位置为 `~/.fcli/config.yaml` ，在其中增加 timeout 字段。

示例如下：

```typescript
endpoint: ***************
api_version: '2016-08-15'
access_key_id: ***************
access_key_secret: ***************
security_token: ''
debug: false
timeout: 50      ## 部署超时时间，单位为 s
retries: 3

```
