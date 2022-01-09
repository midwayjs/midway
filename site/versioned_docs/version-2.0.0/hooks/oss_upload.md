---
title: OSS 文件上传
---

由于函数网关的问题，文件无法直传至函数，但我们也提供了两种方式来解决文件上传的问题。

## 【推荐】后端生成加密地址，前端上传

OSS 上传目前采用阿里云提供的开源包「ali-oss」，npm 包地址：[https://www.npmjs.com/package/ali-oss](https://www.npmjs.com/package/ali-oss)

### 安装

> 安装依赖

```bash
npm i ali-oss -S && npm i @types/ali-oss -D
```

### 阿里云 OSS 配置

客户端进行表单直传到 OSS 时，会从浏览器向 OSS 发送带有`Origin`的请求消息。OSS 对带有`Origin`头的请求消息会进行跨域规则（CORS）的验证，因此需要为 Bucket 设置跨域规则以支持 Post 方法

1. 登录[OSS 管理控制台](https://oss.console.aliyun.com/)。
1. 单击**Bucket 列表**，之后单击目标 Bucket 名称。
1. 单击**权限管理 > 跨域设置**，在**跨域设置**区域单击**设置**。
1. 单击**创建规则**，配置如下图所示。

[
<img src="https://cdn.nlark.com/yuque/0/2020/png/98602/1607502650388-1a12351a-99f3-4099-87b4-830d8f700681.png#height=866&id=BlST2&originHeight=866&originWidth=688&originalType=binary&size=0&status=done&style=none&width=688" width="688" />
](https://static-aliyun-doc.oss-cn-hangzhou.aliyuncs.com/assets/img/zh-CN/1152398851/p12308.png)

### 后端代码

```javascript
// src/apis/lambda/index.ts
/**
 *
 * @param params Object {filename: 编码后文件名称}
 */
export async function getOSSUploadUrl(params: { filename: string }) {
  const { filename } = params;
  const dir = 'user-dir-prefix/'; // OSS 文件根目录

  const client = new OSS({
    region: '<oss region>', // 这里需要修改成你自己的 region
    accessKeyId: '<Your accessKeyId>', // 这里需要修改成你自己的 accessKeyId
    accessKeySecret: '<Your accessKeySecret>', // 这里需要修改成你自己的 accessKeySecret
    bucket: '<Your bucket name>', // 这里需要修改成你自己的 bucket
    secure: true,
  });

  const url = client.signatureUrl(dir + decodeURIComponent(filename), {
    method: 'PUT',
    'Content-Type': 'application/octet-stream',
  });

  return url;
}
```

### 前端代码

```javascript
import React, { useEffect, useState } from 'react';
import { getOSSUploadUrl } from '../../apis/lambda';

export default () => {
  const [message, setMessage] = useState('');
  useEffect(() => {}, []);

  const uploadPhoto = (e: any) => {
    const file = e.target.files[0];
    const filename = encodeURIComponent(file.name);

    getOSSUploadUrl({ filename }).then((url) => {
      const contentType = 'application/octet-stream';
      const body = new Blob([file], { type: contentType });

      fetch(url, {
        method: 'PUT',
        headers: new Headers({ 'Content-Type': contentType }),
        body,
      })
        .then((res) => {
          setMessage(`上传成功！文件路径：${url.substring(0, url.indexOf('?'))}`);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  };

  return (
    <div className="common-container">
      <>
        <p>上传文件，可以在accept属性中控制想要传的文件类型</p>
        <input onChange={uploadPhoto} type="file" accept="*" />
      </>
      <p>{message}</p>
    </div>
  );
};
```

### 注意事项

获取上传文件地址的时候有很多的权限设置可以在 阿里云的 OSS 控制台设置，如果返回的 url 在页面中打不开，那么需要在 OSS 控制台授权

<img src="https://cdn.nlark.com/yuque/0/2020/png/98602/1607502650376-2efc20dd-6387-42e5-a8ec-21543f6fa751.png#height=179&id=NebVF&margin=%5Bobject%20Object%5D&name=image.png&originHeight=358&originWidth=2194&originalType=binary&size=119122&status=done&style=none&width=1097" width="1097" />

## 前端 OSS SDK 直传

小文件（大小 < 3m）可通过编码至 base64 上传，大文件请采用前端 OSS 的方式上传。参考文档：[OSS Browser.js SDK](https://help.aliyun.com/document_detail/64041.html?spm=a2c4g.11174283.6.1332.75c17da2VHuApP)

前端 OSS SDK 可能会有泄露 access key 与 sercet key 的问题，推荐配合 [阿里云临时安全令牌（Security Token Service，STS）](https://help.aliyun.com/document_detail/28756.html) 使用。
