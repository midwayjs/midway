## AntiSpider 反爬虫组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用反爬组件

### Usage

1. 安装依赖
```shell
tnpm i @midwayjs/anti-spider --save
```


### 配置
```ts
export const antiSpider = {
  cookie: true;
  ip: true;
  ua: false;
  picVerCode: true; // 图片验证码
}
```
