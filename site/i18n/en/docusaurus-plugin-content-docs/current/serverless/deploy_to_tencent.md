# Publish to Tencent Cloud SCF

## Configuration

Make sure it is `tencent` at the `provider` paragraph of `f.yml` in the project root directory.

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
```

Configuration runtime

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  runtime: nodejs12
```

Configuration function timeout

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  Timeout: 60 # Unit Seconds
```

Multiplex HTTP gateway

Tencent Cloud will create a new gateway binding every time HTTP type is deployed. For development, we can reuse the same id

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  serviceId: ********
```

For more information, see [DIP](deploy_tencent_faq#NGqUs).

## Deployment

Run `npm run deploy`. The Deploy command is automatically packaged and released by calling the official deployment tool of Tencent Cloud.

The video flow is as follows:

[屏幕录制 2021-03-25 下午 4.47.41.mov](https://www.yuque.com/attachments/yuque/0/2021/mov/501408/1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fmov%2F501408%2F1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov%22%2C%22name%22%3A%22%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B62021-03-25+%E4%B8%8B%E5%8D%884.47.41.mov%22%2C%22size%22%3A19344722%2C%22type%22%3A%22video%2Fquicktime%22%2C%22ext%22%3A%22mov%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221616730664011-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22dWRP5%22%2C%22card%22%3A%22file%22%7D)


## Frequently Asked Questions

For more information, see [Tencent Cloud release FAQ](deploy_tencent_faq).
