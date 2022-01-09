---
title: 小程序一体化
---

小程序一体化是 Midway.js 团队与 Rax 团队合作的产品，通过 Midway.js 对一体化的支持与 Rax 对小程序的支持，我们可以为小程序带去更好的研发体验。

##

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630379244981-d18b59d3-e27d-455e-8562-0eb7e370f6b9.png#clientId=uae0cc9ff-b84a-4&from=paste&height=1080&id=u4a272148&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1080&originWidth=1920&originalType=binary&ratio=1&size=108701&status=done&style=stroke&taskId=u4b884bcc-4e76-4311-93fe-877bb69b911&width=1920" width="1920" />

## 初始化

在命令行输入以下命令，即可快速完成小程序一体化项目的创建。

```bash
npm init rax
```

选择 App -> 小程序云开发一体化应用即可。
​

## 本地开发

> 以微信小程序开发为例

​

项目创建完成后，进入项目根目录。

### 配置 AppId

小程序的运行与预览依赖于 AppId（[获取方式](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html#%E7%94%B3%E8%AF%B7%E5%B8%90%E5%8F%B7)），获取到 AppID 时，你可以打开项目根目录的 build.json 文件，将 AppId 配置在此。

```json
{
  "targets": [
    //...
  ],
  "plugins": [
    //...
  ],
  "wechat-miniprogram": {
    "nativeConfig": {
      "appid": "<你的 AppID>",
      "name": "nativeConfig 是用户配置 project.config.json 的地方"
    }
  }
}
```

### 本地启动

运行如下命令。
​

```java
npm start
```

​

本地服务启动后将输出以下日志。
​

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630379551910-f8a43b3b-0017-4aad-b5f8-5eca9056f4df.png#clientId=uae0cc9ff-b84a-4&from=paste&height=326&id=uc1e5095d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=326&originWidth=981&originalType=binary&ratio=1&size=56255&status=done&style=stroke&taskId=u26c58d5b-51ea-487b-906f-0484e4bd264&width=981" width="981" />

### 目录结构

整体目录结构如下

- src：前端开发目录
- src/cloud：云开发目录
- src/cloud/functions：云函数目录

​

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630379466121-ef63511d-4a9a-441a-846d-6c80912f3bd8.png#clientId=uae0cc9ff-b84a-4&from=paste&height=1124&id=lhHzc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1124&originWidth=2272&originalType=binary&ratio=1&size=363965&status=done&style=stroke&taskId=uf9b75197-be74-4d6d-b23d-4142578e747&width=2272" width="2272" />

### 使用小程序开发工具预览

打开微信小程序开发者工具，选择导入项目，微信小程序的目录是 <项目根目录>/build/wechat-miniprogram.

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630381124950-fd510d0e-fd14-42e3-a01a-6efa92be1ea2.png#clientId=u5ad910ea-f37d-4&from=paste&height=909&id=ufe8e37e3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=909&originWidth=1708&originalType=binary&ratio=1&size=125292&status=done&style=none&taskId=ud11606b5-14a1-42d3-9cd2-f09afba9eeb&width=1708" width="1708" />

你可以在此处预览项目，并进行函数的部署与发布工作。
​

### 开发函数

使用 Midway Hooks 可以方便的开发云函数。
​

> 以获取 OpenId 为例。

```typescript
export const getOpenId = async () => {
  const wechatContext = cloud.getWXContext();

  return {
    openId: wechatContext.OPENID,
  };
};
```

​

> 前端调用代码（需要提前安装 rax-use-async-effect 依赖）

```typescript
import { createElement, useState } from 'rax';
import useAsyncEffect from 'rax-use-async-effect';
import View from 'rax-view';
import Text from 'rax-text';
import styles from './index.module.css';
import Logo from '../../components/Logo';
import { hello, getOpenId } from '@/cloud/function';

export default function Home() {
  const [message, setMessage] = useState('');
  const [openId, setOpenId] = useState('');

  useAsyncEffect(async () => {
    const message = await hello('Rax', 'Midway.js');
    setMessage(message);

    const { openId } = await getOpenId();
    setOpenId(`${openId!.substring(0, 3)}***************${openId!.substring(14)}`);
  }, []);

  return (
    <View className={styles.homeContainer}>
      <Logo uri="//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png" />
      <Text className={styles.homeTitle}>Welcome to Your Rax App</Text>
      <Text className={styles.homeInfo}>Message: {message}</Text>
      <Text className={styles.homeInfo}>OpenId: {openId}</Text>
    </View>
  );
}
```

​

Midway Hooks 相关的语法和文档可参考：
[介绍](/docs/hooks_intro?view=doc_embed)​

### 函数部署

云开发的函数需要部署后才能调用，你可以在生成的 cloudfunctions 目录下，通过右键点击上传部署函数。
​

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630381168629-1871ca82-65b7-45d4-9625-3b3cb12327b8.png#clientId=u5ad910ea-f37d-4&from=paste&height=220&id=u9070ab28&margin=%5Bobject%20Object%5D&name=image.png&originHeight=220&originWidth=611&originalType=binary&ratio=1&size=42440&status=done&style=none&taskId=u87382ca9-543b-4541-8748-12e0e7eb4be&width=611" width="611" />

部署完成后重新编译项目即可查看函数运行结果，更多的云开发指导，可以参考官方文档：
​

### 本地调试

你可以方便的通过小程序开发工具来进行函数调试，如下图所示。

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1630381412803-f33ed7ef-c043-4a96-bcbf-40d308c4b523.png#clientId=u5ad910ea-f37d-4&from=paste&height=794&id=uf83f1005&margin=%5Bobject%20Object%5D&name=image.png&originHeight=794&originWidth=1752&originalType=binary&ratio=1&size=490406&status=done&style=none&taskId=u7623c3c6-3c12-4d40-bbb0-8e4a0544197&width=1752" width="1752" />

参考文档：

## 项目部署

在完成开发后，即可开始发布小程序，后续参考云开发平台的发布文档即可。
​

小程序发布：
​
