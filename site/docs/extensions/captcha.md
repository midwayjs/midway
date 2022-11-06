# 验证码

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用验证码组件，支持 `图片验证码`、`计算表达式` 等类型验证码。

您也可以通过此组件，来实现 `短信验证码`、`邮件验证码` 等验证能力，但是注意，本组件本身不含发送短信、邮件功能。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 安装依赖

```bash
$ npm i @midwayjs/captcha@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/captcha": "^3.0.0",
    // ...
  },
}
```

## 启用组件

在 `src/configuration.ts` 中引入组件。

```typescript
import * as captcha from '@midwayjs/captcha';

@Configuration({
  imports: [
    // ...other components
    captcha
  ],
})
export class MainConfiguration {}
```

## 调用服务

```typescript
import { CaptchaService } from '@midwayjs/captcha';
@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Inject()
  captchaService: CaptchaService;

  // 示例：获取图像验证码
  @Get('/get-image-captcha')
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.image({ width: 120, height: 40 });
    return {
      id,          // 验证码 id
      imageBase64, // 验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内
    }
  }

  // 示例：获取计算表达式验证码
  @Get('/get-formula-captcha')
  async getFormulaCaptcha() {
    const { id, imageBase64 } = await this.captchaService.formula({ noise: 1 });
    return {
      id,          // 验证码 id
      imageBase64, // 验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内
    }
  }

  // 验证验证码是否正确
  @Post('/check-captcha')
  async getCaptcha() {
    const { id, answer } = this.ctx.request.body;
    const passed: boolean = await this.captchaService.check(id, answer);
    if (passed) {
      return 'passed';
    }
    return 'error';
  }

  // 示例：短信验证码
  @Post('/sms-code')
  async sendSMSCode() {
    // 验证验证码是否正确
    const { id, text: code } = await this.captchaService.text({ size: 4 });
    await sendSMS(18888888888, code);
    return { id }
  }

  // 示例：邮件验证码
  @Post('/email-code')
  async sendEmailCode() {
    // 验证验证码是否正确
    const { id, text: code } = await this.captchaService.text({ type: 'number'});
    await sendEmail('admin@example.com', code);
    return { id }
  }

   // 示例：将任意文本内容塞入验证码中
  @Get('/test-text')
  async testText() {
    // 存入内容，获取验证码id
    const id: string = await this.captchaService.set('123abc');
    // 根据验证码id，校验内容是否正确
    const passed: boolean = await this.captchaService.check(id, '123abc');
    return {
      passed: passed === true,
    }
  }
}
```

## 可用配置

```typescript
interface CaptchaOptions {
  // 干扰线条的数量，默认 1 条
  noise?: number;
  // 宽度，默认为 120 像素
  width?: number;
  // 宽度，默认为 40 像素
  height?: number;
  // 图形验证码配置，图形中包含一些字符
  image?: {
    // 验证码字符长度，默认 4 个字符
    size?: number;
    // 图像验证码中的字符类型，默认为 'mixed'
    // - 'mixed' 表示 0-9、A-Z 和 a-z
    // - 'letter' 表示 A-Z 和 a-z
    // - 'number' 表示 0-9
    type?: 'mixed',
    // 干扰线条的数量，默认 1 条
    noise?: number;
    // 宽度，默认为 120 像素
    width?: number;
    // 宽度，默认为 40 像素
    height?: number;
  },
  // 计算公式验证码配置，例如返回的图像内容为 1+2，需要用户填入 3
  formula?: {
     // 干扰线条的数量，默认 1 条
    noise?: number;
    // 宽度，默认为 120 像素
    width?: number;
    // 宽度，默认为 40 像素
    height?: number;
  },
  // 纯文本验证码配置，基于纯文本验证码可以实现短信验证码、邮件验证码
  text?: {
    // 验证码字符长度，默认 4 个字符
    size?: number;
    // 图像验证码中的字符类型，默认为 'mixed'
    // - 'mixed' 表示 0-9、A-Z 和 a-z
    // - 'letter' 表示 A-Z 和 a-z
    // - 'number' 表示 0-9
    type?: 'mixed',
  },
  // 验证码过期时间，默认为 1h
  expirationTime?: 3600,
  // 验证码存储的 key 前缀
  idPrefix: 'midway:vc',
}

export const captcha: CaptchaOptions = {
  size: 4,
  noise: 1,
  width: 120,
  height: 40,
  image: {      // 会合并 captcha 的 size 等配置
    type: 'mixed',
  },
  formula: {},  // 会合并 captcha 的 size 等配置
  text: {},     // 会合并 captcha 的 size 等配置
  expirationTime: 3600,
  idPrefix: 'midway:vc',
}
```

验证码的内容存储基于 `@midwayjs/cache`，默认是在 `memory` 中存储，如果要替换为 `redis` 或其他服务，请参照 `@midwayjs/cache` 的[文档](/docs/extensions/cache），对 cache 进行配置。


## 效果

**图片验证码**

![图片验证码](https://gw.alicdn.com/imgextra/i4/O1CN014cEzLH23vEniOgoyp_!!6000000007317-2-tps-120-40.png)

**计算表达式**

 ![计算表达式](https://gw.alicdn.com/imgextra/i4/O1CN01u3Mj0q24lRx1md9pX_!!6000000007431-2-tps-120-40.png)
