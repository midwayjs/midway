import { ConfigObject } from 'svg-captcha-fixed';

export interface CaptchaCacheOptions {
  // 验证码过期时间，单位秒
  expirationTime?: number;
  // 验证码 key 前缀
  idPrefix?: string;
}

export interface CaptchaOptions extends CaptchaCacheOptions {
  default?: ConfigObject;
  image?: ImageCaptchaOptions;
  formula?: FormulaCaptchaOptions;
  text?: TextCaptchaOptions;
}

export interface ImageCaptchaOptions extends ConfigObject {
  type?: 'number'|'letter'|'mixed';
}

export interface FormulaCaptchaOptions extends ConfigObject {}

export interface TextCaptchaOptions {
  size?: number;
  type?: 'number'|'letter'|'mixed';
}
