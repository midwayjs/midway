---
title: 接入 Prometheus
---

Prometheus（普罗米修斯）是一个最初在 SoundCloud 上构建的监控系统。 自 2012 年成为社区开源项目，拥有非常活跃的开发人员和用户社区。为强调开源及独立维护，Prometheus 于 2016 年加入云原生云计算基金会（CNCF），成为继 Kubernetes 之后的第二个托管项目。

Grafana 是一个开源的度量分析与可视化套件。纯 Javascript 开发的前端工具，通过访问库（如 InfluxDB），展示自定义报表、显示图表等。Grafana 支持许多不同的数据源。每个数据源都有一个特定的查询编辑器,该编辑器定制的特性和功能是公开的特定数据来源。而 Prometheus 正好是其支持的数据源之一。

本篇介绍了 Midway 如何接入 Grafana + Prometheus。

接入效果如下：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617259935548-a2df4339-3229-4391-bd3d-4ba8e6979d4d.png#height=498&id=KoiiE&margin=%5Bobject%20Object%5D&name=image.png&originHeight=996&originWidth=1914&originalType=binary&ratio=1&size=969345&status=done&style=none&width=957" width="957" />

## 安装组件

首先安装 Midway 提供的指标监控组件：

```bash
$ npm install @midwayjs/prometheus -S
```

在 `configuration.ts`  中，引入这个组件：

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as prometheus from '@midwayjs/prometheus'; // 导入模块
import { join } from 'path';

