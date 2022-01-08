---
title: Serverless 触发器 POST 情况差异
---

## 阿里云 API 网关

阿里云 API 网关支持不同类型的的 POST 请求。

### 入参透传的 POST

网关配置如下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593175823751-f9b305fc-ddeb-4b04-ba13-481a616be260.png#height=536&id=R8Ber&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1072&originWidth=1560&originalType=binary&size=138055&status=done&style=none&width=780" width="780" />

网关透传的 event 特征为有 `body` 字段以及 `isBase64Encoded` 为 true，解码比较容易，直接解 base64 即可。

:::info
透传了之后，即为所有的结果交给函数处理。
:::

#### 示例一 (text/html)

下面的 event，是一个最简单的透传示例，因为其中的 `content-type`  为 `text/html` ，所以 body 传递过来 base64 解码的结果也同样是字符串。

```json
{
  "body": "eyJjIjoiYiJ9",
  "headers": {
    "x-ca-dashboard-action": "DEBUG",
    "x-ca-dashboard-uid": "125087",
    "x-ca-stage": "RELEASE",
    "x-ca-dashboard-role": "USER",
    "user-agent": "Apache-HttpClient/4.5.6 (Java/1.8.0_172)",
    "accept-encoding": "gzip,deflate",
    "content-md5": "Kry+hjKjc2lvIrwoJqdY9Q==",
    "content-type": "text/html; charset=utf-8"
  },
  "httpMethod": "POST",
  "isBase64Encoded": true,
  "path": "/api/321",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

函数结果。

```typescript
ctx.request.body; // '{"c":"b"}'   => string
```

#### 示例二（application/json)

使用 `content-type`  为 `application/json` ，这样框架认为是一个 JSON，会自动被 JSON.parse。

```json
{
  "body": "eyJjIjoiYiJ9",
  "headers": {
    "X-Ca-Dashboard-Action": "DEBUG",
    "X-Ca-Dashboard-Uid": "125087",
    "X-Ca-Stage": "RELEASE",
    "X-Ca-Dashboard-Role": "USER",
    "User-Agent": "Apache-HttpClient/4.5.6 (Java/1.8.0_172)",
    "Accept-Encoding": "gzip,deflate",
    "Content-MD5": "Kry+hjKjc2lvIrwoJqdY9Q==",
    "Content-Type": "application/json; charset=utf-8"
  },
  "httpMethod": "POST",
  "isBase64Encoded": true,
  "path": "/api/321",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

函数结果。

```typescript
ctx.request.body; // {"c":"b"}   => object
```

#### 示例三 (application/x-www-form-urlencoded)

使用 `content-type`  为 `application/x-www-form-urlencoded` ，这个时候网关不会以 base64 格式透传，这也是前端原生表单的默认提交类型。

:::info
在 API 网关侧测试，保持“入参透传”下，似乎没有效果，于是我换到了 Postman 进行测试。
:::

Postman 模拟请求如下：

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593188653464-2a5659de-40ad-4611-ba86-f5754c7d4425.png#height=684&id=hkVhi&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1368&originWidth=1316&originalType=binary&size=178770&status=done&style=none&width=658" width="658" />

函数拿到的 event 值如下。

```json
{
  "body": "{\"c\":\"b\"}",
  "headers": {
    "accept": "*/*",
    "cache-control": "no-cache",
    "user-agent": "PostmanRuntime/7.24.1",
    "postman-token": "feb51b11-9103-463a-92ff-73076d37b683",
    "accept-encoding": "gzip, deflate, br",
    "content-type": "application/x-www-form-urlencoded"
  },
  "httpMethod": "POST",
  "isBase64Encoded": false,
  "path": "/api/321",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

函数结果。

```typescript
ctx.request.body; // {"c":"b"}   => object
```

### 入参映射的 POST

网关配置选择入参映射之后，body 数据类型有两种选择。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593186831907-7975c65c-aee5-4f96-9ae4-ffaeee66c7dd.png#height=179&id=KonHW&margin=%5Bobject%20Object%5D&name=image.png&originHeight=358&originWidth=1112&originalType=binary&size=117003&status=done&style=none&width=556" width="556" />

一旦选了映射，整个函数拿到的 Headers 中就 **没有了 content-type**。

这个时候，网关的返回 event 为

```json
{
  "body": "eyJjIjoiYiJ9",
  "headers": {
    "X-Ca-Dashboard-Action": "DEBUG",
    "X-Ca-Dashboard-Uid": "111111",
    "X-Ca-Dashboard-Role": "USER"
  },
  "httpMethod": "POST",
  "isBase64Encoded": true,
  "path": "/api/321",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

函数由于默认没有拿到 header 头，只会对 base64 的结果做处理，结果为字符串。

```typescript
ctx.request.body; // '{"c":"b"}'   => string
```

## 阿里云 HTTP 触发器

函数提供的 HTTP 触发器（和网关不同）。

### 普通 POST（application/json)

验证代码如下。

```typescript
const body = this.ctx.request.body;
return {
  type: typeof body,
  body,
};
```

字符串格式。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593321679770-a7609684-ec5e-4f93-99f2-d346ed79c1fa.png#height=426&id=ny1FQ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=426&originWidth=1154&originalType=binary&size=33111&status=done&style=none&width=1154" width="1154" />

```typescript
ctx.request.body; // "bbb"   => string
```

JSON 格式

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593321730423-f9b2860f-7902-4f3a-81cf-bfbcfd4ee57f.png#height=431&id=Vz8q7&margin=%5Bobject%20Object%5D&name=image.png&originHeight=431&originWidth=1074&originalType=binary&size=34435&status=done&style=none&width=1074" width="1074" />

```typescript
ctx.request.body; // {"b":"c"}   => object
```

### 表单（application/x-www-form-urlencoded)

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593321823455-23ec3970-35a5-4746-8995-d9146eaa4ab0.png#height=387&id=qxW8I&margin=%5Bobject%20Object%5D&name=image.png&originHeight=387&originWidth=1310&originalType=binary&size=36914&status=done&style=none&width=1310" width="1310" />

```typescript
ctx.request.body; // {"b":"c"}   => object
```

### 文件上传（Binary)

暂未支持

## 腾讯云网关

腾讯云提供单独网关。

### 普通 POST（application/json)

验证代码如下。

```typescript
const body = this.ctx.request.body;
return {
  type: typeof body,
  body,
};
```

使用 Postman 请求。

字符串格式，正常解析。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593323223487-c4e5f365-b500-4a2d-85e3-45bd4aba4653.png#height=1094&id=BcYdP&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1094&originWidth=1486&originalType=binary&size=79437&status=done&style=none&width=1486" width="1486" />

```typescript
ctx.request.body; // "bbb"   => string
```

JSON 格式，能正常解析。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593323187488-e7b4e32e-4195-404d-b309-ba436c3f5f8e.png#height=1072&id=Wf7Tf&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1072&originWidth=1312&originalType=binary&size=76807&status=done&style=none&width=1312" width="1312" />

```typescript
ctx.request.body; // {"c":"b"}   => object
```

### 表单（application/x-www-form-urlencoded)

正常解析为 JSON。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1593323279728-983fd844-f37d-419b-90f3-f96d1ee8236d.png#height=686&id=nOyZ8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=686&originWidth=1556&originalType=binary&size=75708&status=done&style=none&width=1556" width="1556" />

```typescript
ctx.request.body; // {"c":"b"}   => object
```
