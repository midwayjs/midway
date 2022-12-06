interface BaseCaptchaOptions {
  // 验证码长度，默认4
  size?: number;
  // 干扰线条的数量，默认1
  noise?: number;
  // 宽度、高度
  width?: number;
  height?: number;
}

export interface CaptchaOptions extends BaseCaptchaOptions {
  default?: BaseCaptchaOptions;
  image?: ImageCaptchaOptions;
  formula?: FormulaCaptchaOptions;
  text?: TextCaptchaOptions;
  // 验证码过期时间，默认为 1h
  expirationTime?: number;
  // 验证码key 前缀
  idPrefix?: string;
}

export interface ImageCaptchaOptions extends BaseCaptchaOptions {
  type?: 'number'|'letter'|'mixed';
}

export interface FormulaCaptchaOptions extends BaseCaptchaOptions {}

export interface TextCaptchaOptions {
  size?: number;
  type?: 'number'|'letter'|'mixed';
}