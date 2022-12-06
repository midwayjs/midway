# Captcha

Universal captcha components for `@midwayjs/faas` , `@midwayjs/web` , `@midwayjs/koa` and `@midwayjs/express` frameworks, support `image captcha`, `calculation expression` and other types of verification codes.

You can also use this component to implement verification capabilities such as `SMS verification code`, `Email verification code`, but note that this component itself does not contain the function of sending SMS messages and emails.

Related information:

| Description                         |      |
| ----------------------------------- | ---- |
| Can be used for standard projects   | ✅    |
| Can be used for Serverless          | ✅    |
| Can be used for integration         | ✅    |
| Contains independent main framework | ❌    |
| Contains independent logs           | ❌    |



## Install dependencies

```bash
$ npm i @midwayjs/captcha@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/captcha": "^3.0.0",
    // ...
  },
}
```

## Enable components

Import components in `src/configuration.ts`.

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

## Call service

```typescript
import { CaptchaService } from '@midwayjs/captcha';
@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Inject()
  captchaService: CaptchaService;

  // Example: Get Image Captcha
  @Get('/get-image-captcha')
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.image({ width: 120, height: 40 });
    return {
      id,          // verification code id
      imageBase64, // The base64 data of the captcha SVG image can be directly put into the img tag of the front end
    }
  }

  // Example: Get Calculation Expression Verification Code
  @Get('/get-formula-captcha')
  async getFormulaCaptcha() {
    const { id, imageBase64 } = await this.captchaService.formula({ noise: 1 });
    return {
      id,          // verification code id
      imageBase64, // The base64 data of the captcha SVG image can be directly put into the img tag of the front end
    }
  }

  // Verify that the verification code is correct
  @Post('/check-captcha')
  async getCaptcha() {
    const { id, answer } = this.ctx.request.body;
    const passed: boolean = await this.captchaService.check(id, answer);
    if (passed) {
      return 'passed';
    }
    return 'error';
  }

  // Example: SMS verification code
  @Post('/sms-code')
  async sendSMSCode() {
    // Verify that the verification code is correct
    const { id, text: code } = await this.captchaService.text({ size: 4 });
    await sendSMS(18888888888, code);
    return { id }
  }

  // Example: Email verification code
  @Post('/email-code')
  async sendEmailCode() {
    // Verify that the verification code is correct
    const { id, text: code } = await this.captchaService.text({ type: 'number'});
    await sendEmail('admin@example.com', code);
    return { id }
  }

   // Example: Stuffing arbitrary text content into a captcha
  @Get('/test-text')
  async testText() {
    // Save the content and get the verification code id
    const id: string = await this.captchaService.set('123abc');
    // According to the verification code id, verify whether the content is correct
    const passed: boolean = await this.captchaService.check(id, '123abc');
    return {
      passed: passed === true,
    }
  }
}
```

## Available configurations

```typescript
interface CaptchaOptions {
  default?: { // default config
    // The number of interference lines, the default is 1
    noise?: number;
    // width, default is 120px
    width?: number;
    // width, default is 40px
    height?: number;
    // Graphic verification code configuration, the graphic contains some characters
  },
  image?: {
    // Verification code character length, default 4 characters
    size?: number;
    // The character type in the image verification code, the default is 'mixed'
    // - 'mixed' means 0-9, A-Z and a-z
    // - 'letter' means A-Z and a-z
    // - 'number' means 0-9
    type?: 'mixed',
    // The number of interference lines, the default is 1
    noise?: number;
    // width, default is 120px
    width?: number;
    // width, default is 40px
    height?: number;
  },
  // Calculation formula verification code configuration, for example, the returned image content is 1+2, the user needs to fill in 3
  formula?: {
     // The number of interference lines, the default is 1
    noise?: number;
    // width, default is 120px
    width?: number;
    // width, default is 40px
    height?: number;
  },
  // Plain text verification code configuration, based on the plain text verification code, SMS verification code and email verification code can be implemented
  text?: {
    // Verification code character length, default 4 characters
    size?: number;
    // The character type in the image verification code, the default is 'mixed'
    // - 'mixed' means 0-9, A-Z and a-z
    // - 'letter' means A-Z and a-z
    // - 'number' means 0-9
    type?: 'mixed',
  },
  // Verification code expiration time, the default is 1h
  expirationTime?: 3600,
  // key prefix stored in verification code
  idPrefix: 'midway:vc',
}

export const captcha: CaptchaOptions = {
  default: { // default config
    size: 4,
    noise: 1,
    width: 120,
    height: 40,
  },
  image: { // Will merge default configuration
    type: 'mixed',
  },
  formula: {}, // Will merge default configuration
  text: {}, // Will merge default configuration
  expirationTime: 3600,
  idPrefix: 'midway:vc',
}
```

### Configuration Example 1

Get an image captcha code containing `5 pure English letters`. The image's width  is `200` pixels, the height is `50` pixels, and it contains `3` noise lines.

Because the configuration of the image captcha code(`image`) will be merged with the `default` configuration, so you can only modify the `default` configuration:

```typescript
export const captcha: CaptchaOptions = {
  default: {
    size: 5,
    noise: 3,
    width: 200,
    height: 50
  },
  image: {
    type: 'letter'
  }
}
```
Of course, you can also configure the width, height, etc. in the `image` configuration, `without` modifying the default configuration to achieve the `same` effect：
```typescript
export const captcha: CaptchaOptions = {
  image: {
    size: 5,
    noise: 3,
    width: 200,
    height: 50
    type: 'letter'
  }
}
```

### Configuration Example 2

Get a formula captcha code, which width  is `100` pixels, the height is `60` pixels, and it contains `2` noise lines.

Because the configuration of the formula captcha codewill be merged with the `default` configuration, so you can only modify the `default` configuration:

```typescript
export const captcha: CaptchaOptions = {
  default: {
    noise: 2,
    width: 100,
    height: 60
  },
}
```
Of course, you can also configure the width, height, etc. in the `formula` configuration, `without` modifying the default configuration to achieve the `same` effect:

```typescript
export const captcha: CaptchaOptions = {
  formula: {
    noise: 2,
    width: 100,
    height: 60
  }
}
```

## Effect

**Picture verification code**

![图片验证码](https://gw.alicdn.com/imgextra/i4/O1CN014cEzLH23vEniOgoyp_!!6000000007317-2-tps-120-40.png)

**Calculation expression**

 ![计算表达式](https://gw.alicdn.com/imgextra/i4/O1CN01u3Mj0q24lRx1md9pX_!!6000000007431-2-tps-120-40.png)