---
title: 发布到腾讯云 SCF
---

## 配置

在项目根目录的 `f.yml`  的 `provider`  段落处确保为 `tencent` 。

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
```

配置运行时

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  runtime: nodejs12
```

配置函数超时

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  timeout: 60 # 单位秒
```

复用 HTTP 网关

腾讯云在每次部署 HTTP 类型时，都会创建一个新的网关绑定，对于开发时，我们可以复用同一个 id

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  serviceId: ********
```

具体写法可以参考 [复用网关 id](deploy_tencent_faq#NGqUs)。

## 部署

执行 `npm run deploy`  即可，Deploy 命令会自动打包，并调用腾讯云官方部署工具发布。

视频流程如下：

[屏幕录制 2021-03-25 下午 4.47.41.mov](https://www.yuque.com/attachments/yuque/0/2021/mov/501408/1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fmov%2F501408%2F1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov%22%2C%22name%22%3A%22%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B62021-03-25+%E4%B8%8B%E5%8D%884.47.41.mov%22%2C%22size%22%3A19344722%2C%22type%22%3A%22video%2Fquicktime%22%2C%22ext%22%3A%22mov%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221616730664011-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22dWRP5%22%2C%22card%22%3A%22file%22%7D)

## 常见问题

请查询 [腾讯云发布 FAQ](deploy_tencent_faq)。
