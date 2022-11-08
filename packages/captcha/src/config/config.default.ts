import { CaptchaOptions } from '../interface';

export const captcha: CaptchaOptions = {
  default: {
    size: 4,
    noise: 1,
    width: 120,
    height: 40,
  },
  image: {
    type: 'mixed',
  },
  formula: {},
  text: {},
  expirationTime: 3600,
  idPrefix: 'midway:vc',
};
