---
title: 腾讯云发布 FAQ
---

## 用户鉴权

腾讯云在部署时，如果是首次部署，则控制台会展示相应二维码，扫码即可完成认证，单项目后续会默认复用该配置。

鉴权文件保存在部署的根目录下的 `.env`   文件，如果要修改，可以删除该文件重新扫码。

也可以修改其中的内容，格式如下：

```
TENCENT_APP_ID=xxxxxx     #授权账号的 AppId
TENCENT_SECRET_ID=xxxxxx  #授权账号的 SecretId
TENCENT_SECRET_KEY=xxxxxx #授权账号的 SecretKey
TENCENT_TOKEN=xxxxx       #临时 token
```

如果需要使用子账号发布，请查询 [子账号权限配置文档](https://cloud.tencent.com/document/product/1154/43006)。

##

## 发布区域切换

腾讯云配置支持发布到不同的区域。

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  region: ap-shanghai
```

常见的 region 值有：

- ap-shanghai 上海
- ap-guangzhou 广州
- ap-beijing 北京
- ap-hongkong 香港

​

完整的地区列表请查看 [腾讯云文档](https://cloud.tencent.com/document/api/583/17238)。

##

## 复用 API 网关

如果正式发布 HTTP 函数，每发布一次腾讯云都将自动创建一个标识网关的 serviceId，长期就会出现很多个，为了每次能复用，在第一次发布后，记录下 serviceId 让后面的代码复用，是比较好的习惯（或者提前申请好网关）。

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  serviceId: service-xxxxxx # <---- 把 id 填在这里复用
```

**获取 API 网关 id**

方式一，从平台获取。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752561344-c520ce4d-8dba-4e88-99c6-744e5af73cb9.png#height=577&id=nPqm4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=577&originWidth=1173&originalType=binary&size=72901&status=done&style=none&width=1173" width="1173" />

方式二，在每次发布后获取。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752629863-178fd9db-7dcb-496e-af05-1fc68abfb30f.png#height=115&id=iBgEU&margin=%5Bobject%20Object%5D&name=image.png&originHeight=115&originWidth=746&originalType=binary&size=39588&status=done&style=none&width=746" width="746" />

## 绑定域名

腾讯云发布后会自动给一个网关地址来访问云函数，比如 `http://service-xxxxx-xxxxxxxx.gz.apigw.tencentcs.com:80` ，同时针对环境，会自动映射三套环境名，加载 path 上。

- 测试环境 /test
- 预发 /prepub
- 线上 /release

在函数的触发管理和 API 网关处都可以看到这个地址。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752924557-d0eb153e-f583-49c2-b9a4-55e417867b43.png#height=421&id=cPfTl&margin=%5Bobject%20Object%5D&name=image.png&originHeight=578&originWidth=1025&originalType=binary&size=49631&status=done&style=none&width=746" width="746" />

网关处。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752972052-c2f7fbc8-0725-49e0-ab73-5dec6a7c0c00.png#height=732&id=Qw18W&margin=%5Bobject%20Object%5D&name=image.png&originHeight=732&originWidth=3010&originalType=binary&size=238685&status=done&style=none&width=3010" width="3010" />

如果我们想移除这个环境，那么就得绑定自定义域名。

在 API 网关的自定义域名处，点“新建”。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753063041-496d876f-3457-47cb-8156-c9e8364e91db.png#height=338&id=mIiB5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=338&originWidth=1096&originalType=binary&size=26777&status=done&style=none&width=1096" width="1096" />

配置自定义路径映射，比如将 `/`  映射到正式的发布环境，这样在用域名访问的时候，就不会带有环境后缀了。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753124170-9e6a2b01-dad8-47df-9d81-294d8397137b.png#height=607&id=FAbTy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=607&originWidth=904&originalType=binary&size=49449&status=done&style=none&width=904" width="904" />

## 额外计费

使用本地工具时，由于使用了腾讯云提供的 SDK，可能会创建一个 COS Bucket 用于代码包的存储，由于 COS 是付费使用，会产生一定的费用费用。请及时关注自己的 COS 情况避免扣费。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1606803155279-51e71ffa-6e9a-4ab9-812b-19003d45483c.png#height=460&id=DRD5n&margin=%5Bobject%20Object%5D&name=image.png&originHeight=460&originWidth=1196&originalType=binary&size=60856&status=done&style=none&width=1196" width="1196" />

## **删除腾讯云网关服务**

在试玩一段时间的腾讯云服务之后，由于不是每次复用 API 网关，会导致出现很多非重用的网关示例，如下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749300990-34089754-5fe2-4fb9-942a-0f9f0abc6984.png#height=1226&id=Jo9cX&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1226&originWidth=2778&originalType=binary&size=261243&status=done&style=none&width=2778" width="2778" />

这个时候由于网关有绑定的函数，删除按钮是灰色的，我们需要手动将资源一一删除。

先进入一个 API 网关实例。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749368951-da40aa66-249f-46ac-b208-e7085952c528.png#height=361&id=fA0yx&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1946&originalType=binary&size=134710&status=done&style=none&width=746" width="746" />

进入管理 API，删除底下的通用 API。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749549259-fd35cfa1-9e00-42a3-82ff-78f3de23dd85.png#height=930&id=iTseJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=930&originWidth=2346&originalType=binary&size=122962&status=done&style=none&width=2346" width="2346" />

进入环境管理，将环境下线。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749641386-77ddf012-2b29-46a5-a8dc-6d416d07518e.png#height=770&id=lAclZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=770&originWidth=2234&originalType=binary&size=134714&status=done&style=none&width=2234" width="2234" />

再回到最开始的列表，就可以点删除了。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749709595-1c47d6e3-08af-42e1-be34-961409f82e1a.png#height=986&id=ZpugG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=986&originWidth=2342&originalType=binary&size=182531&status=done&style=none&width=2342" width="2342" />
