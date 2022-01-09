---
title: 非 Serverless 环境使用一体化
---

在 Midway Serverless 2.0 中，我们支持了 Web 全栈应用的开发。

在后续的开发中，你可以将你的 Web 应用部署至任意的服务器，来为用户提供服务。

## 项目创建

请先安装 `@midwayjs/cli`。

```bash
# 如果是 npm v6
$ npm init midway --type=koa-hooks-react my_app

# 如果是 npm v7
$ npm init midway -- --type=koa-hooks-react my_app

$ cd my_app
```

## 目录结构

> 生成后的目录结构如下

```
.
├── bootstrap.js // 应用启动
├── index.html
├── jest.config.js
├── midway.config.ts // Midway 配置文件
├── package.json
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── apis // 后端文件（可在 midway.config.ts 修改）
│   │   ├── configuration.ts
│   │   └── lambda // Api 文件
│   │       ├── index.test.ts
│   │       └── index.ts
│   ├── favicon.svg
│   ├── index.css
│   ├── logo.svg
│   └── main.tsx
├── tsconfig.json
└── vite.config.ts // Vite 配置文件
```

## 本地运行

在项目根目录运行 `npm run dev` 即可启动项目，启动后，Vite 将输入可访问的地址。

> 复制地址到浏览器即可访问

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615534917254-24d943e2-59de-4245-9644-65af606f249e.png#height=148&id=Jyv52&margin=%5Bobject%20Object%5D&name=image.png&originHeight=148&originWidth=366&originalType=binary&ratio=1&size=17073&status=done&style=none&width=366" width="366" />

页面显示如下画面则代表启动成功：

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615534968377-a64836b1-53e7-4cb6-8e28-518ff534d574.png#height=903&id=gpL0D&margin=%5Bobject%20Object%5D&name=image.png&originHeight=903&originWidth=1504&originalType=binary&ratio=1&size=103681&status=done&style=none&width=1504" width="1504" />

你可以修改 /src/apis/lambda 下的函数，尝试极为直观的函数式开发方式与极快的热更新所带来的流畅体验。

## 单元测试

在应用根目录中，你可以运行 `npm run test` 来运行单元测试。

> 单元测试运行截图

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615535886310-db9a293e-0bd3-438e-86b2-e1629144757c.png#height=327&id=VRpGm&margin=%5Bobject%20Object%5D&name=image.png&originHeight=327&originWidth=717&originalType=binary&ratio=1&size=39910&status=done&style=none&width=717" width="717" />

在单元测试中，我们提供了便捷的 runFunction 方法，帮助你快速完成单元测试，就像调用一个普通函数一样。

```typescript
import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import api from '.';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`
      Object {
        "message": "Hello World",
        "method": "GET",
      }
    `);
  });
});
```

## 构建

在项目中，我们也提供了现成的 `npm run build` 命令，来快速构建项目。

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615536615700-9e653c38-6942-49b6-907e-c388fc1c5c1b.png#height=433&id=Upy5S&margin=%5Bobject%20Object%5D&name=image.png&originHeight=433&originWidth=783&originalType=binary&ratio=1&size=67053&status=done&style=none&width=783" width="783" />

构建结束后，可以通过 `node bootstrap.js` 来运行项目。

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615536663706-57b78c22-8bf5-4907-bc01-07f2c346f1d4.png#height=61&id=xAW86&margin=%5Bobject%20Object%5D&name=image.png&originHeight=61&originWidth=672&originalType=binary&ratio=1&size=12895&status=done&style=none&width=672" width="672" />

访问 `http://localhost:7001`，就可以看到页面了。

## 线上部署

在完成后构建后，你可以按你喜欢的方式将应用部署至任意的服务器中。

在此，我们推荐使用 `[pm2](https://www.npmjs.com/package/pm2)` 来启动和管理应用。

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1615536837253-5c2e21ea-626c-4c6b-9a72-3c773ee65500.png#height=209&id=fyPSG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=209&originWidth=902&originalType=binary&ratio=1&size=29305&status=done&style=none&width=902" width="902" />
