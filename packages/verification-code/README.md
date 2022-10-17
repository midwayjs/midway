## Verification Code 验证码组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用验证码组件，支持图片验证码

### Usage

1. 安装依赖
```shell
tnpm i @midwayjs/verification-code --save
```
2. 在 configuration 中引入组件,
```ts
import * as VerufucationCode from '@midwayjs/verification-code';
@Configuration({
  imports: [
    // ...other components
    VerufucationCode
  ],
})
export class AutoConfiguration {}
```

3. 在代码中使用
```ts
import { VerificationCodeService } from '@midwayjs/verification-code';
@Controller('/')
export class HomeController {

  @Inject()
  verificationService: VerificationCodeService;

  // 获取图像验证码
  @Get('/get-image-verification-code')
  async getImageVerificationCode() {
    const { id, imageBase64 } = await this.verificationService.image();
    return {
      id,
      imageBase64,
    }
  }

  @Post('/check-verification-code')
  async getVerificationCode() {
    // 验证验证码是否正确
    const passed = await this.verificationService.check(id, answer);
    if (passed) {
      return 'passed';
    }
    return 'error';
  }

  // 将任意文本内容塞入验证码中
  @Get('/test-text')
  async testText() {
    // 存入内容，获取验证码id
    const id = await this.verificationService.set ('test');
    // 根据验证码id，校验内容是否正确
    const passed = await this.verificationService.check(id, 'test');
    return {
      passed,
    }
  }
}
```


### 配置
```ts
export const verificationCode = {
  
}
```
