import { CaptchaOptions } from '../interface';

export default {
  captcha: {
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
  } as CaptchaOptions,
  cacheManager: {
    clients: {
      captcha: {
        store: 'memory',
      },
    },
  },
};
