---
title: 发布到阿里云 FC
---

## 配置

在项目根目录的 `f.yml` 的 `provider` 段落处确保为 `aliyun` 。

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun
```

## 部署

部署函数，直接使用发布命令即可打包并部署函数，Deploy 命令会自动打包，并调用阿里云官方部署工具发布。

```shell
$ npm run deploy
```

:::info
如果输错了信息，可以重新执行 `npx midway-bin deploy --resetConfig` 修改。
:::

阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png#align=left&display=inline&height=514&margin=%5Bobject%20Object%5D&originHeight=514&originWidth=1152&size=0&status=done&style=none&width=1152" width="1152" />

相关配置获取，可参照下方图片：

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png#align=left&display=inline&height=696&margin=%5Bobject%20Object%5D&originHeight=696&originWidth=1832&size=0&status=done&style=none&width=1832" width="1832" />

点击此处跳转阿里云[安全设置页](https://account.console.aliyun.com/#/secure)。

---

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png#align=left&display=inline&height=184&margin=%5Bobject%20Object%5D&originHeight=592&originWidth=2406&size=0&status=done&style=none&width=746" width="746" />

点击跳转阿里云个人 [AccessKey 页面](https://usercenter.console.aliyun.com/#/manage/ak)。

发布后，阿里云会输出一个临时可用的域名，打开浏览器访问即可。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#align=left&display=inline&height=193&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&size=35152&status=done&style=none&width=1219" width="1219" />

## 常见问题

请查询 [阿里云发布 FAQ](/docs/deploy_aliyun_faq)。
