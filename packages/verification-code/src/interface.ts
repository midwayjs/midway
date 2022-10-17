interface BaseVerificationCodeOptions {
  // 验证码长度，默认4
  size?: number;
  // 干扰线条的数量，默认1
  noise?: number;
  // 宽度、高度
  width?: number;
  height?: number;
}

export interface VerificationCodeOptions extends BaseVerificationCodeOptions {
  image?: ImageVerificationCodeOptions;
  formula?: FormulaVerificationCodeOptions;
  text?: TextVerificationCodeOptions;
  // 验证码过期时间，默认为 1h
  expirationTime?: number;
  // 验证码key 前缀
  idPrefix?: string;
}

export interface ImageVerificationCodeOptions extends BaseVerificationCodeOptions {
  type?: 'number'|'letter'|'mixed';
}

export interface FormulaVerificationCodeOptions extends BaseVerificationCodeOptions {}

export interface TextVerificationCodeOptions {
  size?: number;
  type?: 'number'|'letter'|'mixed';
}