@Configuration({
  imports: [prometheus], // 引入模块
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {}
```

启动我们的应用，此时访问的时候多了一个 `${host}:${port}/metrics`  。

:::info
Prometheus 基于 HTTP 获取监控数据，请加载 web/koa/express 任一框架，并使用多框架模式启动。
:::

访问接口，返回如下，里面的内容是当前的指标。

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617260048533-4f725824-9471-40c9-be8b-6dcbf27d9cca.png#height=997&id=DIl0G&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1994&originWidth=2276&originalType=binary&ratio=1&size=1070956&status=done&style=none&width=1138" width="1138" />

## 其他配置

指标组件也提供了相关的配置，方便开发者进行配置。

可以在 `config.default.ts`  中，修改 prometheus 的配置。

```typescript
import { DefaultConfig } from '@midwayjs/prometheus';

export const prometheus: DefaultConfig = {
  labels: {
    APP_NAME: 'demo_project',
  },
};
```

更多的配置，我们可以查看 `DefaultConfig`  这个定义进行配置。

通过配置，我们例如可以归类哪些 node 是同一个应用，因为我们部署的时候，node 程序是分布式的。例如上面我们加了 APP_NAME，用来区分不同的应用，这样在监控指标中，我们可以区分不同的应用。

## 数据采集

我们前面在 Midway 中引入的组件主要是在 Node 中加了指标模块。接下来我们需要让 Prometheus 来采集我们的指标数据。

如果开发者所在部门已经有 Prometheus+grafana 了，则只需将应用的指标地址上报给 PE 或者通过接口上报即可。此处我们假设大家没有 Prometheus+grafana，然后按照下面描述进行操作。

## 搭建 Prometheus

此处我们通过 docker-compose 来搭建 Prometheus， docker-compose.yml  文件如下：

```yaml
version: '2.2'
services:
  tapi:
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'
    image: prom/prometheus
    restart: always
    volumes:
      - ./prometheus_data:/prometheus_data:rw
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./targets.json:/etc/prometheus/targets.json
    command:
      - '--storage.tsdb.path=/prometheus_data'
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention=10d'
      - '--web.enable-lifecycle'
    ports:
      - '9090:9090'
```

`prometheus.yml`   文件如下：

```yaml
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
scrape_configs:
  - job_name: 'node'
    file_sd_configs:
      - refresh_interval: 1m
        files:
          - '/etc/prometheus/targets.json'
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

然后采集的 `targets.json`   如下：下面文件里面 `${ip}`   替换为 Node.js 应用所在服务器的 ip 地址。

```json
[
  {
    "targets": ["${ip}:7001"],
    "labels": {
      "env": "prod",
      "job": "api"
    }
  }
]
```

​

然后我们启动 `docker-compose.yml`   文件，

```bash
$ docker-compose up
```

至此，Prometheus 已经会去拉取我们 Node 应用程序的指标数据了。

如果想要更新 target 怎么做：
修改了这个 targets.json 文件后，通过 prometheus 的 reload 方法进行热加载。
方法如下：

```typescript
curl -X POST http://${prometheus的ip}:9090/-/reload
```

然后我们可以查看 prometheus 的页面也可以确认是否生效，界面地址：

```typescript
http://${prometheus的ip}:9090/classic/targets
```

接下来就是如何展示这些采集到的数据了。

## 数据展示

我们可以借助 Grafana 来展示我们的数据。

此处我们简单通过 Docker 来搭建一下 Grafana：

```bash
$ docker run -d --name=grafana -p 3000:3000 grafana/grafana
```

然后我们访问 127.0.0.1:3000，默认账号密码：admin:admin。
然后访问后如下效果：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617260561047-c2643a69-6258-491b-937d-9bfc4558252f.png#height=346&id=yNdWZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=692&originWidth=1496&originalType=binary&ratio=1&size=551202&status=done&style=none&width=748" width="748" />

然后我们让 Grafana 接入我们的 Prometheus 数据源：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617260581029-1e2e06a8-3054-4ad8-96b5-d50ab9bb1612.png#height=286&id=atAvT&margin=%5Bobject%20Object%5D&name=image.png&originHeight=572&originWidth=1490&originalType=binary&ratio=1&size=169944&status=done&style=none&width=745" width="745" />

然后我们点击 Grafana 添加图表：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1620725466020-28793a78-c03b-48fa-bf16-0c9c8ecc1a94.png#clientId=u070308fc-4e5d-4&from=paste&height=741&id=uce167575&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1482&originWidth=2626&originalType=binary&ratio=1&size=310590&status=done&style=none&taskId=uedd61eb7-8e61-488f-963f-f70adb9a651&width=1313" width="1313" />

这边 ID 选择 14403，然后点击 load，然后点击下一步，然后点击 import 后，就能看到我们刚刚接入的效果了。

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1620725497338-a32a8982-d51f-4e74-b511-dc10a7c66d80.png#clientId=u070308fc-4e5d-4&from=paste&height=996&id=uba6ac1f0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1992&originWidth=3836&originalType=binary&ratio=1&size=1951604&status=done&style=none&taskId=ua7c2fc08-0633-4614-9af0-5bf2da800ef&width=1918" width="1918" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1620725514630-4f654f10-ef3a-41f7-b403-02832d3ef7d8.png#clientId=u070308fc-4e5d-4&from=paste&height=998&id=u27a3ae30&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1996&originWidth=3830&originalType=binary&ratio=1&size=2201307&status=done&style=none&taskId=ucee30610-4c1f-4fa8-82fd-a952d5aa9e1&width=1915" width="1915" />

这样开发者可以运维自己的 Node 程序了，例如，是否最近引入了一个 NPM 包导致了什么内存泄漏的情况，是否最近有应用重启的情况了。

当然还能支持其他的自定义操作。
​

## Socket-io 场景

使用方法：

```typescript
npm install @midwayjs/prometheus-socket-io -S
```

使用方法：

```typescript
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as prometheus from '@midwayjs/prometheus';
import * as prometheusSocketIo from '@midwayjs/prometheus-socket-io';

@Configuration({
  imports: [prometheus, prometheusSocketIo],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle {}
```

然后在/metrics 这边就能看到 socket-io 的数据了。

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1631090438583-d925c13c-371a-4037-9f53-edaa34580aab.png#clientId=u24adff00-2245-4&from=paste&height=459&id=u2862ab6b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=918&originWidth=1470&originalType=binary&ratio=1&size=481525&status=done&style=none&taskId=ua4ce06b2-a75d-4e4a-8bd9-c94496dca33&width=735" width="735" />

一共新增 8 个指标。
后续会提供 Grafana 的模版 ID 给大家使用。
​

## 功能介绍

- [x] 根据 appName 进行分类
- [x] 查看不同 path 的 qps 情况
- [x] 查看不同 status 的分布情况
- [x] 查询不同 path 的 rt 情况
- [x] 进程的 CPU 使用情况
- [x] 进程的内存使用情况
- [x] 堆栈情况
- [x] Event Loop
- [ ] 等
