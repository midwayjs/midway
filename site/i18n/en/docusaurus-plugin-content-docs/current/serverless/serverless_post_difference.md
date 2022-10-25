# Serverless trigger POST case differences

## alibaba cloud API gateway

Alibaba Cloud API Gateway supports different types of POST requests.

### POST of entering and passing through

The gateway configuration is as follows.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593175823751-f9b305fc-ddeb-4b04-ba13-481a616be260.png)

The event feature of gateway pass-through has a `body` field and the `isBase64Encoded` is true. It is easy to decode and directly solve base64.

:::info
After passing through, all the results are handed over to the function for processing.
:::

#### Example 1 (text/html)

The following event is the simplest pass-through example. Because the `content-type` is `text/html`, the base64 decoding result passed by the body is also a string.

```json
{
  "body": "eyJjIjoiYiJ9 ",
  "headers": {
    "x-ca-dashboard-action": "DEBUG ",
    "x-ca-dashboard-uid": "125087",
    "x-ca-stage": "RELEASE ",
    "x-ca-dashboard-role": "USER ",
    "user-agent": "Apache-HttpClient/4.5.6 (Java/1.8.0_172) ",
    "accept-encoding": "gzip,deflate ",
    "content-md5": "Kry+hjKjc2lvIrwoJqdY9Q== ",
    "content-type": "text/html; charset=utf-8"
  },
  "httpMethod": "POST ",
  "isBase64Encoded": true
  "path": "/api/321 ",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

function result.

```typescript
ctx.request.body; // '{"c":" B "}' => string
```

#### Example 2 (application/json)

If the `content-type` is `application/json`, the framework is considered to be JSON and will be automatically used by JSON.parse.

```json
{
  "body": "eyJjIjoiYiJ9 ",
  "headers": {
    "X-Ca-Dashboard-Action": "DEBUG ",
    "X-Ca-Dashboard-Uid": "125087",
    "X-Ca-Stage": "RELEASE ",
    "X-Ca-Dashboard-Role": "USER ",
    "User-Agent": "Apache-HttpClient/4.5.6 (Java/1.8.0_172) ",
    "Accept-Encoding": "gzip,deflate ",
    "Content-MD5": "Kry+hjKjc2lvIrwoJqdY9Q== ",
    "Content-Type": "application/json; charset=utf-8"
  },
  "httpMethod": "POST ",
  "isBase64Encoded": true
  "path": "/api/321 ",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

function result.

```typescript
ctx.request.body; // {"c":" B "} => object
```

#### Example 3 (application/x-www-form-urlencoded)

If the `content-type` is set to `application/x-www-form-urlencoded`, the gateway will not pass through in base64 format. This is also the default submission type for front-end native forms.

:::info
In the API gateway side test, keeping the "in-reference pass", it seems to have no effect, so I switched to the Postman to test.
:::

The Postman simulation request is as follows:

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593188653464-2a5659de-40ad-4611-ba86-f5754c7d4425.png)

The event value obtained by the function is as follows.

```json
{
  "body": "{\"c\":\" B \"}",
  "headers": {
    "accept": "*/*",
    "cache-control": "no-cache",
    "user-agent": "PostmanRuntime/7.24.1",
    "postman-token": "feb51b11-9103-463a-92ff-73076d37b683",
    "accept-encoding": "gzip, deflate, br",
    "content-type": "application/x-www-form-urlencoded"
  },
  "httpMethod": "POST",
  "isBase64Encoded": false
  "path": "/api/321 ",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

function result.

```typescript
ctx.request.body; // {"c":" B "} => object
```

### POST of input parameter mapping

After the gateway configuration selects input parameter mapping, there are two types of body data.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593186831907-7975c65c-aee5-4f96-9ae4-ffaeee66c7dd.png)

Once the mapping is selected, there is **no content-type** in the Headers the entire function gets.

At this time, the return event of the gateway is

```json
{
  "body": "eyJjIjoiYiJ9 ",
  "headers": {
    "X-Ca-Dashboard-Action": "DEBUG ",
    "X-Ca-Dashboard-Uid": "111111",
    "X-Ca-Dashboard-Role": "USER"
  },
  "httpMethod": "POST ",
  "isBase64Encoded": true
  "path": "/api/321 ",
  "pathParameters": {
    "userId": "321"
  },
  "queryParameters": {}
}
```

Because the function does not get the header by default, it only processes the base64 result, and the result is a string.

```typescript
ctx.request.body; // '{"c":" B "}' => string
```

## Alibaba Cloud HTTP Trigger

The HTTP trigger provided by the function (different from the gateway).

### Ordinary POST(application/json)

The verification code is as follows.

```typescript
const body = this.ctx.request.body;
return {
  type: typeof body
  body
};
```

String format.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593321679770-a7609684-ec5e-4f93-99f2-d346ed79c1fa.png)

```typescript
ctx.request.body; // "bbb" => string
```

JSON format

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593321730423-f9b2860f-7902-4f3a-81cf-bfbcfd4ee57f.png)

```typescript
ctx.request.body; // {" B":"c"} => object
```

### Form (application/x-www-form-urlencoded)

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593321823455-23ec3970-35a5-4746-8995-d9146eaa4ab0.png)

```typescript
ctx.request.body; // {" B":"c"} => object
```

### File upload (Binary)

Not yet supported

## Tencent Cloud Gateway

Tencent Cloud provides a separate gateway.

### Ordinary POST(application/json)

The verification code is as follows.

```typescript
const body = this.ctx.request.body;
return {
  type: typeof body
  body
};
```

Use Postman requests.

string format, normal parsing.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593323223487-c4e5f365-b500-4a2d-85e3-45bd4aba4653.png)

```typescript
ctx.request.body; // "bbb" => string
```

JSON format, can be parsed normally.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593323187488-e7b4e32e-4195-404d-b309-ba436c3f5f8e.png)


```typescript
ctx.request.body; // {"c":" B "} => object
```

### Form (application/x-www-form-urlencoded)

Normal parses to JSON.

![](https://cdn.nlark.com/yuque/0/2020/png/501408/1593323279728-983fd844-f37d-419b-90f3-f96d1ee8236d.png)

```typescript
ctx.request.body; // {"c":" B "} => object
```
